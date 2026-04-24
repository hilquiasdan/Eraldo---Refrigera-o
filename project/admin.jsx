/* Login + Admin Dashboard */

const Login = ({ onLogin, onBack }) => {
  const [user, setUser] = React.useState('admin');
  const [pass, setPass] = React.useState('eraldo123');
  const submit = (e) => { e.preventDefault(); onLogin(); };
  return (
    <div className="login-page">
      <a href="#" onClick={(e)=>{e.preventDefault(); onBack();}} className="login-back">
        <Icon name="arrowLeft" size={14}/> Voltar ao site
      </a>
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">
          <img src="assets/logo-transparent.png" alt="Eraldo"/>
        </div>
        <h1>Acesso Administrativo</h1>
        <p className="sub">Entre com seu usuário e senha para acessar o painel</p>
        <div className="field">
          <label>Usuário</label>
          <input value={user} onChange={e=>setUser(e.target.value)} placeholder="admin" autoFocus/>
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"/>
        </div>
        <button type="submit" className="submit-btn">
          <Icon name="lock" size={16}/> Entrar no painel
        </button>
        <div className="login-hint">
          <Icon name="eye" size={14} style={{flexShrink:0, marginTop: 2}}/>
          <div><strong>Demo:</strong> usuário <code>admin</code> / senha <code>eraldo123</code> (já preenchidos)</div>
        </div>
        <div className="login-alt">Esqueceu a senha? <a href="#">Recuperar acesso</a></div>
      </form>
    </div>
  );
};

