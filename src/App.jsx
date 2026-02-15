import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout'; // استيراد التخطيط الجديد
import TransactionsList from './pages/Transactions/TransactionsList';
import CreateTransaction_Complete_286 from './components/screens/CreateTransaction_Complete_286';
import ClientManagement from './pages/Clients/ClientManagement';
import TransactionsSettings_701 from './components/screens/settings/TransactionsSettings_701';
import EmployeesManagement_Complete_817 from './components/screens/EmployeesManagement_Complete_817';
import TransactionsLog_Complete_285_v10 from './components/screens/TransactionsLog_Complete_285_v10';
import FollowUpAgents_Complete_937 from './components/screens/FollowUpAgents_Complete_937';
import RiyadhStreets_Complete_939 from './components/screens/RiyadhStreets_Complete_939';

// مكون لحماية المسارات
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">جاري التحميل...</div>;
  return user ? children : <Navigate to="/login" />;
};

// صفحة تجريبية

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* تطبيق الـ MainLayout على جميع الصفحات الداخلية */}
          <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<TransactionsList />} />
            <Route path="/transactions/create" element={<CreateTransaction_Complete_286 />} />
            <Route path="clients" element={<ClientManagement />} />
            <Route path="/settings/transactions" element={<TransactionsSettings_701 />} />
            <Route path="/employees" element={<EmployeesManagement_Complete_817 />} />
            <Route path="/transactions/log" element={<TransactionsLog_Complete_285_v10 />} />        
            <Route path="/followup" element={<FollowUpAgents_Complete_937 />} />        
            <Route path="/riyadhstreet" element={<RiyadhStreets_Complete_939 />} />        
            
            {/* سنضيف المزيد من المسارات هنا لاحقاً */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;