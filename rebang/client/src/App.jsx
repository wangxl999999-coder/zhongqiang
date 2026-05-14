import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import BlockedKeywordsPage from './pages/BlockedKeywordsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/blocked-keywords" element={<BlockedKeywordsPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
