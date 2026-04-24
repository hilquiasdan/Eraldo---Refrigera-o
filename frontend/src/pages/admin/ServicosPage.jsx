import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
import { LoadingOverlay } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../lib/api';
import { formatBRL } from '../../lib/format';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

function ServicoForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || { titulo: '', descricao: '', valor_padrao: 0, ativo: true, ordem: 0 });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...data, valor_padrao: Number(data.valor_padrao), ordem: Number(data.ordem || 0) };
      const saved = initial
        ? await api.put(`/servicos/${initial.id}`, payload)
        : await api.post('/servicos', payload);
      toast.success(initial ? 'Serviço atualizado' : 'Serviço cadastrado');
      onSave(saved);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-admin" onSubmit={submit}>
      <div className="field"><label>Título *</label>
        <input required autoFocus value={data.titulo} onChange={set('titulo')} placeholder="Ex: Recarga de gás R134a"/></div>
      <div className="field"><label>Descrição</label>
        <textarea rows={2} value={data.descricao || ''} onChange={set('descricao')}/></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
        <div className="field"><label>Valor padrão (R$) *</label>
          <input required type="number" step="0.01" min="0" value={data.valor_padrao} onChange={set('valor_padrao')}/></div>
        <div className="field"><label>Ordem</label>
          <input type="number" value={data.ordem || 0} onChange={set('ordem')}/></div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={!!data.ativo} onChange={e => setData({ ...data, ativo: e.target.checked })}/>
        Serviço ativo (aparece na seleção de novas notas)
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
        <button type="button" className="admin-btn" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          <Icon name="save" size={14}/> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

export function ServicosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = user?.role === 'admin';

  const reload = async () => {
    setLoading(true);
    try { setItems(await api.get('/servicos')); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const remove = async (s) => {
    if (!confirm(`Remover serviço "${s.titulo}"?`)) return;
    try {
      const res = await api.delete(`/servicos/${s.id}`);
      toast.success(res.desativado ? 'Desativado (já usado em notas)' : 'Removido');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Serviços Padrão</h2>
          <p>Catálogo de serviços com valores pré-definidos</p>
        </div>
        {canEdit && (
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Icon name="plus" size={14}/> Novo serviço
          </button>
        )}
      </div>

      {loading ? <LoadingOverlay/> : items.length === 0 ? (
        <EmptyState icon="wrench" title="Nenhum serviço cadastrado"/>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descrição</th>
              <th style={{ textAlign: 'right' }}>Valor</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              {canEdit && <th></th>}
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id}>
                <td><strong>{s.titulo}</strong></td>
                <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.descricao || '—'}</td>
                <td style={{ textAlign: 'right', fontFamily: 'Space Grotesk', fontWeight: 600 }}>{formatBRL(s.valor_padrao)}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`li-badge ${s.ativo ? 'badge-paga' : 'badge-cancelada'}`}>
                    {s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                {canEdit && <td>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => { setEditing(s); setShowForm(true); }}><Icon name="edit" size={15}/></button>
                    <button className="icon-btn danger" onClick={() => remove(s)}><Icon name="trash" size={15}/></button>
                  </div>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar serviço' : 'Novo serviço'} width={560}>
        <ServicoForm initial={editing} onSave={() => { setShowForm(false); reload(); }} onCancel={() => setShowForm(false)}/>
      </Modal>
    </div>
  );
}
