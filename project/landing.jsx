/* Landing page - componentes */

const Snow = () => {
  const flakes = React.useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: Math.random() * 100,
      duration: 8 + Math.random() * 10,
      delay: -Math.random() * 15,
      size: 8 + Math.random() * 16,
      opacity: 0.3 + Math.random() * 0.6,
    }));
  }, []);
  return (
    <div className="snow-container">
      {flakes.map((f, i) => (
        <div key={i} className="snowflake" style={{
          left: `${f.left}%`, animationDuration: `${f.duration}s`,
          animationDelay: `${f.delay}s`, fontSize: `${f.size}px`, opacity: f.opacity,
        }}>❄</div>
      ))}
    </div>
  );
};

const HeroCar = () => (
  <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5EC4F2"/>
        <stop offset="100%" stopColor="#1A9DE0"/>
      </linearGradient>
      <linearGradient id="carBody2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E2A6E"/>
        <stop offset="100%" stopColor="#141B4A"/>
      </linearGradient>
    </defs>
    {/* Car silhouette */}
    <g transform="translate(40, 110)">
      <path d="M20 80 L30 50 Q40 30 70 28 L130 25 Q160 22 180 35 L230 55 L290 60 Q310 62 315 80 L315 110 Q315 118 307 118 L25 118 Q17 118 17 110 Z"
            fill="url(#carBody2)" opacity="0.95"/>
      <path d="M65 50 L75 32 Q80 28 88 28 L150 28 Q158 28 168 34 L205 55 Z"
            fill="url(#carBody)" opacity="0.4"/>
      {/* Wheels */}
      <circle cx="75" cy="118" r="22" fill="#0B1036"/>
      <circle cx="75" cy="118" r="14" fill="#1A9DE0"/>
      <circle cx="75" cy="118" r="6" fill="#0B1036"/>
      <circle cx="255" cy="118" r="22" fill="#0B1036"/>
      <circle cx="255" cy="118" r="14" fill="#1A9DE0"/>
      <circle cx="255" cy="118" r="6" fill="#0B1036"/>
      {/* Headlight */}
      <circle cx="302" cy="82" r="6" fill="#FFF" opacity="0.8"/>
      {/* Speed lines */}
      <g opacity="0.5" stroke="#5EC4F2" strokeWidth="2" strokeLinecap="round">
        <line x1="-20" y1="50" x2="15" y2="50"/>
        <line x1="-35" y1="70" x2="10" y2="70"/>
        <line x1="-15" y1="90" x2="12" y2="90"/>
      </g>
    </g>
    {/* Big snowflake */}
    <g transform="translate(280, 60)" stroke="#5EC4F2" strokeWidth="2.5" fill="none" strokeLinecap="round">
      <line x1="0" y1="-30" x2="0" y2="30"/>
      <line x1="-30" y1="0" x2="30" y2="0"/>
      <line x1="-21" y1="-21" x2="21" y2="21"/>
      <line x1="21" y1="-21" x2="-21" y2="21"/>
      <path d="M -6 -24 L 0 -30 L 6 -24" /><path d="M -6 24 L 0 30 L 6 24" />
      <path d="M -24 -6 L -30 0 L -24 6" /><path d="M 24 -6 L 30 0 L 24 6" />
    </g>
  </svg>
);

const Header = ({ onNav, onAdmin }) => {
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn(); window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const links = [
    { href: '#servicos', label: 'Serviços' },
    { href: '#diferenciais', label: 'Diferenciais' },
    { href: '#depoimentos', label: 'Depoimentos' },
    { href: '#galeria', label: 'Galeria' },
    { href: '#contato', label: 'Contato' },
  ];
  const smooth = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };
  return (
    <React.Fragment>
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }}>
            <img src="assets/logo-transparent.png" alt="Eraldo Refrigeração" />
          </a>
          <div className="nav-links">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={(e) => smooth(e, l.href)} className="nav-link">{l.label}</a>
            ))}
          </div>
          <a href="#" className="nav-cta" onClick={(e)=>{e.preventDefault(); onAdmin();}}>
            <Icon name="lock" size={16}/> Área Admin
          </a>
          <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? 'x' : 'menu'} size={22}/>
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          {links.map(l => (
            <a key={l.href} href={l.href} onClick={(e) => smooth(e, l.href)}>{l.label}</a>
          ))}
          <a href="#" onClick={(e)=>{e.preventDefault(); onAdmin();}} style={{color: 'var(--brand-cyan)', fontWeight: 600}}>
            Área Admin →
          </a>
        </div>
      )}
    </React.Fragment>
  );
};

