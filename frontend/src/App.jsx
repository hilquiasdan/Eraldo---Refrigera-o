import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { ThemeProvider } from './hooks/useTheme';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { AdminShell } from './components/admin/AdminShell';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/admin/LoginPage';
import { Dashboard } from './pages/admin/Dashboard';
import { ClientesPage } from './pages/admin/ClientesPage';
import { MecanicosPage } from './pages/admin/MecanicosPage';
import { ServicosPage } from './pages/admin/ServicosPage';
import { NotasPage } from './pages/admin/NotasPage';
import { NotaWizard } from './pages/admin/NotaWizard';
import { NotaPrintPage } from './pages/admin/NotaPrintPage';
import { UsuariosPage } from './pages/admin/UsuariosPage';
import { RelatoriosPage } from './pages/admin/RelatoriosPage';
import { ConfigPage } from './pages/admin/ConfigPage';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage/>}/>
              <Route path="/login" element={<LoginPage/>}/>
              <Route path="/admin" element={
                <ProtectedRoute><AdminShell/></ProtectedRoute>
              }>
                <Route index element={<Dashboard/>}/>
                <Route path="nota" element={<NotaWizard/>}/>
                <Route path="notas" element={<NotasPage/>}/>
                <Route path="notas/:id/imprimir" element={<NotaPrintPage/>}/>
                <Route path="clientes" element={<ClientesPage/>}/>
                <Route path="mecanicos" element={<MecanicosPage/>}/>
                <Route path="servicos" element={<ServicosPage/>}/>
                <Route path="relatorios" element={<RelatoriosPage/>}/>
                <Route path="configuracoes" element={<ConfigPage/>}/>
                <Route path="usuarios" element={
                  <ProtectedRoute roles={['admin']}><UsuariosPage/></ProtectedRoute>
                }/>
              </Route>
              <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
