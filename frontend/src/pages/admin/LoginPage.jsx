import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Spinner } from '../../components/ui/Loading';

export function LoginPage() {
  const [email, setEmail] = useState('admin@eraldorefrigeracao.com.br');
  const [senha, setSenha] = useState('eraldo123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Bem-vindo ao painel!');
      const dest = location.state?.from?.pathname || '/admin';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="login-back">
        <Icon name="arrowLeft" size={14}/> Voltar ao site
      </Link>
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">
          <img src="/logo.png" alt="Eraldo"/>
        </div>
        <h1>Acesso Administrativo</h1>
        <p className="sub">Entre com seu e-mail e senha para acessar o painel</p>
        <div className="field">
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoFocus
            required
            disabled={loading}
          />
        </div>
        <div className="field">
          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? <Spinner/> : <Icon name="lock" size={16}/>}
          {loading ? 'Entrando...' : 'Entrar no painel'}
        </button>
        <div className="login-hint">
          <Icon name="eye" size={14} style={{ flexShrink: 0, marginTop: 2 }}/>
          <div>
            <strong>Demo:</strong> <code>admin@eraldorefrigeracao.com.br</code> / senha <code>eraldo123</code>
          </div>
        </div>
      </form>
    </div>
  );
}
