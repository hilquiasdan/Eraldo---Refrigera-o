import express from 'express';
import { query, queryOne } from '../db/pool.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errors.js';

const router = express.Router();

router.use(authRequired);

router.get(
  '/kpis',
  asyncHandler(async (req, res) => {
    // Hoje
    const hoje = await queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'paga' THEN 1 ELSE 0 END) AS pagas,
         SUM(CASE WHEN status = 'aberta' THEN 1 ELSE 0 END) AS abertas,
         COALESCE(SUM(CASE WHEN status != 'cancelada' THEN total ELSE 0 END), 0) AS receita
       FROM notas
       WHERE DATE(data_emissao) = CURDATE()`
    );

    // Ontem (pra calcular variação)
    const ontem = await queryOne(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(CASE WHEN status != 'cancelada' THEN total ELSE 0 END), 0) AS receita
       FROM notas
       WHERE DATE(data_emissao) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
    );

    // Clientes
    const clientes = await queryOne(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS novos_semana
       FROM clientes`
    );

    // Mecânicos
    const mecanicos = await queryOne(
      `SELECT
         SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS ativos,
         COUNT(*) AS total
       FROM mecanicos`
    );

    const ticketMedio = hoje.total > 0 ? Number(hoje.receita) / Number(hoje.total) : 0;

    const variacao = (atual, anterior) => {
      atual = Number(atual || 0);
      anterior = Number(anterior || 0);
      if (anterior === 0) return atual > 0 ? 100 : 0;
      return ((atual - anterior) / anterior) * 100;
    };

    res.json({
      notas_hoje: {
        total: Number(hoje.total),
        pagas: Number(hoje.pagas),
        abertas: Number(hoje.abertas),
        variacao: variacao(hoje.total, ontem.total),
      },
      receita_hoje: {
        total: Number(hoje.receita),
        ticket_medio: ticketMedio,
        variacao: variacao(hoje.receita, ontem.receita),
      },
      clientes: {
        total: Number(clientes.total),
        novos_semana: Number(clientes.novos_semana),
      },
      mecanicos: {
        ativos: Number(mecanicos.ativos),
        total: Number(mecanicos.total),
      },
    });
  })
);

router.get(
  '/faturamento',
  asyncHandler(async (req, res) => {
    const dias = Math.min(Number(req.query.dias) || 30, 365);
    const rows = await query(
      `SELECT DATE(data_emissao) AS dia,
              COALESCE(SUM(total), 0) AS total
       FROM notas
       WHERE status != 'cancelada'
         AND data_emissao >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(data_emissao)
       ORDER BY dia ASC`,
      [dias - 1]
    );

    // Preenche dias vazios com zero
    const byDay = new Map();
    for (const r of rows) {
      const key = r.dia instanceof Date ? r.dia.toISOString().slice(0, 10) : String(r.dia).slice(0, 10);
      byDay.set(key, Number(r.total));
    }
    const result = [];
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ dia: key, total: byDay.get(key) || 0 });
    }
    res.json(result);
  })
);

router.get(
  '/notas-recentes',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 5, 20);
    const rows = await query(
      `SELECT n.id, n.numero, n.total, n.status, n.data_emissao, c.nome AS cliente_nome,
              (SELECT GROUP_CONCAT(ni.descricao SEPARATOR ' + ')
                FROM nota_itens ni WHERE ni.nota_id = n.id) AS itens_desc
       FROM notas n
       INNER JOIN clientes c ON c.id = n.cliente_id
       ORDER BY n.data_emissao DESC, n.id DESC
       LIMIT ?`,
      [limit]
    );
    res.json(rows);
  })
);

export default router;
