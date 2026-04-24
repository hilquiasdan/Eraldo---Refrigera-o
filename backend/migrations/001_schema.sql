-- Eraldo Refrigeração - Database schema (SQLite)

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS nota_itens;
DROP TABLE IF EXISTS notas;
DROP TABLE IF EXISTS veiculos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS mecanicos;
DROP TABLE IF EXISTS servicos_padrao;
DROP TABLE IF EXISTS configuracoes;
DROP TABLE IF EXISTS users;

PRAGMA foreign_keys = ON;

-- Usuários do sistema (admin, mecânicos, atendentes)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'atendente' CHECK (role IN ('admin', 'mecanico', 'atendente')),
  ativo INTEGER NOT NULL DEFAULT 1,
  ultimo_acesso TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_ativo ON users(ativo);

CREATE TRIGGER trg_users_updated AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

-- Clientes
CREATE TABLE clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT NULL,
  telefone TEXT NOT NULL,
  email TEXT NULL,
  endereco TEXT NULL,
  cidade TEXT NULL,
  observacoes TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_clientes_nome ON clientes(nome);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);
CREATE INDEX idx_clientes_cpf ON clientes(cpf_cnpj);

CREATE TRIGGER trg_clientes_updated AFTER UPDATE ON clientes
BEGIN
  UPDATE clientes SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

-- Veículos (cada cliente pode ter vários)
CREATE TABLE veiculos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  placa TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NULL,
  cor TEXT NULL,
  observacoes TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX idx_veiculos_cliente ON veiculos(cliente_id);
CREATE INDEX idx_veiculos_placa ON veiculos(placa);

CREATE TRIGGER trg_veiculos_updated AFTER UPDATE ON veiculos
BEGIN
  UPDATE veiculos SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

-- Mecânicos
CREATE TABLE mecanicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  telefone TEXT NULL,
  email TEXT NULL,
  especialidade TEXT NULL,
  user_id INTEGER NULL,
  ativo INTEGER NOT NULL DEFAULT 1,
  observacoes TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_mecanicos_nome ON mecanicos(nome);
CREATE INDEX idx_mecanicos_ativo ON mecanicos(ativo);

CREATE TRIGGER trg_mecanicos_updated AFTER UPDATE ON mecanicos
BEGIN
  UPDATE mecanicos SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

-- Serviços padrão (catálogo de preços)
CREATE TABLE servicos_padrao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT NULL,
  valor_padrao REAL NOT NULL DEFAULT 0,
  ativo INTEGER NOT NULL DEFAULT 1,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_servicos_ativo ON servicos_padrao(ativo);

CREATE TRIGGER trg_servicos_updated AFTER UPDATE ON servicos_padrao
BEGIN
  UPDATE servicos_padrao SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

-- Notas (cabeçalho)
CREATE TABLE notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero INTEGER NOT NULL UNIQUE,
  cliente_id INTEGER NOT NULL,
  veiculo_id INTEGER NULL,
  mecanico_id INTEGER NULL,
  usuario_id INTEGER NOT NULL,
  data_emissao TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  subtotal REAL NOT NULL DEFAULT 0,
  desconto REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  forma_pagamento TEXT NOT NULL DEFAULT 'dinheiro' CHECK (forma_pagamento IN ('dinheiro', 'pix', 'debito', 'credito', 'boleto')),
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('paga', 'aberta', 'cancelada')),
  observacoes TEXT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE SET NULL,
  FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX idx_notas_numero ON notas(numero);
CREATE INDEX idx_notas_data ON notas(data_emissao);
CREATE INDEX idx_notas_cliente ON notas(cliente_id);
CREATE INDEX idx_notas_status ON notas(status);

CREATE TRIGGER trg_notas_updated AFTER UPDATE ON notas
BEGIN
  UPDATE notas SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = OLD.id;
END;

-- Itens das notas
CREATE TABLE nota_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nota_id INTEGER NOT NULL,
  servico_id INTEGER NULL,
  descricao TEXT NOT NULL,
  quantidade REAL NOT NULL DEFAULT 1,
  valor_unitario REAL NOT NULL,
  valor_total REAL NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE CASCADE,
  FOREIGN KEY (servico_id) REFERENCES servicos_padrao(id) ON DELETE SET NULL
);
CREATE INDEX idx_nota_itens_nota ON nota_itens(nota_id);

-- Configurações gerais (key-value)
CREATE TABLE configuracoes (
  chave TEXT NOT NULL PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TRIGGER trg_configuracoes_updated AFTER UPDATE ON configuracoes
BEGIN
  UPDATE configuracoes SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE chave = OLD.chave;
END;
