import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from './Login.module.css';

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>✦</div>
        <h2 className={s.title}>Connexion</h2>
        <p className={s.sub}>Accédez à votre espace</p>

        {error && <div className={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={s.group}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required autoFocus />
          </div>
          <div className={s.group}>
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className={s.btnGold} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <button className={s.btnBack} onClick={() => navigate('/')}>← Voir les boutiques</button>

        <div className={s.hint}>
          <p><strong>Admin :</strong> admin@souk.ma / admin123</p>
          <p>Les vendeuses se connectent avec l'email et le mot de passe créés par l'admin</p>
        </div>
      </div>
    </div>
  );
}
