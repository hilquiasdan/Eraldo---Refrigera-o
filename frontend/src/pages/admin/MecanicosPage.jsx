import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
import { LoadingOverlay } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../lib/api';
import { formatPhone } from '../../lib/format';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

function MecanicoForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || { nome: '', telefone: '', email: '', especialidade: '', ativo: true, observacoes: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = initial
        ? await api.put(`/mecanicos/${initial.id}`, data)
        : await api.post('/mecanicos', data);
      toast.success(initial ? 'Mecânico atualizado' : 'Mecânico cadastrado');
      onSave(saved);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-admin" onSubmit={submit}>
      <div className="field"><label>Nome *</label>
        <input required autoFocus value={data.nome} onChange={set('nome')}/></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field"><label>Telefone</label>
          <input value={data.telefone || ''} onChange={set('telefone')} placeholder="(81) 99999-0000"/></div>
        <div className="field"><label>E-mail</label>
          <input type="email" value={data.email || ''} onChange={set('email')}/></div>
      </div>
      <div className="field"><label>Especialidade</label>
        <input value={data.especialidade || ''} onChange={set('especialidade')} placeholder="Ex: Refrigeração e diagnóstico"/></div>
      <div className="field"><label>Observações</label>
        <textarea rows={2} value={data.observacoes || ''} onChange={set('observacoes')}/></div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
        <input type="checkbox" checked={!!data.ativo} onChange={e => setData({ ...data, ativo: e.target.checked })}/>
        Mecânico ativo
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

export function MecanicosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = user?.role === 'admin';

  const reload = async () => {
    setLoading(true);
    try {
      setItems(await api.get('/mecanicos'));
    } finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const remove = async (m) => {
    if (!confirm(`Remover mecânico "${m.nome}"?`)) return;
    try {
      const res = await api.delete(`/mecanicos/${m.id}`);
      toast.success(res.desativado ? 'Mecânico desativado (tem histórico)' : 'Mecânico removido');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Mecânicos</h2>
          <p>{items.filter(m => m.ativo).length} ativos de {items.length} cadastrados</p>
        </div>
        {canEdit && (
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Icon name="plus" size={14}/> Novo mecânico
          </button>
        )}
      </div>

      {loading ? <LoadingOverlay/> : items.length === 0 ? (
        <EmptyState icon="userPlus" title="Nenhum mecânico cadastrado"
          action={canEdit && <button className="admin-btn admin-btn-primary" onClick={() => setShowForm(true)}>
            <Icon name="plus" size={14}/> Cadastrar mecânico
          </button>}/>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Especialidade</th>
              <th>Telefone</th>
              <th style={{ textAlign: 'center' }}>Notas</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              {canEdit && <th></th>}
            </tr>
          </thead>
          <tbody>
            {items.map(m => (
              <tr key={m.id}>
                <td><strong>{m.nome}</strong></td>
                <td>{m.especialidade || '—'}</td>
                <td>{formatPhone(m.telefone) || '—'}</td>
                <td style={{ textAlign: 'center' }}>{m.notas_count}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`li-badge ${m.ativo ? 'badge-paga' : 'badge-cancelada'}`}>
                    {m.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                {canEdit && <td>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => { setEditing(m); setShowForm(true); }}><Icon name="edit" size={15}/></button>
                    <button className="icon-btn danger" onClick={() => remove(m)}><Icon name="trash" size={15}/></button>
                  </div>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar mecânico' : 'Novo mecânico'} width={560}>
        <MecanicoForm initial={editing} onSave={() => { setShowForm(false); reload(); }} onCancel={() => setShowForm(false)}/>
      </Modal>
    </div>
  );
}
