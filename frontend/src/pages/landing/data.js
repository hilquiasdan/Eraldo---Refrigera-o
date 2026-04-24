export const LANDING_CONFIG = {
  empresa: 'Eraldo Refrigeração Automotiva',
  endereco: 'Rua dos Borges, Bairro Borges',
  cidade: 'Vitória de Santo Antão - PE',
  telefone: '(81) 98728-0509',
  whatsappRaw: '5581987280509',
  email: 'contato@eraldorefrigeracao.com.br',
  cnpj: '42.358.712/0001-04',
  horario: 'Seg a Sex: 8h às 18h • Sáb: 8h às 13h',
};

export const SERVICOS_LANDING = [
  { icon: 'zap', titulo: 'Recarga de Gás', desc: 'R134a e R1234yf com detecção de vazamento e pressão certificada.' },
  { icon: 'wrench', titulo: 'Instalação de A/C', desc: 'Kits completos para veículos sem ar-condicionado de fábrica.' },
  { icon: 'cog', titulo: 'Manutenção Preventiva', desc: 'Revisão anual completa do sistema, filtros e componentes.' },
  { icon: 'gauge', titulo: 'Diagnóstico Elétrico', desc: 'Scanner automotivo e teste de compressor, embreagem e fiação.' },
  { icon: 'sparkles', titulo: 'Higienização', desc: 'Limpeza com ozônio, elimina odores, fungos e bactérias.' },
  { icon: 'snowflake', titulo: 'Troca de Compressor', desc: 'Peças originais e paralelas homologadas com garantia de 6 meses.' },
];

export const STATS = [
  { num: 17, suffix: '+', lbl: 'Anos de experiência' },
  { num: 4200, suffix: '+', lbl: 'Clientes atendidos' },
  { num: 12800, suffix: '+', lbl: 'Serviços realizados' },
  { num: 98, suffix: '%', lbl: 'Satisfação dos clientes' },
];

export const DEPOIMENTOS = [
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

export const GALERIA = [
  { tipo: 'Oficina', classes: 'wide', cor: 'linear-gradient(135deg, #1E2A6E, #1A9DE0)', icon: 'home' },
  { tipo: 'Diagnóstico', classes: '', cor: 'linear-gradient(135deg, #2036A3, #4AB2E8)', icon: 'gauge' },
  { tipo: 'Recarga', classes: 'tall', cor: 'linear-gradient(160deg, #0B1036, #1A9DE0)', icon: 'zap' },
  { tipo: 'Equipe', classes: '', cor: 'linear-gradient(135deg, #1A9DE0, #5EC4F2)', icon: 'users' },
  { tipo: 'Compressor', classes: '', cor: 'linear-gradient(135deg, #141B4A, #2036A3)', icon: 'snowflake' },
  { tipo: 'Instalação', classes: 'wide', cor: 'linear-gradient(135deg, #1A9DE0, #1E2A6E)', icon: 'wrench' },
  { tipo: 'Higienização', classes: '', cor: 'linear-gradient(135deg, #0B1036, #1A9DE0)', icon: 'sparkles' },
];
