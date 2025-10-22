import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cronograma from './pages/Cronograma';
import GerenciarTarefas from './pages/GerenciarTarefas';
import Financeiro from './pages/Financeiro';
import Administrativo from './pages/Administrativo';
import Configuracoes from './pages/Configuracoes';
import Perfil from './pages/Perfil';
import Relatorios from './pages/Relatorios';
import Notificacoes from './pages/Notificacoes';
import Templates from './pages/Templates';

function ProtectedRoute({ children, permission }: { children: React.ReactNode, permission: string }) {
  const { user } = useAuth();
  
  if (!user || (!user.permissions.includes('all') && !user.permissions.includes(permission))) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      {isAuthenticated ? (
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cronograma" element={
            <ProtectedRoute permission="cronograma">
              <Cronograma />
            </ProtectedRoute>
          } />
          <Route path="tarefas" element={
            <ProtectedRoute permission="tarefas">
              <GerenciarTarefas />
            </ProtectedRoute>
          } />
          <Route path="financeiro" element={
            <ProtectedRoute permission="financeiro">
              <Financeiro />
            </ProtectedRoute>
          } />
          <Route path="administrativo" element={
            <ProtectedRoute permission="administrativo">
              <Administrativo />
            </ProtectedRoute>
          } />
          <Route path="configuracoes" element={
            <ProtectedRoute permission="configuracoes">
              <Configuracoes />
            </ProtectedRoute>
          } />
          <Route path="perfil" element={
            <ProtectedRoute permission="perfil">
              <Perfil />
            </ProtectedRoute>
          } />
          <Route path="relatorios" element={
            <ProtectedRoute permission="relatorios">
              <Relatorios />
            </ProtectedRoute>
          } />
          <Route path="notificacoes" element={
            <ProtectedRoute permission="notificacoes">
              <Notificacoes />
            </ProtectedRoute>
          } />
          <Route path="templates" element={
            <ProtectedRoute permission="templates">
              <Templates />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
