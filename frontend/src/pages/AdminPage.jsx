import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { fetchAdminStats, fetchAdminUserAnalyses, fetchAdminUsers } from '../api/panelApi';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAnalyses, setUserAnalyses] = useState([]);

  useEffect(() => {
    if (user?.is_admin) {
      fetchAdminStats().then(setStats);
      fetchAdminUsers().then((d) => setUsers(d.users || []));
    }
  }, [user]);

  const selectUser = async (u) => {
    setSelectedUser(u);
    const data = await fetchAdminUserAnalyses(u.id);
    setUserAnalyses(data.analyses || []);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!user) return <Navigate to="/giris" replace />;
  if (!user.is_admin) return <Navigate to="/panel" replace />;

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-12">
      <AppHeader showHome />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div>
          <p className="text-[11px] font-medium tracking-wide uppercase text-violet-500">Yönetim</p>
          <h1 className="text-xl font-medium text-stone-800 mt-1">Admin paneli</h1>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Kullanıcı', stats.user_count],
              ['Analiz', stats.analysis_count],
              ['Ürün kaydı', stats.product_count],
              ['Rutin kaydı', stats.routine_log_count],
            ].map(([label, val]) => (
              <div key={label} className="rounded-xl border border-stone-200 bg-white p-4 text-center">
                <p className="text-2xl font-semibold text-stone-800">{val}</p>
                <p className="text-xs text-stone-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        <section className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="font-medium text-stone-800 mb-4">Kullanıcılar</h2>
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => selectUser(u)}
                  className={`btn-pill btn-pill--block text-left justify-start ${
                    selectedUser?.id === u.id ? 'btn-pill--active' : ''
                  }`}
                >
                  <span className="font-medium text-stone-800">{u.username}</span>
                  <span className="text-stone-400 mx-2">·</span>
                  <span className="text-stone-500">{u.email}</span>
                  {u.is_admin && (
                    <span className="ml-2 text-[10px] uppercase text-violet-600 font-semibold">Admin</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {selectedUser && (
          <section className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="font-medium text-stone-800 mb-2">{selectedUser.username} — analizler</h2>
            {userAnalyses.length === 0 ? (
              <p className="text-sm text-stone-500">Kayıtlı analiz yok.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {userAnalyses.map((a) => (
                  <li key={a.id} className="border-l-2 border-violet-300 pl-3 py-1">
                    {new Date(a.created_at).toLocaleString('tr-TR')} — genel skor (yoğunluk): {a.overall_score}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
