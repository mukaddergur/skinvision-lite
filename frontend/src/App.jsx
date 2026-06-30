import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AnalysisPage from './pages/AnalysisPage';
import AdminPage from './pages/AdminPage';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analiz" element={<AnalysisPage />} />
          <Route path="/sonuclar" element={<ResultsPage />} />
          <Route path="/giris" element={<LoginPage />} />
          <Route path="/panel" element={<PanelPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
