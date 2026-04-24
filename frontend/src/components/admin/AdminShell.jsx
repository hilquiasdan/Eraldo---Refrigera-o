import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { initials } from '../../lib/format';

const GROUPS = [
  { label: 'Principal', items: [
    { to: '/admin', icon: 'home', label: 'Dashboard', end: true },
    { to: '/admin/nota', icon: 'zap', label: 'Nota Rápida', highlight: true },
  ]},
  { label: 'Cadastros', items: [
    { to: '/admin/clientes', icon: 'users', label: 'Clientes' },
    { to: '/admin/mecanicos', icon: 'userPlus', label: 'Mecânicos' },
    { to: '/admin/servicos', icon: 'wrench', label: 'Serviços Padrão' },
  ]},
  { label: 'Histórico', items: [
    { to: '/admin/notas', icon: 'file', label: 'Histórico de Notas' },
    { to: '/admin/relatorios', icon: 'chart', label: 'Relatórios' },
  ]},
  { label: 'Sistema', items: [
    { to: '/admin/usuarios', icon: 'user', label: 'Usuários', adminOnly: true },
    { to: '/admin/configuracoes', icon: 'settings', label: 'Configurações' },
  ]},
];

const PAGE_META = {
  '/admin': { t: 'Dashboard', s: 'Visão geral do negócio hoje' },
  '/admin/nota': { t: 'Nova Nota Rápida', s: 'Emissão de nota em 3 etapas' },
  '/admin/clientes': { t: 'Clientes', s: 'Gestão de clientes e veículos' },
  '/admin/mecanicos': { t: 'Mecânicos', s: 'Equipe técnica cadastrada' },
  '/admin/servicos': { t: 'Serviços Padrão', s: 'Catálogo de serviços e preços' },
  '/admin/notas': { t: 'Histórico de Notas', s: 'Todas as notas emitidas' },
  '/admin/relatorios': { t: 'Relatórios', s: 'Análises e exportações' },
  '/admin/usuarios': { t: 'Usuários', s: 'Gestão de acessos ao sistema' },
  '/admin/configuracoes': { t: 'Configurações', s: 'Dados da empresa e preferências' },
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <img src="/logo.png" alt="Eraldo"/>
        <div className="admin-logo-text">Eraldo<small>Painel v2.1</small></div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {GROUPS.map(g => (
          <div key={g.label}>
            <div className="nav-group-lbl">{g.label}</div>
            {g.items
              .filter(it => !it.adminOnly || user?.role === 'admin')
              .map(it => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.end}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  style={it.highlight ? { background: 'rgba(26,157,224,0.08)', color: '#fff' } : undefined}
                >
                  <Icon name={it.icon} size={18}/>
                  <span>{it.label}</span>
                  {it.highlight && <Icon name="plus" size={14} style={{ marginLeft: 'auto', color: '#5EC4F2' }}/>}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>
      <div className="admin-sidebar-foot">
        <div className="admin-user-avatar">{initials(user?.nome)}</div>
        <div className="admin-user-meta">
          <div className="admin-user-name">{user?.nome || '—'}</div>
          <div className="admin-user-role">{user?.role === 'admin' ? 'Administrador' : user?.role === 'mecanico' ? 'Mecânico' : 'Atendente'}</div>
        </div>
        <button
          className="nav-item"
          style={{ padding: 8, margin: 0, flex: 'none' }}
          onClick={handleLogout}
          title="Sair"
          aria-label="Sair"
        >
          <Icon name="logOut" size={16}/>
        </button>
      </div>
    </aside>
  );
}

function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const cur = PAGE_META[location.pathname]
    || PAGE_META[Object.keys(PAGE_META).find(k => location.pathname.startsWith(k)) || '/admin']
    || PAGE_META['/admin'];

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <h1>{cur.t}</h1>
        <p>{cur.s}</p>
      </div>
      <div className="admin-topbar-ctas" style={{ marginLeft: 'auto' }}>
        <button
          className="admin-btn"
          onClick={() => navigate('/admin/clientes?novo=1')}
          title="Novo cliente"
        >
          <Icon name="userPlus" size={15}/> <span className="hide-mobile">Novo Cliente</span>
        </button>
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => navigate('/admin/nota')}
        >
          <Icon name="plus" size={15}/> <span className="hide-mobile">Nova Nota</span>
        </button>
        <button
          className="admin-bell"
          onClick={toggle}
          title={`Tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18}/>
        </button>
      </div>
    </header>
  );
}

export function AdminShell() {
  return (
    <div className="admin-shell">
      <Sidebar/>
      <div className="admin-main">
        <TopBar/>
        <div className="admin-content">
          <Outlet/>
        </div>
      </div>
    </div>
  );
}
