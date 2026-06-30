import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), email.trim(), password);
      }
      navigate('/panel');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <AppHeader showHome />
      <main className="max-w-md mx-auto px-4 py-10">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
          <h1 className="text-xl font-medium text-stone-800">
            {mode === 'login' ? 'Giriş yap' : 'Hesap oluştur'}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Analiz geçmişinizi, ürünlerinizi ve rutin takibinizi kaydedin.
          </p>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`btn-pill flex-1 ${mode === 'login' ? 'btn-pill--active' : ''}`}
            >
              Giriş
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`btn-pill flex-1 ${mode === 'register' ? 'btn-pill--active' : ''}`}
            >
              Kayıt ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-stone-600">Kullanıcı adı</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-stone-600">E-posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-stone-600">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-pill btn-pill--block btn-pill--lg">
              {loading ? 'Bekleyin...' : mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
            </button>
          </form>

          <p className="text-xs text-stone-400 mt-4 text-center">
            <Link to="/" className="btn-pill btn-pill--sm">Ana sayfaya dön</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
