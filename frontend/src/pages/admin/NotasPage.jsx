import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { LoadingOverlay } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../lib/api';
import { formatBRL, formatRelative } from '../../lib/format';
import { useToast } from '../../hooks/useToast';

export function NotasPage() {
  const [data, setData] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      params.set('limit', '100');
      setData(await api.get(`/notas?${params}`));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);
  useEffect(() => {
    const t = setTimeout(reload, 300);
    return () => clearTimeout(t);
  }, [q, status]);

  const cancelar = async (n) => {
    if (!confirm(`Cancelar nota #${String(n.numero).padStart(4, '0')}?`)) return;
    try {
      await api.patch(`/notas/${n.id}/status`, { status: 'cancelada' });
      toast.success('Nota cancelada');
      reload();
    } catch (err) { toast.error(err.message); }
  };

  const marcarPaga = async (n) => {
    try {
      await api.patch(`/notas/${n.id}/status`, { status: 'paga' });
      toast.success('Nota marcada como paga');
      reload();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Histórico de Notas</h2>
          <p>{data.total} nota(s) emitida(s) no total</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={status} onChange={e => setStatus(e.target.value)}
            className="admin-btn" style={{ padding: '10px 16px' }}
          >
            <option value="">Todos os status</option>
            <option value="paga">Paga</option>
            <option value="aberta">Em aberto</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <div className="page-header-search">
            <Icon name="search" size={16}/>
            <input placeholder="Buscar por número ou cliente..." value={q} onChange={e => setQ(e.target.value)}/>
          </div>
          <button className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/nota')}>
            <Icon name="plus" size={14}/> Nova nota
          </button>
        </div>
      </div>

      {loading ? <LoadingOverlay/> : data.rows.length === 0 ? (
        <EmptyState icon="file" title="Nenhuma nota encontrada"
          description={q || status ? 'Tente outros filtros.' : 'Emita sua primeira nota agora.'}
          action={<button className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/nota')}>
            <Icon name="plus" size={14}/> Nova nota
          </button>}/>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Nº</th>
              <th>Cliente</th>
              <th>Veículo</th>
              <th>Data</th>
              <th>Pagto</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map(n => (
              <tr key={n.id}>
                <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--brand-cyan)' }}>
                  #{String(n.numero).padStart(4, '0')}
                </td>
                <td><strong>{n.cliente_nome}</strong></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  {n.veiculo_placa ? `${n.veiculo_placa} · ${n.veiculo_modelo}` : '—'}
                </td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatRelative(n.data_emissao)}</td>
                <td style={{ fontSize: 13, textTransform: 'capitalize' }}>{n.forma_pagamento}</td>
                <td style={{ textAlign: 'right', fontFamily: 'Space Grotesk', fontWeight: 700 }}>{formatBRL(n.total)}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`li-badge badge-${n.status}`}>
                    {n.status === 'paga' ? 'Paga' : n.status === 'aberta' ? 'Em aberto' : 'Cancelada'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => navigate(`/admin/notas/${n.id}/imprimir`)} title="Imprimir">
                      <Icon name="printer" size={15}/>
                    </button>
                    {n.status === 'aberta' && (
                      <button className="icon-btn" onClick={() => marcarPaga(n)} title="Marcar como paga">
                        <Icon name="check" size={15}/>
                      </button>
                    )}
                    {n.status !== 'cancelada' && (
                      <button className="icon-btn danger" onClick={() => cancelar(n)} title="Cancelar">
                        <Icon name="x" size={15}/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
