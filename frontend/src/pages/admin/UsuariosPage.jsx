import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
import { LoadingOverlay } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../lib/api';
import { formatRelative } from '../../lib/format';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

function UserForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial
    ? { ...initial, senha: '' }
    : { nome: '', email: '', senha: '', role: 'atendente', ativo: true });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...data };
      if (initial && !payload.senha) delete payload.senha;
      const saved = initial
        ? await api.put(`/users/${initial.id}`, payload)
        : await api.post('/users', payload);
      toast.success(initial ? 'Usuário atualizado' : 'Usuário criado');
      onSave(saved);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-admin" onSubmit={submit}>
      <div className="field"><label>Nome *</label>
        <input required autoFocus value={data.nome} onChange={set('nome')}/></div>
      <div className="field"><label>E-mail *</label>
        <input required type="email" value={data.email} onChange={set('email')}/></div>
      <div className="field">
        <label>{initial ? 'Nova senha (deixe em branco para manter a atual)' : 'Senha *'}</label>
        <input type="password" value={data.senha} onChange={set('senha')} placeholder="Mínimo 6 caracteres"
               required={!initial} minLength={6}/>
      </div>
      <div className="field"><label>Função</label>
        <select value={data.role} onChange={set('role')}>
          <option value="admin">Administrador</option>
          <option value="mecanico">Mecânico</option>
          <option value="atendente">Atendente</option>
        </select>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={!!data.ativo} onChange={e => setData({ ...data, ativo: e.target.checked })}/>
        Usuário ativo
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

export function UsuariosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const reload = async () => {
    setLoading(true);
    try { setItems(await api.get('/users')); }
    finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, []);

  const remove = async (u) => {
    if (u.id === user.sub || u.id === user.id) return toast.error('Você não pode remover seu próprio usuário');
    if (!confirm(`Desativar usuário "${u.nome}"?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      toast.success('Usuário desativado');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Usuários</h2>
          <p>Quem pode acessar o sistema e com qual permissão</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Icon name="plus" size={14}/> Novo usuário
        </button>
      </div>

      {loading ? <LoadingOverlay/> : items.length === 0 ? (
        <EmptyState icon="user" title="Nenhum usuário cadastrado"/>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Função</th>
              <th>Último acesso</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id}>
                <td><strong>{u.nome}</strong></td>
                <td>{u.email}</td>
                <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.ultimo_acesso ? formatRelative(u.ultimo_acesso) : 'Nunca'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`li-badge ${u.ativo ? 'badge-paga' : 'badge-cancelada'}`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => { setEditing(u); setShowForm(true); }}><Icon name="edit" size={15}/></button>
                    <button className="icon-btn danger" onClick={() => remove(u)}><Icon name="trash" size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar usuário' : 'Novo usuário'} width={560}>
        <UserForm initial={editing} onSave={() => { setShowForm(false); reload(); }} onCancel={() => setShowForm(false)}/>
      </Modal>
    </div>
  );
}
