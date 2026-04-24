-- Eraldo Refrigeração - Database schema
-- MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS nota_itens;
DROP TABLE IF EXISTS notas;
DROP TABLE IF EXISTS veiculos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS mecanicos;
DROP TABLE IF EXISTS servicos_padrao;
DROP TABLE IF EXISTS configuracoes;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- Usuários do sistema (admin, mecânicos, atendentes)
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'mecanico', 'atendente') NOT NULL DEFAULT 'atendente',
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  ultimo_acesso DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clientes
CREATE TABLE clientes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(160) NOT NULL,
  cpf_cnpj VARCHAR(20) NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(160) NULL,
  endereco VARCHAR(255) NULL,
  cidade VARCHAR(100) NULL,
  observacoes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clientes_nome (nome),
  INDEX idx_clientes_telefone (telefone),
  INDEX idx_clientes_cpf (cpf_cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Veículos (cada cliente pode ter vários)
CREATE TABLE veiculos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT UNSIGNED NOT NULL,
  placa VARCHAR(10) NOT NULL,
  modelo VARCHAR(120) NOT NULL,
  ano SMALLINT UNSIGNED NULL,
  cor VARCHAR(40) NULL,
  observacoes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  INDEX idx_veiculos_cliente (cliente_id),
  INDEX idx_veiculos_placa (placa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mecânicos (equipe técnica — pode ou não ter login)
CREATE TABLE mecanicos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  telefone VARCHAR(20) NULL,
  email VARCHAR(160) NULL,
  especialidade VARCHAR(120) NULL,
  user_id INT UNSIGNED NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  observacoes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_mecanicos_nome (nome),
  INDEX idx_mecanicos_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Serviços padrão (catálogo de preços)
CREATE TABLE servicos_padrao (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  descricao TEXT NULL,
  valor_padrao DECIMAL(10,2) NOT NULL DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_servicos_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notas (cabeçalho)
CREATE TABLE notas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero INT UNSIGNED NOT NULL UNIQUE,
  cliente_id INT UNSIGNED NOT NULL,
  veiculo_id INT UNSIGNED NULL,
  mecanico_id INT UNSIGNED NULL,
  usuario_id INT UNSIGNED NOT NULL,
  data_emissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  forma_pagamento ENUM('dinheiro', 'pix', 'debito', 'credito', 'boleto') NOT NULL DEFAULT 'dinheiro',
  status ENUM('paga', 'aberta', 'cancelada') NOT NULL DEFAULT 'aberta',
  observacoes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE SET NULL,
  FOREIGN KEY (mecanico_id) REFERENCES mecanicos(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_notas_numero (numero),
  INDEX idx_notas_data (data_emissao),
  INDEX idx_notas_cliente (cliente_id),
  INDEX idx_notas_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itens das notas
CREATE TABLE nota_itens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nota_id INT UNSIGNED NOT NULL,
  servico_id INT UNSIGNED NULL,
  descricao VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  ordem INT NOT NULL DEFAULT 0,
  FOREIGN KEY (nota_id) REFERENCES notas(id) ON DELETE CASCADE,
  FOREIGN KEY (servico_id) REFERENCES servicos_padrao(id) ON DELETE SET NULL,
  INDEX idx_nota_itens_nota (nota_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configurações gerais (key-value para dados da empresa, preferências)
CREATE TABLE configuracoes (
  chave VARCHAR(80) NOT NULL PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
