import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { api } from '../../lib/api';
import { formatBRL, formatRelative } from '../../lib/format';
import { LoadingOverlay } from '../../components/ui/Loading';
import { useToast } from '../../hooks/useToast';

function Chart({ data }) {
  if (!data || data.length === 0) return <div className="loading-overlay">Sem dados</div>;
  const values = data.map(d => Number(d.total));
  const max = Math.max(...values, 1);
  const w = 680, h = 220, pad = 28;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => [pad + i * step, h - pad - (Number(d.total) / max) * (h - pad * 2)]);
  const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A9DE0" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#1A9DE0" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line key={i} x1={pad} x2={w - pad} y1={pad + (h - pad * 2) * p} y2={pad + (h - pad * 2) * p}
            stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 4"/>
        ))}
        <path d={area} fill="url(#chartFill)"/>
        <path d={path} stroke="#1A9DE0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map(([x, y], i) => i % 3 === 0 && (
          <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#1A9DE0" strokeWidth="2"/>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: 0, right: 0, textAlign: 'right' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total 30 dias</div>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22 }}>{formatBRL(total)}</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [chart, setChart] = useState(null);
  const [recentes, setRecentes] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [k, c, r] = await Promise.all([
          api.get('/dashboard/kpis'),
          api.get('/dashboard/faturamento?dias=30'),
          api.get('/dashboard/notas-recentes?limit=5'),
        ]);
        setKpis(k);
        setChart(c);
        setRecentes(r);
      } catch (err) {
        toast.error(err.message || 'Falha ao carregar dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !kpis) return <LoadingOverlay/>;

  const trendEl = (v) => {
    const n = Number(v);
    if (isNaN(n) || !isFinite(n)) return null;
    const dir = n >= 0 ? 'up' : 'down';
    const sign = n >= 0 ? '+' : '';
    return (
      <span className={`kpi-trend ${dir}`}>
        <Icon name="trending" size={12}/> {sign}{n.toFixed(0)}%
      </span>
    );
  };

  const cards = [
    {
      icon: 'file', color: 'blue', label: 'Notas emitidas hoje',
      value: String(kpis.notas_hoje.total),
      sub: `${kpis.notas_hoje.pagas} pagas · ${kpis.notas_hoje.abertas} em aberto`,
      trend: kpis.notas_hoje.variacao,
    },
    {
      icon: 'dollar', color: 'green', label: 'Receita de hoje',
      value: formatBRL(kpis.receita_hoje.total),
      sub: `Ticket médio ${formatBRL(kpis.receita_hoje.ticket_medio)}`,
      trend: kpis.receita_hoje.variacao,
    },
    {
      icon: 'users', color: 'navy', label: 'Clientes cadastrados',
      value: kpis.clientes.total.toLocaleString('pt-BR'),
      sub: `${kpis.clientes.novos_semana} novos esta semana`,
    },
    {
      icon: 'wrench', color: 'orange', label: 'Mecânicos ativos',
      value: String(kpis.mecanicos.ativos),
      sub: `de ${kpis.mecanicos.total} cadastrados`,
    },
  ];

  return (
    <div>
      <div className="kpi-grid">
        {cards.map((k, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-row">
              <div className={`kpi-icon ${k.color}`}><Icon name={k.icon} size={22}/></div>
              {k.trend !== undefined && trendEl(k.trend)}
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="panels-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Faturamento - Últimos 30 dias</h3>
              <div className="h-sub">Receita diária em reais</div>
            </div>
            <div className="panel-tabs">
              <button className="panel-tab active">30d</button>
            </div>
          </div>
          <div className="chart-legend">
            <span><span className="dot" style={{ background: '#1A9DE0' }}></span>Receita diária</span>
          </div>
          <Chart data={chart}/>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Últimas notas emitidas</h3>
              <div className="h-sub">5 mais recentes</div>
            </div>
            <button className="panel-tab" onClick={() => navigate('/admin/notas')} style={{ color: 'var(--brand-cyan)' }}>Ver todas →</button>
          </div>
          <div>
            {(recentes || []).map(n => (
              <div className="list-item" key={n.id} onClick={() => navigate(`/admin/notas/${n.id}`)} style={{ cursor: 'pointer' }}>
                <div>
                  <div className="li-head">
                    <span className="li-num">#{String(n.numero).padStart(4, '0')}</span>
                    <span className="li-name">{n.cliente_nome}</span>
                  </div>
                  <div className="li-sub">{n.itens_desc || '—'} · {formatRelative(n.data_emissao)}</div>
                </div>
                <div className="li-right">
                  <div className="li-value">{formatBRL(n.total)}</div>
                  <span className={`li-badge badge-${n.status}`}>
                    {n.status === 'paga' ? 'Paga' : n.status === 'aberta' ? 'Em aberto' : 'Cancelada'}
                  </span>
                </div>
              </div>
            ))}
            {(!recentes || recentes.length === 0) && (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                Nenhuma nota emitida ainda
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="qa-grid">
        <div className="qa-card" onClick={() => navigate('/admin/nota')}>
          <div className="kpi-icon blue"><Icon name="zap" size={22}/></div>
          <div style={{ flex: 1 }}>
            <h4>Nova Nota Rápida</h4>
            <p>Crie uma nota em 3 passos e imprima direto</p>
          </div>
          <Icon name="arrow" size={18} style={{ color: 'var(--brand-cyan)' }}/>
        </div>
        <div className="qa-card" onClick={() => navigate('/admin/clientes?novo=1')}>
          <div className="kpi-icon navy"><Icon name="userPlus" size={22}/></div>
          <div style={{ flex: 1 }}>
            <h4>Cadastrar Cliente</h4>
            <p>Adicione um novo cliente e seus veículos</p>
          </div>
          <Icon name="arrow" size={18} style={{ color: 'var(--brand-cyan)' }}/>
        </div>
      </div>
    </div>
  );
}
