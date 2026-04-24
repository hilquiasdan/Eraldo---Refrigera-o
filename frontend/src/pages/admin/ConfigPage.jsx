import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { LoadingOverlay } from '../../components/ui/Loading';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const FIELDS = [
  { key: 'empresa_nome', label: 'Nome da empresa' },
  { key: 'empresa_cnpj', label: 'CNPJ' },
  { key: 'empresa_endereco', label: 'Endereço' },
  { key: 'empresa_cidade', label: 'Cidade / Estado' },
  { key: 'empresa_telefone', label: 'Telefone' },
  { key: 'empresa_email', label: 'E-mail' },
  { key: 'empresa_horario', label: 'Horário de atendimento' },
];

export function ConfigPage() {
  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const canEdit = user?.role === 'admin';

  useEffect(() => {
    (async () => {
      try { setCfg(await api.get('/config')); }
      catch (err) { toast.error(err.message); }
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      for (const { key } of FIELDS) payload[key] = cfg[key] || '';
      await api.put('/config', payload);
      toast.success('Configurações salvas');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (!cfg) return <LoadingOverlay/>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Configurações</h2>
          <p>Dados da empresa que aparecem nas notas e na landing</p>
        </div>
      </div>

      <form className="form-admin panel" onSubmit={save} style={{ maxWidth: 720 }}>
        {FIELDS.map(f => (
          <div className="field" key={f.key}>
            <label>{f.label}</label>
            <input
              value={cfg[f.key] || ''}
              onChange={e => setCfg({ ...cfg, [f.key]: e.target.value })}
              disabled={!canEdit}
            />
          </div>
        ))}
        {canEdit && (
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            <Icon name="save" size={14}/> {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        )}
      </form>
    </div>
  );
}
