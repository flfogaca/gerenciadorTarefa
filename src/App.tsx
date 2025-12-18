import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
import Layout from './components/Layout';
import Toast from './components/Toast';
import { LoadingSpinner } from './components/Skeletons';
import { usePermission } from './hooks/usePermission';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Register = lazy(() => import('./pages/Register'));
const TwoFactorSetup = lazy(() => import('./pages/TwoFactorSetup'));
const TwoFactorVerify = lazy(() => import('./pages/TwoFactorVerify'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Cronograma = lazy(() => import('./pages/Cronograma'));
const GerenciarTarefas = lazy(() => import('./pages/GerenciarTarefas'));
const GerenciarClientes = lazy(() => import('./pages/GerenciarClientes'));
const GerenciarFornecedores = lazy(() => import('./pages/GerenciarFornecedores'));
const GerenciarProjetos = lazy(() => import('./pages/GerenciarProjetos'));
const CreateProject = lazy(() => import('./pages/CreateProject'));
const EditProject = lazy(() => import('./pages/EditProject'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Equipe = lazy(() => import('./pages/Equipe'));
const TaskDetail = lazy(() => import('./pages/TaskDetail'));
const CreateTask = lazy(() => import('./pages/CreateTask'));
const EditTask = lazy(() => import('./pages/EditTask'));
const Financeiro = lazy(() => import('./pages/Financeiro'));
const Administrativo = lazy(() => import('./pages/Administrativo'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const Perfil = lazy(() => import('./pages/Perfil'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const Notificacoes = lazy(() => import('./pages/Notificacoes'));
const Templates = lazy(() => import('./pages/Templates'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AuditLog = lazy(() => import('./pages/AuditLog'));

function ProtectedRoute({ children, permission }: { children: React.ReactNode, permission: string }) {
  const { user } = useAuth();
  const { can } = usePermission(user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (can(permission)) return <>{children}</>;
  
  // Redireciona para dashboard se não tiver permissão
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<LoadingSpinner />}>
          <Landing />
        </Suspense>
      } />
      <Route path="/login" element={
        <Suspense fallback={<LoadingSpinner />}>
          <Login />
        </Suspense>
      } />
      <Route path="/forgot-password" element={
        <Suspense fallback={<LoadingSpinner />}>
          <ForgotPassword />
        </Suspense>
      } />
      <Route path="/reset-password" element={
        <Suspense fallback={<LoadingSpinner />}>
          <ResetPassword />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<LoadingSpinner />}>
          <Register />
        </Suspense>
      } />
      <Route path="/2fa/setup" element={
        <Suspense fallback={<LoadingSpinner />}>
          <TwoFactorSetup />
        </Suspense>
      } />
      <Route path="/2fa/verify" element={
        <Suspense fallback={<LoadingSpinner />}>
          <TwoFactorVerify />
        </Suspense>
      } />
      {isAuthenticated ? (
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="projetos" element={
            <ProtectedRoute permission="projects:read">
              <Suspense fallback={<LoadingSpinner />}>
                <GerenciarProjetos />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="projetos/novo" element={
            <ProtectedRoute permission="projects:create">
              <Suspense fallback={<LoadingSpinner />}>
                <CreateProject />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="projetos/:id" element={
            <ProtectedRoute permission="projects:read">
              <Suspense fallback={<LoadingSpinner />}>
                <ProjectDetail />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="projetos/:id/editar" element={
            <ProtectedRoute permission="projects:update">
              <Suspense fallback={<LoadingSpinner />}>
                <EditProject />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="cronograma" element={
            <ProtectedRoute permission="projects:read">
              <Suspense fallback={<LoadingSpinner />}>
                <Cronograma />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="tarefas" element={
            <ProtectedRoute permission="tasks:read">
              <Suspense fallback={<LoadingSpinner />}>
                <GerenciarTarefas />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="clientes" element={
            <ProtectedRoute permission="clients:read">
              <Suspense fallback={<LoadingSpinner />}>
                <GerenciarClientes />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="fornecedores" element={
            <ProtectedRoute permission="suppliers:read">
              <Suspense fallback={<LoadingSpinner />}>
                <GerenciarFornecedores />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="tarefas/:id" element={
            <ProtectedRoute permission="tasks:read">
              <Suspense fallback={<LoadingSpinner />}>
                <TaskDetail />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="tarefas/nova" element={
            <ProtectedRoute permission="tasks:create">
              <Suspense fallback={<LoadingSpinner />}>
                <CreateTask />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="tarefas/:id/editar" element={
            <ProtectedRoute permission="tasks:update">
              <Suspense fallback={<LoadingSpinner />}>
                <EditTask />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="financeiro" element={
            <ProtectedRoute permission="finance:read">
              <Suspense fallback={<LoadingSpinner />}>
                <Financeiro />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="equipe" element={
            <ProtectedRoute permission="team:read">
              <Suspense fallback={<LoadingSpinner />}>
                <Equipe />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="administrativo" element={
            <ProtectedRoute permission="administrative:read">
              <Suspense fallback={<LoadingSpinner />}>
                <Administrativo />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="configuracoes" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Configuracoes />
            </Suspense>
          } />
          <Route path="perfil" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Perfil />
            </Suspense>
          } />
          <Route path="relatorios" element={
            <ProtectedRoute permission="reports:read">
              <Suspense fallback={<LoadingSpinner />}>
                <Relatorios />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="notificacoes" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Notificacoes />
            </Suspense>
          } />
          <Route path="templates" element={
            <ProtectedRoute permission="templates:read">
              <Suspense fallback={<LoadingSpinner />}>
                <Templates />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute permission="reports:read">
              <Suspense fallback={<LoadingSpinner />}>
                <Analytics />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="auditoria" element={
            <ProtectedRoute permission="administrative:read">
              <Suspense fallback={<LoadingSpinner />}>
                <AuditLog />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="admin/configuracoes" element={
            <ProtectedRoute permission="settings:update">
              <Suspense fallback={<LoadingSpinner />}>
                <AdminSettings />
              </Suspense>
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
    <QueryProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
        <Toast />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
