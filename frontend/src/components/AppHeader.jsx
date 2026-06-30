import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AppHeader({ variant = 'solid', onReset, showReset = false, showHome = false }) {
  const { user, logout } = useAuth();
  const isOverlay = variant === 'overlay';

  return (
    <header
      className={
        isOverlay
          ? 'absolute top-0 left-0 right-0 z-30 px-4 md:px-8 py-5'
          : 'sticky top-0 z-40 border-b border-rose-100/80 bg-gradient-to-r from-rose-50/90 via-[#faf9f6] to-amber-50/60 backdrop-blur-md shadow-sm shadow-rose-100/40'
      }
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className={`block group ${isOverlay ? 'hover:opacity-95' : ''}`}
          >
            <h1
              className={`font-semibold tracking-tight leading-none ${
                isOverlay
                  ? 'text-2xl md:text-3xl text-white drop-shadow-md'
                  : 'text-2xl md:text-3xl text-stone-900'
              }`}
            >
              SkinVision
              <span
                className={
                  isOverlay
                    ? 'text-rose-200'
                    : 'bg-gradient-to-r from-rose-500 to-rose-600 bg-clip-text text-transparent'
                }
              >
                {' '}Lite
              </span>
            </h1>
          </Link>
          {!isOverlay && (
            <p className="text-sm md:text-base text-stone-600 font-medium mt-1.5 tracking-wide">
              Cilt analizi &{' '}
              <span className="text-rose-600">kişisel bakım rehberi</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              <span className="text-sm font-medium text-stone-800 hidden sm:inline">{user.username}</span>
              <Link to="/panel" className="btn-pill">
                Panelim
              </Link>
              {user.is_admin && (
                <Link to="/admin" className="btn-pill">
                  Admin
                </Link>
              )}
              <button type="button" onClick={logout} className="btn-pill">
                Çıkış
              </button>
            </>
          ) : (
            <Link to="/giris" className="btn-pill">
              Giriş
            </Link>
          )}
          {showHome && (
            <Link to="/" className="btn-pill">
              Ana sayfa
            </Link>
          )}
          {showReset && onReset && (
            <button type="button" onClick={onReset} className="btn-pill">
              Yeni Analiz
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
