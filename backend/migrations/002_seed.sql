-- Eraldo Refrigeração - Seed data (SQLite)
-- Senha padrão admin: eraldo123 (bcrypt hash)

-- Usuários (login por nome de usuário)
INSERT INTO users (nome, email, senha_hash, role) VALUES
('AdminAr', 'adminar@eraldorefrigeracao.com.br', '$2a$10$2gvocJ5RjEEr.r94jA3i8e460NqY8rWw1NbVSKOr.h.qS3ZpDDINW', 'admin'),
('Eraldomot', 'eraldomot@eraldorefrigeracao.com.br', '$2a$10$.9onsEI3ixaWRdSOQxneOuEaS/NcnFbGtExgpcB7B5sWz.SMknIEi', 'admin');

-- Configurações da empresa
INSERT INTO configuracoes (chave, valor) VALUES
('empresa_nome', 'Eraldo Refrigeração Automotiva'),
('empresa_cnpj', '42.358.712/0001-04'),
('empresa_endereco', 'Rua dos Borges, Bairro Borges'),
('empresa_cidade', 'Vitória de Santo Antão - PE'),
('empresa_telefone', '(81) 98728-0509'),
('empresa_email', 'contato@eraldorefrigeracao.com.br'),
('empresa_horario', 'Seg a Sex: 8h às 18h • Sáb: 8h às 13h'),
('ultimo_numero_nota', '0');

-- Mecânicos
INSERT INTO mecanicos (nome, telefone, especialidade, ativo) VALUES
('Eraldo Silva', '(81) 98728-0509', 'Refrigeração e diagnóstico elétrico', 1),
('João Pereira', '(81) 99123-4567', 'Instalação e manutenção', 1),
('Carlos Lima', '(81) 98765-4321', 'Troca de compressor', 1),
('Pedro Santos', '(81) 99888-7777', 'Higienização e recarga', 1);

-- Serviços padrão
INSERT INTO servicos_padrao (titulo, descricao, valor_padrao, ordem) VALUES
('Recarga de gás R134a', 'Recarga completa do sistema com gás R134a', 280.00, 1),
('Recarga de gás R1234yf', 'Recarga com gás R1234yf para veículos novos', 420.00, 2),
('Higienização com ozônio', 'Limpeza completa do sistema com ozônio', 180.00, 3),
('Diagnóstico elétrico', 'Scanner automotivo e teste completo', 95.00, 4),
('Troca de compressor', 'Substituição do compressor com peça garantida', 1400.00, 5),
('Troca de válvula de expansão', 'Substituição da válvula', 520.00, 6),
('Manutenção preventiva', 'Revisão completa do sistema A/C', 320.00, 7),
('Instalação de A/C completo', 'Kit completo para veículos sem A/C', 3200.00, 8),
('Troca de filtro de cabine', 'Substituição do filtro', 60.00, 9),
('Limpeza de evaporador', 'Limpeza química do evaporador', 220.00, 10),
('Teste de vazamento', 'Detecção de vazamento com contraste UV', 150.00, 11),
('Troca de condensador', 'Substituição do condensador', 850.00, 12);

-- Clientes de exemplo
INSERT INTO clientes (nome, cpf_cnpj, telefone, email, endereco, cidade) VALUES
('Marcos Albuquerque', '123.456.789-01', '(81) 99102-3344', 'marcos@email.com', 'Rua das Flores, 123', 'Vitória de Santo Antão'),
('Juliana Farias', '987.654.321-02', '(81) 98877-1290', 'juliana@email.com', 'Av. Central, 456', 'Gravatá'),
('Roberto Siqueira', '111.222.333-44', '(81) 99345-6677', 'roberto@email.com', 'Rua dos Pinheiros, 789', 'Recife'),
('Amanda Lopes', '555.444.333-22', '(81) 98123-4455', 'amanda@email.com', 'Rua do Sol, 321', 'Chã Grande'),
('Carlos Menezes', '777.888.999-00', '(81) 99876-5432', 'carlos@email.com', 'Rua Nova, 654', 'Bezerros');

-- Veículos
INSERT INTO veiculos (cliente_id, placa, modelo, ano, cor) VALUES
(1, 'PEF-4K21', 'Hilux SRV', 2019, 'Prata'),
(2, 'QPA-8H12', 'HB20 Comfort', 2021, 'Branco'),
(3, 'RVD-2M09', 'Master Minibus', 2022, 'Cinza'),
(4, 'OXI-7J33', 'Onix LT', 2020, 'Preto'),
(5, 'MPR-1Z88', 'Strada Working', 2018, 'Vermelho');

-- Notas de exemplo (DATE_SUB → datetime modifier)
INSERT INTO notas (numero, cliente_id, veiculo_id, mecanico_id, usuario_id, data_emissao, subtotal, total, forma_pagamento, status) VALUES
(483, 5, 5, 1, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'), 95.00, 95.00, 'dinheiro', 'cancelada'),
(484, 3, 3, 2, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day'), 1140.00, 1140.00, 'pix', 'paga'),
(485, 4, 4, 4, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 180.00, 180.00, 'dinheiro', 'aberta'),
(486, 2, 2, 1, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 520.00, 520.00, 'credito', 'paga'),
(487, 1, 1, 1, 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 280.00, 280.00, 'pix', 'paga');

-- Itens das notas
INSERT INTO nota_itens (nota_id, servico_id, descricao, quantidade, valor_unitario, valor_total) VALUES
(1, 4, 'Diagnóstico elétrico', 1, 95.00, 95.00),
(2, 7, 'Manutenção preventiva - 3 veículos', 3, 380.00, 1140.00),
(3, 3, 'Higienização com ozônio', 1, 180.00, 180.00),
(4, 6, 'Troca de válvula de expansão', 1, 520.00, 520.00),
(5, 1, 'Recarga de gás R134a', 1, 280.00, 280.00);

-- Atualiza último número de nota
UPDATE configuracoes SET valor = '487' WHERE chave = 'ultimo_numero_nota';
