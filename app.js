// Entry point alternativo — alguns painéis (Hostinger/Passenger) preferem app.js na raiz
// Apenas redireciona para o entry real em src/server.js
import('./src/server.js').catch((err) => {
  console.error('Falha ao iniciar src/server.js:', err);
  process.exit(1);
});
