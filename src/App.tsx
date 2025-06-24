import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopHeader from './components/Header/TopHeader';
import MainHeader from './components/Header/MainHeader';
import NavigationTabs from './components/Navigation/NavigationTabs';
import Sidebar from './components/Sidebar/Sidebar';
import AuthPage from './components/Pages/AuthPage';
import Footer from './components/Footer/Footer';
import { useFirebaseData } from './hooks/useFirebaseData';
import { auth } from './config/firebase';

// Lazy load pages
const OverviewPage = lazy(() => import('./components/Pages/OverviewPage'));
const SystemHealthPage = lazy(() => import('./components/Pages/SystemHealthPage'));
const TicketsPage = lazy(() => import('./components/Pages/TicketsPage'));
const PatchManagementPage = lazy(() => import('./components/Pages/PatchManagementPage'));
const AutomationTasksPage = lazy(() => import('./components/Pages/AutomationTasksPage'));
const EC2InstancesPage = lazy(() => import('./components/Pages/EC2InstancesPage'));
const ProfilePage = lazy(() => import('./components/Pages/ProfilePage'));
const AlertsPage = lazy(() => import('./components/Pages/AlertsPage'));
const CloudWatchPage = lazy(() => import('./components/Pages/CloudWatchPage'));
const LoadBalancersPage = lazy(() => import('./components/Pages/LoadBalancersPage'));
const AssetInventoryPage = lazy(() => import('./components/Pages/AssetInventoryPage'));
const ScheduledJobsPage = lazy(() => import('./components/Pages/ScheduledJobsPage'));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { data, loading, error } = useFirebaseData();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="z-10">
        <TopHeader />
        <MainHeader />
        <NavigationTabs />
      </div>
      
      <div className="flex flex-1">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900">
          <Sidebar />
        </div>
        
        <main className="flex-1 p-6 overflow-auto">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout>
              <OverviewPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/system-health" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SystemHealthPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AlertsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/cloudwatch" element={
          <ProtectedRoute>
            <DashboardLayout>
              <CloudWatchPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/load-balancers" element={
          <ProtectedRoute>
            <DashboardLayout>
              <LoadBalancersPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/asset-inventory" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AssetInventoryPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/ec2-instances" element={
          <ProtectedRoute>
            <DashboardLayout>
              <EC2InstancesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/tickets" element={
          <ProtectedRoute>
            <DashboardLayout>
              <TicketsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/patch-management" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PatchManagementPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/automation-tasks" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AutomationTasksPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/scheduled-jobs" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ScheduledJobsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;