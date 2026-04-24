import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { LoadingOverlay } from '../../components/ui/Loading';
import { api } from '../../lib/api';
import { formatBRL, formatDate } from '../../lib/format';
import { useToast } from '../../hooks/useToast';

function exportCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(';'),
    ...rows.map(r => headers.map(h => {
      const v = r[h] == null ? '' : String(r[h]).replace(/"/g, '""');
      return /[;"\n]/.test(v) ? `"${v}"` : v;
    }).join(';'))
  ].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function RelatoriosPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [status, setStatus] = useState('');
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const run = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('data_inicio', from + ' 00:00:00');
      params.set('data_fim', to + ' 23:59:59');
      if (status) params.set('status', status);
      params.set('limit', '500');
      const data = await api.get(`/notas?${params}`);
      setNotas(data.rows);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { run(); }, []);

  const receita = notas
    .filter(n => n.status !== 'cancelada')
    .reduce((s, n) => s + Number(n.total), 0);
  const pagas = notas.filter(n => n.status === 'paga').length;
  const abertas = notas.filter(n => n.status === 'aberta').length;
  const canceladas = notas.filter(n => n.status === 'cancelada').length;

  const exportar = () => {
    const rows = notas.map(n => ({
      numero: n.numero,
      data: formatDate(n.data_emissao),
      cliente: n.cliente_nome,
      veiculo: n.veiculo_placa ? `${n.veiculo_placa} ${n.veiculo_modelo}` : '',
      mecanico: n.mecanico_nome || '',
      pagamento: n.forma_pagamento,
      status: n.status,
      subtotal: Number(n.subtotal).toFixed(2),
      desconto: Number(n.desconto).toFixed(2),
      total: Number(n.total).toFixed(2),
    }));
    exportCsv(rows, `notas_${from}_a_${to}.csv`);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Relatórios</h2>
          <p>Análise do período selecionado</p>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="form-admin" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) auto auto', gap: 12, alignItems: 'end' }}>
          <div className="field"><label>De</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}/>
          </div>
          <div className="field"><label>Até</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}/>
          </div>
          <div className="field"><label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="paga">Pagas</option>
              <option value="aberta">Em aberto</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={run} disabled={loading}>
            <Icon name="filter" size={14}/> Filtrar
          </button>
          <button className="admin-btn" onClick={exportar} disabled={!notas.length}>
            <Icon name="download" size={14}/> Exportar CSV
          </button>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card">
          <div className="kpi-label">Receita do período</div>
          <div className="kpi-value">{formatBRL(receita)}</div>
          <div className="kpi-sub">Apenas notas não canceladas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Notas pagas</div>
          <div className="kpi-value">{pagas}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Em aberto</div>
          <div className="kpi-value">{abertas}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Canceladas</div>
          <div className="kpi-value">{canceladas}</div>
        </div>
      </div>

      {loading ? <LoadingOverlay/> : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Pagto</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {notas.map(n => (
              <tr key={n.id}>
                <td style={{ fontFamily: 'Space Grotesk', fontWeight: 600 }}>#{String(n.numero).padStart(4, '0')}</td>
                <td style={{ fontSize: 13 }}>{formatDate(n.data_emissao)}</td>
                <td>{n.cliente_nome}</td>
                <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{n.forma_pagamento}</td>
                <td><span className={`li-badge badge-${n.status}`}>{n.status}</span></td>
                <td style={{ textAlign: 'right', fontFamily: 'Space Grotesk', fontWeight: 700 }}>{formatBRL(n.total)}</td>
              </tr>
            ))}
            {notas.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                Sem notas no período selecionado.
              </td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