const Hero = () => {
  const wpp = `https://wa.me/${CONFIG.whatsappRaw}?text=${encodeURIComponent('Olá! Gostaria de agendar um serviço de ar-condicionado.')}`;
  return (
    <section className="hero">
      <div className="hero-grid"></div>
      <div className="hero-glow"></div>
      <Snow/>
      <div className="hero-inner">
        <div>
          <div className="hero-eyebrow">
            <span className="dot"></span>
            Especialistas em climatização automotiva desde 2008
          </div>
          <h1>
            Seu ar-condicionado<br/>
            gelando. <span className="accent">Do jeito certo.</span>
          </h1>
          <p className="hero-sub">
            Diagnóstico preciso, peças com garantia e atendimento técnico que respeita seu tempo e o seu veículo. Em Vitória de Santo Antão e toda a região.
          </p>
          <div className="hero-ctas">
            <a href={wpp} target="_blank" rel="noopener" className="btn-primary">
              <Icon name="whatsapp" size={18}/>
              Agendar via WhatsApp
            </a>
            <a href="#servicos" className="btn-secondary" onClick={(e)=>{e.preventDefault(); document.querySelector('#servicos').scrollIntoView({behavior:'smooth'});}}>
              Ver serviços <Icon name="arrow" size={16}/>
            </a>
          </div>
          <div className="hero-stats">
            <div><div className="hero-stat-num">17+</div><div className="hero-stat-lbl">Anos no mercado</div></div>
            <div><div className="hero-stat-num">4.2K</div><div className="hero-stat-lbl">Clientes atendidos</div></div>
            <div><div className="hero-stat-num">4.9★</div><div className="hero-stat-lbl">Avaliação média</div></div>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-temp">
            <div className="hero-panel-temp-val">5.4°C</div>
            <div className="hero-panel-temp-lbl">Saída de ar • ideal</div>
          </div>
          <div className="hero-panel-badge">
            <Icon name="shield" size={14}/>
            Garantia de 6 meses
          </div>
          <div className="hero-panel-car">
            <HeroCar/>
          </div>
        </div>
      </div>
    </section>
  );
};

