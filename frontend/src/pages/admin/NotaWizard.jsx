import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { LoadingOverlay } from '../../components/ui/Loading';
import { api } from '../../lib/api';
import { formatBRL, formatPhone } from '../../lib/format';
import { useToast } from '../../hooks/useToast';

// ========= Step 1: Cliente + Veículo =========
function Step1ClienteVeiculo({ value, onNext }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [cliente, setCliente] = useState(value.cliente || null);
  const [veiculos, setVeiculos] = useState([]);
  const [veiculo, setVeiculo] = useState(value.veiculo || null);

  // Cliente novo inline
  const [creatingNew, setCreatingNew] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: '', telefone: '', placa: '', modelo: '' });
  const toast = useToast();

  useEffect(() => {
    if (!q || cliente) return;
    const t = setTimeout(async () => {
      try {
        const data = await api.get(`/clientes?q=${encodeURIComponent(q)}&limit=8`);
        setResults(data);
        setShowResults(true);
      } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [q, cliente]);

  const pickCliente = async (c) => {
    setCliente(c);
    setQ('');
    setShowResults(false);
    const v = await api.get(`/clientes/${c.id}/veiculos`);
    setVeiculos(v);
    setVeiculo(v[0] || null);
  };

  const unsetCliente = () => {
    setCliente(null);
    setVeiculo(null);
    setVeiculos([]);
  };

  const criarCliente = async (e) => {
    e.preventDefault();
    try {
      const c = await api.post('/clientes', {
        nome: novoCliente.nome,
        telefone: novoCliente.telefone,
      });
      let v = null;
      if (novoCliente.placa && novoCliente.modelo) {
        v = await api.post(`/clientes/${c.id}/veiculos`, {
          placa: novoCliente.placa.toUpperCase(),
          modelo: novoCliente.modelo,
        });
      }
      toast.success('Cliente criado');
      setCliente(c);
      setVeiculos(v ? [v] : []);
      setVeiculo(v);
      setCreatingNew(false);
      setNovoCliente({ nome: '', telefone: '', placa: '', modelo: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const canContinue = !!cliente;

  return (
    <div className="wizard-panel">
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Quem é o cliente?</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>
        Busque um cliente já cadastrado ou crie um novo.
      </p>

      {!cliente && !creatingNew && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div className="page-header-search" style={{ width: '100%' }}>
            <Icon name="search" size={16}/>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => q && setShowResults(true)}
              placeholder="Buscar por nome, telefone ou placa..."
              autoFocus
            />
          </div>
          {showResults && results.length > 0 && (
            <div className="search-results">
              {results.map(r => (
                <div key={r.id} className="search-result-item" onClick={() => pickCliente(r)}>
                  <div className="search-result-name">{r.nome}</div>
                  <div className="search-result-meta">
                    {formatPhone(r.telefone)}
                    {r.veiculos_count > 0 && ` · ${r.veiculos_count} veículo(s)`}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            className="admin-btn"
            style={{ marginTop: 12 }}
            onClick={() => setCreatingNew(true)}
          >
            <Icon name="plus" size={14}/> Criar novo cliente
          </button>
        </div>
      )}

      {creatingNew && (
        <form className="form-admin" onSubmit={criarCliente} style={{ marginBottom: 16 }}>
          <div className="field"><label>Nome *</label>
            <input required autoFocus value={novoCliente.nome}
              onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })}/></div>
          <div className="field"><label>Telefone *</label>
            <input required value={novoCliente.telefone}
              onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value })}/></div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
            <div className="field"><label>Placa</label>
              <input value={novoCliente.placa}
                onChange={e => setNovoCliente({ ...novoCliente, placa: e.target.value.toUpperCase() })}/></div>
            <div className="field"><label>Modelo do veículo</label>
              <input value={novoCliente.modelo}
                onChange={e => setNovoCliente({ ...novoCliente, modelo: e.target.value })}
                placeholder="Ex: Onix 2020"/></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="admin-btn" onClick={() => setCreatingNew(false)}>Cancelar</button>
            <button type="submit" className="admin-btn admin-btn-primary">
              <Icon name="save" size={14}/> Criar cliente
            </button>
          </div>
        </form>
      )}

      {cliente && (
        <div>
          <div style={{ background: 'var(--brand-cyan-soft)', padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{cliente.nome}</div>
                <div style={{ fontSize: 13, color: 'var(--brand-navy)' }}>
                  {formatPhone(cliente.telefone)}
                  {cliente.cpf_cnpj && ` · ${cliente.cpf_cnpj}`}
                </div>
              </div>
              <button className="icon-btn" onClick={unsetCliente} title="Trocar cliente">
                <Icon name="x" size={16}/>
              </button>
            </div>
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
            Veículo (opcional)
          </label>
          {veiculos.length === 0 ? (
            <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 10, fontSize: 13, color: 'var(--text-muted)' }}>
              Este cliente não tem veículos cadastrados. Você pode prosseguir sem veículo ou cadastrar pela tela de Clientes.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {veiculos.map(v => (
                <label key={v.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  border: `2px solid ${veiculo?.id === v.id ? 'var(--brand-cyan)' : 'var(--border)'}`,
                  borderRadius: 10, cursor: 'pointer',
                  background: veiculo?.id === v.id ? 'var(--brand-cyan-soft)' : 'transparent'
                }}>
                  <input type="radio" checked={veiculo?.id === v.id} onChange={() => setVeiculo(v)}/>
                  <div>
                    <div style={{ fontWeight: 600 }}>{v.placa} · {v.modelo}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {[v.ano, v.cor].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </label>
              ))}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                border: `2px solid ${!veiculo ? 'var(--brand-cyan)' : 'var(--border)'}`,
                borderRadius: 10, cursor: 'pointer',
                background: !veiculo ? 'var(--brand-cyan-soft)' : 'transparent'
              }}>
                <input type="radio" checked={!veiculo} onChange={() => setVeiculo(null)}/>
                <span>Sem veículo específico</span>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="wizard-footer">
        <div/>
        <button
          className="admin-btn admin-btn-primary"
          disabled={!canContinue}
          onClick={() => onNext({ cliente, veiculo })}
        >
          Continuar <Icon name="arrow" size={14}/>
        </button>
      </div>
    </div>
  );
}

// ========= Step 2: Itens =========
function Step2Itens({ value, onBack, onNext }) {
  const [itens, setItens] = useState(value.itens?.length ? value.itens : [newItem()]);
  const [servicos, setServicos] = useState([]);
  const [mecanicos, setMecanicos] = useState([]);
  const [mecanicoId, setMecanicoId] = useState(value.mecanicoId || '');
  const [formaPagamento, setFormaPagamento] = useState(value.formaPagamento || 'dinheiro');
  const [desconto, setDesconto] = useState(value.desconto || 0);

  function newItem() { return { servico_id: null, descricao: '', quantidade: 1, valor_unitario: 0 }; }

  useEffect(() => {
    (async () => {
      const [s, m] = await Promise.all([
        api.get('/servicos?ativo=1'),
        api.get('/mecanicos?ativo=1'),
      ]);
      setServicos(s);
      setMecanicos(m);
    })();
  }, []);

  const addItem = () => setItens([...itens, newItem()]);
  const removeItem = (i) => setItens(itens.filter((_, idx) => idx !== i));

  const updateItem = (i, changes) => {
    setItens(itens.map((it, idx) => idx === i ? { ...it, ...changes } : it));
  };

  const pickServico = (i, servicoId) => {
    if (!servicoId) return updateItem(i, { servico_id: null });
    const s = servicos.find(x => String(x.id) === String(servicoId));
    if (s) {
      updateItem(i, { servico_id: s.id, descricao: s.titulo, valor_unitario: Number(s.valor_padrao) });
    }
  };

  const subtotal = itens.reduce((sum, it) => sum + Number(it.quantidade || 0) * Number(it.valor_unitario || 0), 0);
  const total = Math.max(0, subtotal - Number(desconto || 0));

  const canContinue = itens.length > 0 && itens.every(it => it.descricao && it.valor_unitario >= 0 && it.quantidade > 0);

  return (
    <div className="wizard-panel">
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Serviços e valores</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>
        Adicione os serviços executados. Selecione um do catálogo ou digite manualmente.
      </p>

      <div className="itens-list">
        {itens.map((it, i) => (
          <div key={i} className="item-row">
            <div>
              <select value={it.servico_id || ''} onChange={e => pickServico(i, e.target.value)}
                style={{ marginBottom: 6, width: '100%' }}>
                <option value="">— Digitar manualmente —</option>
                {servicos.map(s => (
                  <option key={s.id} value={s.id}>{s.titulo} — {formatBRL(s.valor_padrao)}</option>
                ))}
              </select>
              <input className="wide" placeholder="Descrição do serviço"
                value={it.descricao} onChange={e => updateItem(i, { descricao: e.target.value })}/>
            </div>
            <input type="number" step="0.5" min="0.5" value={it.quantidade}
              onChange={e => updateItem(i, { quantidade: Number(e.target.value) })} placeholder="Qtd"/>
            <input type="number" step="0.01" min="0" value={it.valor_unitario}
              onChange={e => updateItem(i, { valor_unitario: Number(e.target.value) })} placeholder="Valor unit."/>
            <div className="item-total">{formatBRL(Number(it.quantidade || 0) * Number(it.valor_unitario || 0))}</div>
            <button className="icon-btn danger" onClick={() => removeItem(i)} disabled={itens.length === 1}
              title="Remover item">
              <Icon name="trash" size={14}/>
            </button>
          </div>
        ))}
      </div>

      <button className="admin-btn" onClick={addItem} style={{ marginBottom: 20 }}>
        <Icon name="plus" size={14}/> Adicionar item
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="form-admin">
          <div className="field"><label>Mecânico responsável</label>
            <select value={mecanicoId} onChange={e => setMecanicoId(e.target.value)}>
              <option value="">— Nenhum —</option>
              {mecanicos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div className="field"><label>Forma de pagamento</label>
            <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="debito">Cartão de débito</option>
              <option value="credito">Cartão de crédito</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>
        </div>
        <div className="totals-box">
          <div className="totals-row">
            <span>Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="totals-row" style={{ alignItems: 'center' }}>
            <span>Desconto</span>
            <input type="number" step="0.01" min="0" value={desconto}
              onChange={e => setDesconto(Math.max(0, Number(e.target.value)))}
              style={{ width: 110, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)',
                fontFamily: 'Space Grotesk', textAlign: 'right', background: 'var(--bg-card)', color: 'var(--text)' }}/>
          </div>
          <div className="totals-row big">
            <span>Total</span>
            <span className="valor">{formatBRL(total)}</span>
          </div>
        </div>
      </div>

      <div className="wizard-footer">
        <button className="admin-btn" onClick={onBack}>
          <Icon name="arrowLeft" size={14}/> Voltar
        </button>
        <button className="admin-btn admin-btn-primary" disabled={!canContinue}
          onClick={() => onNext({
            itens,
            mecanicoId: mecanicoId || null,
            formaPagamento,
            desconto: Number(desconto || 0),
            subtotal, total
          })}>
          Revisar e salvar <Icon name="arrow" size={14}/>
        </button>
      </div>
    </div>
  );
}

// ========= Step 3: Preview + Save =========
function Step3Preview({ value, onBack, onSaved }) {
  const [status, setStatus] = useState('paga');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        cliente_id: value.cliente.id,
        veiculo_id: value.veiculo?.id || null,
        mecanico_id: value.mecanicoId ? Number(value.mecanicoId) : null,
        forma_pagamento: value.formaPagamento,
        desconto: value.desconto,
        status,
        observacoes: observacoes || null,
        itens: value.itens.map(it => ({
          servico_id: it.servico_id || null,
          descricao: it.descricao,
          quantidade: Number(it.quantidade),
          valor_unitario: Number(it.valor_unitario),
        })),
      };
      const nota = await api.post('/notas', payload);
      toast.success(`Nota #${String(nota.numero).padStart(4, '0')} criada!`);
      onSaved(nota);
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wizard-panel">
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Revisar e salvar</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>
        Confira os dados. Após salvar, você poderá imprimir em A4 ou bobina térmica.
      </p>

      <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 12, marginBottom: 20 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Cliente</div>
          <div style={{ fontWeight: 600 }}>{value.cliente.nome}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {formatPhone(value.cliente.telefone)}
            {value.veiculo && ` · Veículo: ${value.veiculo.placa} ${value.veiculo.modelo}`}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 12, color: 'var(--text-muted)' }}>Descrição</th>
              <th style={{ textAlign: 'center', padding: '8px 4px', fontSize: 12, color: 'var(--text-muted)' }}>Qtd</th>
              <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: 'var(--text-muted)' }}>Valor un.</th>
              <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 12, color: 'var(--text-muted)' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {value.itens.map((it, i) => (
              <tr key={i} style={{ borderBottom: '1px dashed var(--border)' }}>
                <td style={{ padding: '8px 4px', fontSize: 14 }}>{it.descricao}</td>
                <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 14 }}>{it.quantidade}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 14, fontFamily: 'Space Grotesk' }}>{formatBRL(it.valor_unitario)}</td>
                <td style={{ padding: '8px 4px', textAlign: 'right', fontSize: 14, fontFamily: 'Space Grotesk', fontWeight: 600 }}>
                  {formatBRL(Number(it.quantidade) * Number(it.valor_unitario))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Pagamento: <strong style={{ color: 'var(--text)' }}>{value.formaPagamento}</strong>
            {value.desconto > 0 && ` · Desconto: ${formatBRL(value.desconto)}`}
          </span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22, color: 'var(--brand-cyan)' }}>
            {formatBRL(value.total)}
          </span>
        </div>
      </div>

      <div className="form-admin">
        <div className="field"><label>Status da nota</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="paga">Paga</option>
            <option value="aberta">Em aberto</option>
          </select>
        </div>
        <div className="field"><label>Observações (opcional)</label>
          <textarea rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)}
            placeholder="Garantia, condições específicas, etc."/>
        </div>
      </div>

      <div className="wizard-footer">
        <button className="admin-btn" onClick={onBack} disabled={saving}>
          <Icon name="arrowLeft" size={14}/> Voltar
        </button>
        <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
          <Icon name="save" size={14}/> {saving ? 'Salvando...' : 'Salvar e imprimir'}
        </button>
      </div>
    </div>
  );
}

