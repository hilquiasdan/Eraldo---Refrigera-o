import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { LoadingOverlay } from '../../components/ui/Loading';
import { api } from '../../lib/api';
import { formatBRL, formatDateTime, formatPhone } from '../../lib/format';
import { useToast } from '../../hooks/useToast';

const PAG_LABEL = {
  dinheiro: 'Dinheiro', pix: 'PIX',
  debito: 'Débito', credito: 'Crédito', boleto: 'Boleto',
};

function PrintA4({ nota, empresa }) {
  return (
    <div className="print-a4">
      <div className="p-head">
        <img src="/logo.png" alt={empresa.empresa_nome}/>
        <div className="p-head-info">
          <div style={{ fontWeight: 700, color: '#1E2A6E', fontSize: 14 }}>{empresa.empresa_nome}</div>
          <div>CNPJ {empresa.empresa_cnpj}</div>
          <div>{empresa.empresa_endereco}</div>
          <div>{empresa.empresa_cidade}</div>
          <div>{empresa.empresa_telefone}</div>
          <div className="num" style={{ marginTop: 10 }}>
            NOTA Nº {String(nota.numero).padStart(4, '0')}
          </div>
          <div>Emitida em {formatDateTime(nota.data_emissao)}</div>
        </div>
      </div>

      <h1>Dados do cliente</h1>
      <div className="p-grid">
        <div>
          <div className="p-field"><strong>Nome: </strong><span className="val">{nota.cliente_nome}</span></div>
          {nota.cliente_cpf && <div className="p-field"><strong>CPF/CNPJ: </strong><span className="val">{nota.cliente_cpf}</span></div>}
          <div className="p-field"><strong>Telefone: </strong><span className="val">{formatPhone(nota.cliente_telefone)}</span></div>
          {nota.cliente_endereco && <div className="p-field"><strong>Endereço: </strong><span className="val">{nota.cliente_endereco}, {nota.cliente_cidade || ''}</span></div>}
        </div>
        {nota.veiculo_placa && (
          <div>
            <div className="p-field"><strong>Veículo: </strong><span className="val">{nota.veiculo_modelo}</span></div>
            <div className="p-field"><strong>Placa: </strong><span className="val">{nota.veiculo_placa}</span></div>
            {nota.veiculo_ano && <div className="p-field"><strong>Ano: </strong><span className="val">{nota.veiculo_ano}</span></div>}
            {nota.veiculo_cor && <div className="p-field"><strong>Cor: </strong><span className="val">{nota.veiculo_cor}</span></div>}
          </div>
        )}
      </div>

      <h1>Serviços executados</h1>
      <table className="p-items">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Descrição</th>
            <th style={{ width: 70 }}>Qtd</th>
            <th style={{ width: 110 }}>Valor un.</th>
            <th style={{ width: 110 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {nota.itens.map((it, i) => (
            <tr key={it.id}>
              <td className="num">{i + 1}</td>
              <td>{it.descricao}</td>
              <td className="num">{Number(it.quantidade).toLocaleString('pt-BR')}</td>
              <td className="num">{formatBRL(it.valor_unitario)}</td>
              <td className="num">{formatBRL(it.valor_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-totals">
        <div className="row"><span>Subtotal</span><span>{formatBRL(nota.subtotal)}</span></div>
        {Number(nota.desconto) > 0 && <div className="row"><span>Desconto</span><span>− {formatBRL(nota.desconto)}</span></div>}
        <div className="row total"><span>TOTAL</span><span>{formatBRL(nota.total)}</span></div>
      </div>

      <div style={{ fontSize: 12, color: '#444', marginTop: 20 }}>
        <strong>Forma de pagamento:</strong> {PAG_LABEL[nota.forma_pagamento]}
        {nota.mecanico_nome && ` · Mecânico responsável: ${nota.mecanico_nome}`}
      </div>

      {nota.observacoes && (
        <div style={{ fontSize: 12, color: '#444', marginTop: 10 }}>
          <strong>Observações:</strong> {nota.observacoes}
        </div>
      )}

      <div className="sig-box">Assinatura do cliente</div>

      <div className="p-foot">
        <div>Nota de serviço interna. Não possui valor fiscal.</div>
        <div>{empresa.empresa_horario}</div>
      </div>
    </div>
  );
}

function PrintThermal({ nota, empresa }) {
  return (
    <div className="print-thermal">
      <div className="t-center t-bold t-big">{empresa.empresa_nome}</div>
      <div className="t-center">CNPJ {empresa.empresa_cnpj}</div>
      <div className="t-center">{empresa.empresa_endereco}</div>
      <div className="t-center">{empresa.empresa_cidade}</div>
      <div className="t-center">{empresa.empresa_telefone}</div>
      <hr/>
      <div className="t-center t-bold">NOTA Nº {String(nota.numero).padStart(4, '0')}</div>
      <div className="t-center">{formatDateTime(nota.data_emissao)}</div>
      <hr/>
      <div><strong>Cliente:</strong> {nota.cliente_nome}</div>
      <div>{formatPhone(nota.cliente_telefone)}</div>
      {nota.veiculo_placa && (
        <div>Veículo: {nota.veiculo_placa} - {nota.veiculo_modelo}</div>
      )}
      <hr/>
      <table>
        <tbody>
          {nota.itens.map((it) => (
            <tr key={it.id}>
              <td colSpan={2}>
                <div>{it.descricao}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                  <span>{Number(it.quantidade)} x {formatBRL(it.valor_unitario)}</span>
                  <span style={{ fontWeight: 700 }}>{formatBRL(it.valor_total)}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {Number(nota.desconto) > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
          <span>Subtotal: {formatBRL(nota.subtotal)}</span>
          <span>Desc: − {formatBRL(nota.desconto)}</span>
        </div>
      )}
      <div className="t-total">
        <span>TOTAL</span><span>{formatBRL(nota.total)}</span>
      </div>
      <div style={{ marginTop: 4 }}>Pagto: {PAG_LABEL[nota.forma_pagamento]}</div>
      {nota.mecanico_nome && <div>Mec.: {nota.mecanico_nome}</div>}
      {nota.observacoes && (
        <>
          <hr/>
          <div style={{ fontSize: 10 }}>{nota.observacoes}</div>
        </>
      )}
      <hr/>
      <div className="t-center" style={{ fontSize: 10, marginTop: 6 }}>
        Obrigado pela preferência!
      </div>
      <div className="t-center" style={{ fontSize: 9, color: '#666', marginTop: 4 }}>
        Documento não fiscal
      </div>
    </div>
  );
}

export function NotaPrintPage() {
  const { id } = useParams();
  const [nota, setNota] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [mode, setMode] = useState('a4');
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [n, cfg] = await Promise.all([
          api.get(`/notas/${id}`),
          api.get('/config'),
        ]);
        setNota(n);
        setEmpresa(cfg);
      } catch (err) {
        toast.error(err.message);
        navigate('/admin/notas');
      }
    })();
  }, [id]);

  if (!nota || !empresa) return <LoadingOverlay/>;

  return (
    <div style={{ margin: '-32px', minHeight: 'calc(100vh - 72px)' }}>
      <div className="print-toolbar no-print">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="admin-btn" onClick={() => navigate('/admin/notas')}>
            <Icon name="arrowLeft" size={14}/> Voltar
          </button>
          <div className="panel-tabs">
            <button className={`panel-tab ${mode === 'a4' ? 'active' : ''}`} onClick={() => setMode('a4')}>
              Folha A4
            </button>
            <button className={`panel-tab ${mode === 'thermal' ? 'active' : ''}`} onClick={() => setMode('thermal')}>
              Bobina 80mm
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn admin-btn-primary" onClick={() => window.print()}>
            <Icon name="printer" size={14}/> Imprimir
          </button>
        </div>
      </div>

      <div className="print-stage">
        {mode === 'a4'
          ? <PrintA4 nota={nota} empresa={empresa}/>
          : <PrintThermal nota={nota} empresa={empresa}/>
        }
      </div>
    </div>
  );
}
