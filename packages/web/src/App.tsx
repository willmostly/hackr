import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { VerifyMagicLinkPage } from './pages/VerifyMagicLink';
import { RegisterPage } from './pages/Register';
import { SwipePage } from './pages/Swipe';
import { IdeasPage } from './pages/Ideas';
import { CreateIdeaPage } from './pages/CreateIdea';
import { MyIdeasPage } from './pages/MyIdeas';
import { RankPage } from './pages/Rank';
import { ResultsPage } from './pages/Results';
import { AdminPage } from './pages/Admin';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/verify/:token" element={<VerifyMagicLinkPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/swipe"
          element={
            <ProtectedRoute roles={['engineer', 'team_lead']}>
              <SwipePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ideas"
          element={
            <ProtectedRoute>
              <IdeasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ideas/new"
          element={
            <ProtectedRoute roles={['team_lead']}>
              <CreateIdeaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ideas/mine"
          element={
            <ProtectedRoute roles={['team_lead']}>
              <MyIdeasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rank"
          element={
            <ProtectedRoute roles={['team_lead']}>
              <RankPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