export function NotaWizard() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState({});
  const navigate = useNavigate();

  const goStep1 = (d) => { setState({ ...state, ...d }); setStep(2); };
  const goStep2 = (d) => { setState({ ...state, ...d }); setStep(3); };
  const saved = (nota) => navigate(`/admin/notas/${nota.id}/imprimir`);

  const steps = [
    { n: 1, label: 'Cliente', sub: 'Quem vai receber' },
    { n: 2, label: 'Serviços', sub: 'O que foi feito' },
    { n: 3, label: 'Revisar', sub: 'Confirmar e imprimir' },
  ];

  return (
    <div>
      <div className="wizard-steps">
        {steps.map(s => (
          <div key={s.n} className={`wizard-step ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`}>
            <div className="wizard-step-num">{step > s.n ? <Icon name="check" size={14}/> : s.n}</div>
            <div>
              <div className="wizard-step-label">{s.label}</div>
              <div className="wizard-step-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {step === 1 && <Step1ClienteVeiculo value={state} onNext={goStep1}/>}
      {step === 2 && <Step2Itens value={state} onBack={() => setStep(1)} onNext={goStep2}/>}
      {step === 3 && <Step3Preview value={state} onBack={() => setStep(2)} onSaved={saved}/>}
    </div>
  );
}
