import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className={s.nav}>
      <Link to="/" className={s.logo}>✦ Souk Digital</Link>
      <div className={s.right}>
        {user ? (
          <>
            <span className={s.userBadge}>
              {user.role === 'admin' ? '👑' : '🏪'} {user.name}
            </span>
            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={s.btnOutline}>
              Dashboard
            </Link>
            <button className={s.btnGhost} onClick={handleLogout}>Déconnexion</button>
          </>
        ) : (
          <Link to="/login" className={s.btnGold}>Connexion</Link>
        )}
      </div>
    </nav>
  );
}
