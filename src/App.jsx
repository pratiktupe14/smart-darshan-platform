import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookDarshan from './pages/BookDarshan';
import CommitteeDashboard from './pages/CommitteeDashboard';
import CommitteeDashboardLayout from './layouts/CommitteeDashboardLayout';
import CommitteeOperationsOverview from './pages/CommitteeDashboard/OperationsOverview';


import Analytics from './pages/Analytics';
import MyPass from './pages/MyPass';
import UserQueueStatus from './pages/UserQueueStatus';
import Profile from './pages/Profile';
import Announcements from './pages/Announcements';
import Scanner from './pages/Scanner';
import Parking from './pages/Parking';
import OfflineVerification from './pages/OfflineVerification';
import AdminDashboard from './pages/AdminDashboard';
import CapacityManagement from './pages/CapacityManagement';
import VIPManagement from './pages/VIPManagement';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/committee" element={<CommitteeDashboardLayout />}>
          <Route index element={<CommitteeDashboard />} />
          <Route path="dashboard" element={<CommitteeOperationsOverview />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="scanner-verification" element={<OfflineVerification />} />
          <Route path="parking" element={<Parking />} />
          <Route path="announcements" element={<Announcements />} />
        </Route>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="capacity" element={<CapacityManagement />} />
          <Route path="vip" element={<VIPManagement />} />
          <Route path="book" element={<BookDarshan />} />


          <Route path="analytics" element={<Analytics />} />
          <Route path="pass" element={<MyPass />} />
          <Route path="user-queue" element={<UserQueueStatus />} />
          <Route path="profile" element={<Profile />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="parking" element={<Parking />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
