import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
import { LoadingOverlay } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../lib/api';
import { formatPhone } from '../../lib/format';
import { useToast } from '../../hooks/useToast';

function ClienteForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || { nome: '', telefone: '', cpf_cnpj: '', email: '', endereco: '', cidade: '', observacoes: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = initial
        ? await api.put(`/clientes/${initial.id}`, data)
        : await api.post('/clientes', data);
      toast.success(initial ? 'Cliente atualizado' : 'Cliente cadastrado');
      onSave(saved);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });

  return (
    <form className="form-admin" onSubmit={submit}>
      <div className="field">
        <label>Nome *</label>
        <input required autoFocus value={data.nome} onChange={set('nome')} placeholder="Nome completo"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field">
          <label>Telefone *</label>
          <input required value={data.telefone} onChange={set('telefone')} placeholder="(81) 99999-0000"/>
        </div>
        <div className="field">
          <label>CPF / CNPJ</label>
          <input value={data.cpf_cnpj || ''} onChange={set('cpf_cnpj')} placeholder="123.456.789-00"/>
        </div>
      </div>
      <div className="field">
        <label>E-mail</label>
        <input type="email" value={data.email || ''} onChange={set('email')} placeholder="email@exemplo.com"/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div className="field">
          <label>Endereço</label>
          <input value={data.endereco || ''} onChange={set('endereco')}/>
        </div>
        <div className="field">
          <label>Cidade</label>
          <input value={data.cidade || ''} onChange={set('cidade')}/>
        </div>
      </div>
      <div className="field">
        <label>Observações</label>
        <textarea rows={3} value={data.observacoes || ''} onChange={set('observacoes')}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
        <button type="button" className="admin-btn" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          <Icon name="save" size={14}/> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

function VeiculosPanel({ cliente, onClose }) {
  const [veiculos, setVeiculos] = useState([]);
  const [form, setForm] = useState({ placa: '', modelo: '', ano: '', cor: '' });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/clientes/${cliente.id}/veiculos`);
      setVeiculos(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { reload(); }, [cliente.id]);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/clientes/${cliente.id}/veiculos`, {
        placa: form.placa,
        modelo: form.modelo,
        ano: form.ano ? Number(form.ano) : null,
        cor: form.cor,
      });
      setForm({ placa: '', modelo: '', ano: '', cor: '' });
      toast.success('Veículo adicionado');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Remover este veículo?')) return;
    await api.delete(`/clientes/${cliente.id}/veiculos/${id}`);
    toast.success('Veículo removido');
    reload();
  };

  return (
    <div>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Veículos de {cliente.nome}</h4>
      {loading ? <LoadingOverlay/> : (
        <>
          {veiculos.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nenhum veículo cadastrado.</p>}
          {veiculos.map(v => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{v.placa} · {v.modelo}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {[v.ano, v.cor].filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
              <button className="icon-btn danger" onClick={() => remove(v.id)}><Icon name="trash" size={14}/></button>
            </div>
          ))}
        </>
      )}
      <form className="form-admin" onSubmit={add} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 80px 90px auto', gap: 8 }}>
          <input required placeholder="Placa" value={form.placa} onChange={e => setForm({ ...form, placa: e.target.value.toUpperCase() })} maxLength={10}/>
          <input required placeholder="Modelo" value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })}/>
          <input placeholder="Ano" type="number" value={form.ano} onChange={e => setForm({ ...form, ano: e.target.value })}/>
          <input placeholder="Cor" value={form.cor} onChange={e => setForm({ ...form, cor: e.target.value })}/>
          <button type="submit" className="admin-btn admin-btn-primary"><Icon name="plus" size={14}/></button>
        </div>
      </form>
    </div>
  );
}

export function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [veiculosOf, setVeiculosOf] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const reload = async (search = q) => {
    setLoading(true);
    try {
      const data = await api.get('/clientes' + (search ? `?q=${encodeURIComponent(search)}` : ''));
      setClientes(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setEditing(null);
      setShowForm(true);
      searchParams.delete('novo');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => reload(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const onSaved = () => {
    setShowForm(false);
    setEditing(null);
    reload();
  };

  const remove = async (cliente) => {
    if (!confirm(`Remover cliente "${cliente.nome}"?`)) return;
    try {
      await api.delete(`/clientes/${cliente.id}`);
      toast.success('Cliente removido');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Clientes</h2>
          <p>{clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="page-header-search">
            <Icon name="search" size={16}/>
            <input
              placeholder="Buscar por nome, telefone, CPF, placa..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Icon name="plus" size={14}/> Novo
          </button>
        </div>
      </div>

      {loading ? <LoadingOverlay/> : clientes.length === 0 ? (
        <EmptyState
          icon="users"
          title="Nenhum cliente encontrado"
          description={q ? 'Tente outra busca.' : 'Cadastre seu primeiro cliente para começar.'}
          action={<button className="admin-btn admin-btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Icon name="plus" size={14}/> Cadastrar cliente
          </button>}
        />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>CPF/CNPJ</th>
              <th>Cidade</th>
              <th style={{ textAlign: 'center' }}>Veíc.</th>
              <th style={{ textAlign: 'center' }}>Notas</th>
              <th style={{ textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id}>
                <td><strong>{c.nome}</strong></td>
                <td>{formatPhone(c.telefone)}</td>
                <td>{c.cpf_cnpj || '—'}</td>
                <td>{c.cidade || '—'}</td>
                <td style={{ textAlign: 'center' }}>{c.veiculos_count}</td>
                <td style={{ textAlign: 'center' }}>{c.notas_count}</td>
                <td>
                  <div className="actions">
                    <button className="icon-btn" onClick={() => setVeiculosOf(c)} title="Veículos"><Icon name="car" size={15}/></button>
                    <button className="icon-btn" onClick={() => { setEditing(c); setShowForm(true); }} title="Editar"><Icon name="edit" size={15}/></button>
                    <button className="icon-btn danger" onClick={() => remove(c)} title="Remover"><Icon name="trash" size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar cliente' : 'Novo cliente'} width={600}>
        <ClienteForm initial={editing} onSave={onSaved} onCancel={() => setShowForm(false)}/>
      </Modal>

      <Modal open={!!veiculosOf} onClose={() => setVeiculosOf(null)} title="Veículos do cliente">
        {veiculosOf && <VeiculosPanel cliente={veiculosOf} onClose={() => setVeiculosOf(null)}/>}
      </Modal>
    </div>
  );
}
