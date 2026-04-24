/* Dados fictícios do sistema Eraldo Refrigeração */

const CONFIG = {
  empresa: 'Eraldo Refrigeração Automotiva',
  endereco: 'Rua dos Borges, Bairro Borges',
  cidade: 'Vitória de Santo Antão - PE',
  telefone: '(81) 98728-0509',
  whatsappRaw: '5581987280509',
  email: 'contato@eraldorefrigeracao.com.br',
  cnpj: '42.358.712/0001-04',
  horario: 'Seg a Sex: 8h às 18h • Sáb: 8h às 13h',
  slogan: 'Seu ar-condicionado gelando. Do jeito certo.',
};

const SERVICOS = [
  { icon: 'zap', titulo: 'Recarga de Gás', desc: 'R134a e R1234yf com detecção de vazamento e pressão certificada.' },
  { icon: 'wrench', titulo: 'Instalação de A/C', desc: 'Kits completos para veículos sem ar-condicionado de fábrica.' },
  { icon: 'cog', titulo: 'Manutenção Preventiva', desc: 'Revisão anual completa do sistema, filtros e componentes.' },
  { icon: 'gauge', titulo: 'Diagnóstico Elétrico', desc: 'Scanner automotivo e teste de compressor, embreagem e fiação.' },
  { icon: 'sparkles', titulo: 'Higienização', desc: 'Limpeza com ozônio, elimina odores, fungos e bactérias.' },
  { icon: 'snowflake', titulo: 'Troca de Compressor', desc: 'Peças originais e paralelas homologadas com garantia de 6 meses.' },
];

const STATS = [
  { num: 17, suffix: '+', lbl: 'Anos de experiência' },
  { num: 4200, suffix: '+', lbl: 'Clientes atendidos' },
  { num: 12800, suffix: '+', lbl: 'Serviços realizados' },
  { num: 98, suffix: '%', lbl: 'Satisfação dos clientes' },
];

const DEPOIMENTOS = [
  { nome: 'Marcos Albuquerque', meta: 'Hilux 2019 • Vitória de Santo Antão', stars: 5,
    texto: 'Recarreguei o ar da Hilux e fiquei impressionado com o profissionalismo. Explicaram cada detalhe, fizeram o teste de vazamento antes e só depois repuseram o gás. Gelou como nunca.' },
  { nome: 'Juliana Farias', meta: 'HB20 2021 • Gravatá', stars: 5,
    texto: 'Meu ar não estava gelando direito e fui em várias oficinas. O Eraldo descobriu em 20 minutos que era a válvula de expansão. Honesto e rápido, virei cliente fiel.' },
  { nome: 'Roberto Siqueira', meta: 'Frota de vans • Recife', stars: 5,
    texto: 'Faço a manutenção preventiva da minha frota com eles há 4 anos. Pontualidade, nota fiscal, garantia e preço justo. Recomendo para qualquer empresa.' },
  { nome: 'Amanda Lopes', meta: 'Onix 2020 • Chã Grande', stars: 5,
    texto: 'Higienizaram o ar com ozônio e sumiu aquele cheiro de mofo que me incomodava há meses. Atendimento nota 10, preço muito honesto.' },
  { nome: 'Carlos Menezes', meta: 'Strada 2018 • Bezerros', stars: 5,
    texto: 'Trocaram o compressor da Strada com peça com garantia. Já faz 8 meses e continua gelando perfeito. Serviço sério como não se encontra mais.' },
];

const GALERIA = [
  { tipo: 'Oficina', classes: 'wide', cor: 'linear-gradient(135deg, #1E2A6E, #1A9DE0)', icon: 'home' },
  { tipo: 'Diagnóstico', classes: '', cor: 'linear-gradient(135deg, #2036A3, #4AB2E8)', icon: 'gauge' },
  { tipo: 'Recarga', classes: 'tall', cor: 'linear-gradient(160deg, #0B1036, #1A9DE0)', icon: 'zap' },
  { tipo: 'Equipe', classes: '', cor: 'linear-gradient(135deg, #1A9DE0, #5EC4F2)', icon: 'users' },
  { tipo: 'Compressor', classes: '', cor: 'linear-gradient(135deg, #141B4A, #2036A3)', icon: 'snowflake' },
  { tipo: 'Instalação', classes: 'wide', cor: 'linear-gradient(135deg, #1A9DE0, #1E2A6E)', icon: 'wrench' },
  { tipo: 'Higienização', classes: '', cor: 'linear-gradient(135deg, #0B1036, #1A9DE0)', icon: 'sparkles' },
];

/* Admin - dados fictícios */
const CLIENTES = [
  { id: 1, nome: 'Marcos Albuquerque', cpf: '123.456.789-01', fone: '(81) 99102-3344', placa: 'PEF-4K21', carro: 'Hilux SRV 2019' },
  { id: 2, nome: 'Juliana Farias', cpf: '987.654.321-02', fone: '(81) 98877-1290', placa: 'QPA-8H12', carro: 'HB20 Comfort 2021' },
  { id: 3, nome: 'Roberto Siqueira', cpf: '111.222.333-44', fone: '(81) 99345-6677', placa: 'RVD-2M09', carro: 'Master Minibus 2022' },
  { id: 4, nome: 'Amanda Lopes', cpf: '555.444.333-22', fone: '(81) 98123-4455', placa: 'OXI-7J33', carro: 'Onix LT 2020' },
  { id: 5, nome: 'Carlos Menezes', cpf: '777.888.999-00', fone: '(81) 99876-5432', placa: 'MPR-1Z88', carro: 'Strada Working 2018' },
];

const NOTAS_RECENTES = [
  { num: '#0487', cliente: 'Marcos Albuquerque', servico: 'Recarga de gás R134a', valor: 280.00, status: 'paga', hora: 'Hoje, 14:32' },
  { num: '#0486', cliente: 'Juliana Farias', servico: 'Troca de válvula de expansão', valor: 520.00, status: 'paga', hora: 'Hoje, 11:08' },
  { num: '#0485', cliente: 'Amanda Lopes', servico: 'Higienização com ozônio', valor: 180.00, status: 'aberta', hora: 'Hoje, 10:15' },
  { num: '#0484', cliente: 'Roberto Siqueira', servico: 'Manutenção preventiva - 3 veículos', valor: 1140.00, status: 'paga', hora: 'Ontem, 17:40' },
  { num: '#0483', cliente: 'Carlos Menezes', servico: 'Diagnóstico elétrico', valor: 95.00, status: 'cancelada', hora: 'Ontem, 14:22' },
];

/* Faturamento últimos 30 dias - dados simulados */
const FATURAMENTO_30D = [
  820, 1240, 960, 1580, 2100, 1450, 680,
  1320, 1890, 2240, 1760, 2410, 2680, 950,
  1520, 2180, 1940, 2650, 3120, 2840, 1120,
  2320, 2780, 3240, 2940, 3480, 3890, 1480,
  3210, 3720
];

Object.assign(window, { CONFIG, SERVICOS, STATS, DEPOIMENTOS, GALERIA, CLIENTES, NOTAS_RECENTES, FATURAMENTO_30D });