/* Sparkline / bar chart */
const Chart30d = ({ data }) => {
  const w = 680, h = 220, pad = 28;
  const max = Math.max(...data);
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => [pad + i * step, h - pad - (v / max) * (h - pad * 2)]);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = path + ` L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;
  const total = data.reduce((a, b) => a + b, 0);
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1A9DE0" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#1A9DE0" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line key={i} x1={pad} x2={w-pad} y1={pad + (h-pad*2)*p} y2={pad + (h-pad*2)*p}
                stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 4"/>
        ))}
        <path d={area} fill="url(#chartFill)"/>
        <path d={path} stroke="#1A9DE0" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map(([x, y], i) => i % 3 === 0 && (
          <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke="#1A9DE0" strokeWidth="2"/>
        ))}
      </svg>
      <div style={{position: 'absolute', top: 0, right: 0, textAlign: 'right'}}>
        <div style={{fontSize: 12, color: 'var(--text-muted)'}}>Total 30 dias</div>
        <div style={{fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22}}>R$ {total.toLocaleString('pt-BR')}</div>
      </div>
    </div>
  );
};

const Sidebar = ({ active, setActive, onLogout }) => {
  const groups = [
    { label: 'Principal', items: [
      { id: 'dashboard', icon: 'home', label: 'Dashboard' },
      { id: 'nota', icon: 'zap', label: 'Nota Rápida', highlight: true },
    ]},
    { label: 'Cadastros', items: [
      { id: 'clientes', icon: 'users', label: 'Clientes', count: CLIENTES.length },
      { id: 'mecanicos', icon: 'userPlus', label: 'Mecânicos', count: 4 },
      { id: 'servicos', icon: 'wrench', label: 'Serviços Padrão', count: 12 },
    ]},
    { label: 'Histórico', items: [
      { id: 'notas', icon: 'file', label: 'Histórico de Notas', count: 487 },
      { id: 'relatorios', icon: 'chart', label: 'Relatórios' },
    ]},
    { label: 'Sistema', items: [
      { id: 'config', icon: 'settings', label: 'Configurações' },
    ]},
  ];
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <img src="assets/logo-transparent.png" alt="Eraldo"/>
        <div className="admin-logo-text">Eraldo<small>Painel v2.1</small></div>
      </div>
      <nav style={{flex: 1, overflowY: 'auto'}}>
        {groups.map(g => (
          <div key={g.label}>
            <div className="nav-group-lbl">{g.label}</div>
            {g.items.map(it => (
              <div key={it.id}
                   className={`nav-item ${active === it.id ? 'active' : ''}`}
                   onClick={() => setActive(it.id)}
                   style={it.highlight && active !== it.id ? {background: 'rgba(26,157,224,0.08)', color: '#fff'} : {}}>
                <Icon name={it.icon} size={18}/>
                <span>{it.label}</span>
                {it.count !== undefined && <span className="count">{it.count}</span>}
                {it.highlight && active !== it.id && <Icon name="plus" size={14} style={{marginLeft: 'auto', color: '#5EC4F2'}}/>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="admin-sidebar-foot">
        <div className="admin-user-avatar">ER</div>
        <div className="admin-user-meta">
          <div className="admin-user-name">Eraldo Silva</div>
          <div className="admin-user-role">Administrador</div>
        </div>
        <button className="nav-item" style={{padding: 8, margin: 0, flex: 'none'}} onClick={onLogout} title="Sair">
          <Icon name="logOut" size={16}/>
        </button>
      </div>
    </aside>
  );
};

const Dashboard = ({ setActive }) => {
  const kpis = [
    { icon: 'file', color: 'blue', label: 'Notas emitidas hoje', value: '8', sub: '3 pagas · 5 em aberto', trend: { dir: 'up', val: '+12%' } },
    { icon: 'dollar', color: 'green', label: 'Receita de hoje', value: 'R$ 3.720', sub: 'Ticket médio R$ 465', trend: { dir: 'up', val: '+18%' } },
    { icon: 'users', color: 'navy', label: 'Clientes cadastrados', value: '1.284', sub: '14 novos esta semana', trend: { dir: 'up', val: '+2.1%' } },
    { icon: 'wrench', color: 'orange', label: 'Mecânicos ativos', value: '4', sub: 'de 5 cadastrados', trend: { dir: 'up', val: '80%' } },
  ];
  return (
    <div>
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div className="kpi-card" key={i}>
            <div className="kpi-row">
              <div className={`kpi-icon ${k.color}`}><Icon name={k.icon} size={22}/></div>
              <span className={`kpi-trend ${k.trend.dir}`}>
                <Icon name="trending" size={12}/> {k.trend.val}
              </span>
            </div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="panels-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Faturamento - Últimos 30 dias</h3>
              <div className="h-sub">Receita diária acumulada em reais</div>
            </div>
            <div className="panel-tabs">
              <button className="panel-tab">7d</button>
              <button className="panel-tab active">30d</button>
              <button className="panel-tab">90d</button>
            </div>
          </div>
          <div className="chart-legend">
            <span><span className="dot" style={{background: '#1A9DE0'}}></span>Receita diária</span>
            <span style={{marginLeft: 'auto'}}><strong style={{color: '#1AAC4D'}}>↑ 24%</strong> vs. mês anterior</span>
          </div>
          <Chart30d data={FATURAMENTO_30D}/>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Últimas notas emitidas</h3>
              <div className="h-sub">5 mais recentes</div>
            </div>
            <button className="panel-tab" onClick={() => setActive('notas')} style={{color: 'var(--brand-cyan)'}}>Ver todas →</button>
          </div>
          <div>
            {NOTAS_RECENTES.map((n, i) => (
              <div className="list-item" key={i}>
                <div>
                  <div className="li-head">
                    <span className="li-num">{n.num}</span>
                    <span className="li-name">{n.cliente}</span>
                  </div>
                  <div className="li-sub">{n.servico} · {n.hora}</div>
                </div>
                <div className="li-right">
                  <div className="li-value">R$ {n.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                  <span className={`li-badge badge-${n.status}`}>
                    {n.status === 'paga' ? 'Paga' : n.status === 'aberta' ? 'Em aberto' : 'Cancelada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="qa-grid">
        <div className="qa-card" onClick={() => setActive('nota')}>
          <div className="kpi-icon blue"><Icon name="zap" size={22}/></div>
          <div style={{flex: 1}}>
            <h4>Nova Nota Rápida</h4>
            <p>Crie uma nota em 3 passos e imprima direto</p>
          </div>
          <Icon name="arrow" size={18} style={{color: 'var(--brand-cyan)'}}/>
        </div>
        <div className="qa-card" onClick={() => setActive('clientes')}>
          <div className="kpi-icon navy"><Icon name="userPlus" size={22}/></div>
          <div style={{flex: 1}}>
            <h4>Cadastrar Cliente</h4>
            <p>Adicione um novo cliente e seus veículos</p>
          </div>
          <Icon name="arrow" size={18} style={{color: 'var(--brand-cyan)'}}/>
        </div>
      </div>
    </div>
  );
};

const AdminPlaceholder = ({ titulo }) => (
  <div className="panel" style={{textAlign: 'center', padding: 80}}>
    <div className="kpi-icon blue" style={{width: 72, height: 72, margin: '0 auto 20px'}}>
      <Icon name="cog" size={32}/>
    </div>
    <h3 style={{fontSize: 22, marginBottom: 8}}>{titulo}</h3>
    <p style={{color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto'}}>
      Este módulo está na próxima fase do projeto. Podemos construí-lo com o mesmo nível de detalhe — peça que eu continue.
    </p>
  </div>
);

const Admin = ({ onLogout }) => {
  const [active, setActive] = React.useState('dashboard');
  const titles = {
    dashboard: { t: 'Dashboard', s: 'Visão geral do negócio hoje' },
    nota: { t: 'Nova Nota Rápida', s: 'Emissão de nota em 3 etapas' },
    clientes: { t: 'Clientes', s: 'Gestão de clientes e veículos' },
    mecanicos: { t: 'Mecânicos', s: 'Equipe técnica cadastrada' },
    servicos: { t: 'Serviços Padrão', s: 'Catálogo de serviços e preços' },
    notas: { t: 'Histórico de Notas', s: 'Todas as notas emitidas' },
    relatorios: { t: 'Relatórios', s: 'Análises e exportações' },
    config: { t: 'Configurações', s: 'Dados da empresa e preferências' },
  };
  const cur = titles[active] || titles.dashboard;
  return (
    <div className="admin-shell">
      <Sidebar active={active} setActive={setActive} onLogout={onLogout}/>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <h1>{cur.t}</h1>
            <p>{cur.s}</p>
          </div>
          <div className="admin-search">
            <Icon name="search" size={16}/>
            <input placeholder="Buscar cliente, placa, nota..."/>
          </div>
          <div className="admin-topbar-ctas">
            <button className="admin-btn" onClick={() => setActive('clientes')}>
              <Icon name="userPlus" size={15}/> Novo Cliente
            </button>
            <button className="admin-btn admin-btn-primary" onClick={() => setActive('nota')}>
              <Icon name="plus" size={15}/> Nova Nota
            </button>
            <button className="admin-bell"><Icon name="bell" size={18}/></button>
          </div>
        </header>
        <div className="admin-content">
          {active === 'dashboard' && <Dashboard setActive={setActive}/>}
          {active !== 'dashboard' && <AdminPlaceholder titulo={cur.t}/>}
        </div>
      </div>
    </div>
  );
};

window.Login = Login;
window.Admin = Admin;
