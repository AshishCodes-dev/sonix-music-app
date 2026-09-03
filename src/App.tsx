import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { LikesProvider } from './contexts/LikesContext';
import { ToastProvider } from './contexts/ToastContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PlayerBar from './components/PlayerBar';
import MobileNav from './components/MobileNav';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import IntroScreen from './components/IntroScreen';
import { usePlayer } from './contexts/PlayerContext';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Trending from './pages/Trending';
import Albums from './pages/Albums';
import Artists from './pages/Artists';
import AlbumDetail from './pages/AlbumDetail';
import ArtistDetail from './pages/ArtistDetail';
import PlaylistDetail from './pages/PlaylistDetail';
import GenreMood from './pages/GenreMood';
import Liked from './pages/Liked';
import Premium from './pages/Premium';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Recent from './pages/Recent';
import AiDj from './pages/AiDj';
import Explore from './pages/Explore';
import Replay from './pages/Replay';

function Page({ children }: { children: React.ReactNode }) {
  return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>{children}</motion.div>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Home /></Page>} />
        <Route path="/search" element={<Page><Search /></Page>} />
        <Route path="/library" element={<Page><Library /></Page>} />
        <Route path="/trending" element={<Page><Trending /></Page>} />
        <Route path="/albums" element={<Page><Albums /></Page>} />
        <Route path="/artists" element={<Page><Artists /></Page>} />
        <Route path="/album/:id" element={<Page><AlbumDetail /></Page>} />
        <Route path="/artist/:id" element={<Page><ArtistDetail /></Page>} />
        <Route path="/playlist/:id" element={<Page><PlaylistDetail /></Page>} />
        <Route path="/genre/:value" element={<Page><GenreMood /></Page>} />
        <Route path="/mood/:value" element={<Page><GenreMood /></Page>} />
        <Route path="/liked" element={<Page><Liked /></Page>} />
        <Route path="/recent" element={<Page><Recent /></Page>} />
        <Route path="/ai-dj" element={<Page><AiDj /></Page>} />
        <Route path="/explore" element={<Page><Explore /></Page>} />
        <Route path="/replay" element={<Page><Replay /></Page>} />
        <Route path="/premium" element={<Page><Premium /></Page>} />
        <Route path="/profile" element={<ProtectedRoute><Page><Profile /></Page></ProtectedRoute>} />
        <Route path="/settings" element={<Page><Settings /></Page>} />
        <Route path="/admin" element={<ProtectedRoute admin><Page><Admin /></Page></ProtectedRoute>} />
        <Route path="/login" element={<Page><Login mode="login" /></Page>} />
        <Route path="/signup" element={<Page><Login mode="signup" /></Page>} />
        <Route path="*" element={<Page><Home /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

function Shell() {
  const location = useLocation();
  const { current } = usePlayer();
  const isAuth = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuth) return <AnimatedRoutes />;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className={`flex-1 overflow-y-auto ${current ? 'pb-40 lg:pb-24' : 'pb-24 lg:pb-6'}`}>
            <AnimatedRoutes />
          </main>
        </div>
      </div>
      <MobileNav />
      <PlayerBar />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <PlayerProvider>
            <HistoryProvider>
              <LikesProvider>
                <BrowserRouter>
                  <IntroScreen />
                  <div className="aurora" />
                  <div className="aurora-grid" />
                  <ScrollToTop />
                  <Shell />
                </BrowserRouter>
              </LikesProvider>
            </HistoryProvider>
          </PlayerProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
