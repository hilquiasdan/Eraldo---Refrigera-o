// Entry point para Hostinger / Passenger / qualquer painel Node.js.
// Usa static import (não dynamic import) — assim Passenger detecta
// o app.listen() durante o carregamento do módulo.
import './src/server.js';