const Servicos = () => (
  <section className="section" id="servicos">
    <div className="section-inner">
      <div className="section-head">
        <span className="section-eyebrow"><Icon name="wrench" size={12}/> Nossos serviços</span>
        <h2>Tudo que seu A/C precisa, em um só lugar</h2>
        <p className="section-sub">Equipamentos profissionais, peças homologadas e técnicos com certificação. Orçamento transparente antes de qualquer serviço.</p>
      </div>
      <div className="services-grid">
        {SERVICOS.map((s, i) => (
          <div className="service-card" key={i}>
            <div className="service-icon"><Icon name={s.icon} size={24}/></div>
            <h3>{s.titulo}</h3>
            <p>{s.desc}</p>
            <span className="more">Saber mais <Icon name="arrow" size={14}/></span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const useCounter = (target, inView, duration = 1600) => {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    let start = 0;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return val;
};

const Diferenciais = () => {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section className="section" id="diferenciais" style={{paddingTop: 40}}>
      <div className="section-inner">
        <div ref={ref} className="stats-band">
          {STATS.map((s, i) => {
            const v = useCounter(s.num, inView);
            return (
              <div className="stat-item" key={i}>
                <div className="stat-num">
                  {v.toLocaleString('pt-BR')}<span className="suffix">{s.suffix}</span>
                </div>
                <div className="stat-div"></div>
                <div className="stat-lbl">{s.lbl}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Depoimentos = () => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const timer = setInterval(() => {
      if (!el) return;
      const cardW = 440;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 40) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: cardW, behavior: 'smooth' });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const initials = (n) => n.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <section className="section" id="depoimentos" style={{background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)'}}>
      <div className="section-inner">
        <div className="section-head">
          <span className="section-eyebrow"><Icon name="star" size={12}/> Depoimentos</span>
          <h2>A confiança de quem volta sempre</h2>
          <p className="section-sub">Mais de 4 mil clientes atendidos em 17 anos. Leia o que nossos clientes falam sobre o serviço.</p>
        </div>
        <div className="tst-track" ref={ref}>
          {DEPOIMENTOS.map((d, i) => (
            <div className="tst-card" key={i}>
              <div className="tst-quote-mark">"</div>
              <div className="tst-stars">
                {Array.from({length: d.stars}).map((_, j) => <Icon key={j} name="star" size={16} stroke={0} style={{fill: '#F5B90A'}}/>)}
              </div>
              <p className="tst-text">"{d.texto}"</p>
              <div className="tst-who">
                <div className="tst-avatar">{initials(d.nome)}</div>
                <div>
                  <div className="tst-name">{d.nome}</div>
                  <div className="tst-meta">{d.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Galeria = () => {
  const [open, setOpen] = React.useState(null);
  return (
    <section className="section" id="galeria">
      <div className="section-inner">
        <div className="section-head">
          <span className="section-eyebrow"><Icon name="camera" size={12}/> Nossa oficina</span>
          <h2>Estrutura completa, equipamentos profissionais</h2>
          <p className="section-sub">Ambiente limpo, seguro e organizado. Sua confiança começa quando você entra na nossa oficina.</p>
        </div>
        <div className="gal-grid">
          {GALERIA.map((g, i) => (
            <div className={`gal-item ${g.classes}`} key={i} onClick={() => setOpen(g)}>
              <div className="ph" style={{background: g.cor}}>
                <Icon name={g.icon} size={48} stroke={1.5} className="ph-icon"/>
                <div className="ph-label">{g.tipo}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {open && (
        <div className="lightbox-backdrop" onClick={() => setOpen(null)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setOpen(null)}><Icon name="x" size={18}/></button>
            <div className="lightbox-img" style={{background: open.cor}}>
              <div style={{textAlign: 'center'}}>
                <Icon name={open.icon} size={80} stroke={1.5} style={{opacity: 0.5, marginBottom: 16}}/>
                <div>{open.tipo}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const Formulario = () => {
  const [form, setForm] = React.useState({ nome: '', fone: '', veiculo: '', servico: 'Recarga de gás', msg: '' });
  const submit = (e) => {
    e.preventDefault();
    const texto = `*Orçamento - Eraldo Refrigeração*\n\n*Nome:* ${form.nome}\n*Telefone:* ${form.fone}\n*Veículo:* ${form.veiculo}\n*Serviço:* ${form.servico}\n*Mensagem:* ${form.msg}`;
    window.open(`https://wa.me/${CONFIG.whatsappRaw}?text=${encodeURIComponent(texto)}`, '_blank');
  };
  return (
    <section className="section form-section" id="contato">
      <div className="section-inner">
        <div className="section-head">
          <span className="section-eyebrow"><Icon name="whatsapp" size={12}/> Orçamento rápido</span>
          <h2>Peça seu orçamento em 1 minuto</h2>
          <p className="section-sub">Preencha os dados abaixo e enviaremos sua solicitação direto para o WhatsApp. Respondemos em minutos.</p>
        </div>
        <div className="form-grid">
          <div className="form-side">
            <h3>Fale direto com a gente</h3>
            <div className="form-side-item">
              <div className="form-side-icon"><Icon name="phone" size={18}/></div>
              <div><h4>Telefone e WhatsApp</h4><p>{CONFIG.telefone}</p></div>
            </div>
            <div className="form-side-item">
              <div className="form-side-icon"><Icon name="pin" size={18}/></div>
              <div><h4>Endereço</h4><p>{CONFIG.endereco}<br/>{CONFIG.cidade}</p></div>
            </div>
            <div className="form-side-item">
              <div className="form-side-icon"><Icon name="clock" size={18}/></div>
              <div><h4>Horário de atendimento</h4><p>{CONFIG.horario}</p></div>
            </div>
            <div className="form-side-item">
              <div className="form-side-icon"><Icon name="mail" size={18}/></div>
              <div><h4>E-mail</h4><p>{CONFIG.email}</p></div>
            </div>
          </div>
          <form className="form-card" onSubmit={submit}>
            <div className="field"><label>Nome completo</label>
              <input required value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} placeholder="Seu nome"/></div>
            <div className="field-row">
              <div className="field"><label>Telefone</label>
                <input required value={form.fone} onChange={e=>setForm({...form, fone:e.target.value})} placeholder="(81) 99999-0000"/></div>
              <div className="field"><label>Veículo</label>
                <input required value={form.veiculo} onChange={e=>setForm({...form, veiculo:e.target.value})} placeholder="Ex: Onix 2020"/></div>
            </div>
            <div className="field"><label>Serviço desejado</label>
              <select value={form.servico} onChange={e=>setForm({...form, servico:e.target.value})}>
                {SERVICOS.map(s => <option key={s.titulo}>{s.titulo}</option>)}
                <option>Outro / não sei</option>
              </select></div>
            <div className="field"><label>Mensagem</label>
              <textarea value={form.msg} onChange={e=>setForm({...form, msg:e.target.value})} placeholder="Descreva o que está acontecendo com seu ar..."/></div>
            <button type="submit" className="submit-btn">
              <Icon name="whatsapp" size={18}/> Enviar para o WhatsApp
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const Mapa = () => (
  <section className="section" style={{paddingTop: 0}}>
    <div className="section-inner">
      <div className="map-card">
        <div className="map-info">
          <span className="section-eyebrow" style={{marginBottom: 14}}><Icon name="map" size={12}/> Como chegar</span>
          <h3>Visite nossa oficina</h3>
          <p>{CONFIG.endereco}<br/>{CONFIG.cidade}<br/>{CONFIG.horario}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.endereco + ', ' + CONFIG.cidade)}`} target="_blank" rel="noopener" className="btn-primary">
            <Icon name="pin" size={16}/> Abrir no Google Maps
          </a>
        </div>
        <div className="map-embed">
          <svg className="map-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
            <g stroke="rgba(30,42,110,0.2)" strokeWidth="1" fill="none">
              <path d="M0 150 Q100 120 200 140 T400 160"/>
              <path d="M0 100 Q120 80 240 95 T400 110"/>
              <path d="M0 210 Q140 200 260 215 T400 230"/>
              <line x1="80" y1="0" x2="90" y2="300"/>
              <line x1="200" y1="0" x2="210" y2="300"/>
              <line x1="320" y1="0" x2="330" y2="300"/>
            </g>
          </svg>
          <div className="map-pin"><Icon name="snowflake" size={22}/></div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer-grid">
      <div className="footer-logo">
        <img src="assets/logo-transparent.png" alt="Eraldo Refrigeração"/>
        <p className="footer-desc">Especialistas em refrigeração automotiva desde 2008. Atendimento técnico sério em Vitória de Santo Antão e toda a região metropolitana.</p>
        <div className="footer-social">
          <a href="#" aria-label="Instagram"><Icon name="instagram" size={18}/></a>
          <a href="#" aria-label="Facebook"><Icon name="facebook" size={18}/></a>
          <a href={`https://wa.me/${CONFIG.whatsappRaw}`} aria-label="WhatsApp"><Icon name="whatsapp" size={18}/></a>
        </div>
      </div>
      <div>
        <h4>Serviços</h4>
        <ul>{SERVICOS.slice(0,5).map(s => <li key={s.titulo}><a href="#servicos">{s.titulo}</a></li>)}</ul>
      </div>
      <div>
        <h4>Contato</h4>
        <ul>
          <li>{CONFIG.telefone}</li>
          <li>{CONFIG.email}</li>
          <li>{CONFIG.endereco}</li>
          <li>{CONFIG.cidade}</li>
        </ul>
      </div>
      <div>
        <h4>Horário</h4>
        <ul>
          <li>Seg a Sex: 8h - 18h</li>
          <li>Sábado: 8h - 13h</li>
          <li>Domingo: fechado</li>
        </ul>
      </div>
    </div>
    <div className="footer-bottom">
      <div>© 2026 {CONFIG.empresa}. CNPJ {CONFIG.cnpj}</div>
      <div>Feito com dedicação técnica 🔧</div>
    </div>
  </footer>
);

const FabWhats = () => {
  const wpp = `https://wa.me/${CONFIG.whatsappRaw}?text=${encodeURIComponent('Olá! Quero agendar um serviço.')}`;
  return (
    <a href={wpp} target="_blank" rel="noopener" className="fab-whats">
      <div className="fab-whats-tip">Fale conosco agora</div>
      <div className="fab-whats-btn"><Icon name="whatsapp" size={28}/></div>
    </a>
  );
};

const Landing = ({ onAdmin }) => (
  <div className="landing">
    <Header onAdmin={onAdmin}/>
    <Hero/>
    <Servicos/>
    <Diferenciais/>
    <Depoimentos/>
    <Galeria/>
    <Formulario/>
    <Mapa/>
    <Footer/>
    <FabWhats/>
  </div>
);

window.Landing = Landing;
