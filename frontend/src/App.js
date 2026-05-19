import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import Login    from './pages/Login';
import Register from './pages/Register';

// Main pages
import Dashboard from './pages/Dashboard';

// Expense pages
import ExpenseList from './pages/expenses/ExpenseList';
import AddExpense  from './pages/expenses/AddExpense';
import EditExpense from './pages/expenses/EditExpense';

// Group pages
import GroupList from './pages/groups/GroupList';
import AddGroup  from './pages/groups/AddGroup';
import EditGroup from './pages/groups/EditGroup';

// Settlement pages
import BalanceDashboard from './pages/settlements/BalanceDashboard';
import AddSettlement    from './pages/settlements/AddSettlement';
import SettlementList from './pages/settlements/SettlementList';

// Notification page
import Notifications from './pages/notifications/Notifications';

// Profile pages
import Profile        from './pages/profile/Profile';
import EditProfile    from './pages/profile/EditProfile';
import ChangePassword from './pages/profile/ChangePassword';

import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Expense routes */}
        <Route path="/expenses"          element={<ExpenseList />} />
        <Route path="/expenses/add"      element={<AddExpense />} />
        <Route path="/expenses/edit/:id" element={<EditExpense />} />

        {/* Group routes */}
        <Route path="/groups"          element={<GroupList />} />
        <Route path="/groups/add"      element={<AddGroup />} />
        <Route path="/groups/edit/:id" element={<EditGroup />} />

        {/* NEW: Settlement routes */}
        <Route path="/settlements/balances/:groupId" element={<BalanceDashboard />} />
        <Route path="/settlements/add/:groupId"      element={<AddSettlement />} />
        <Route path="/settlements/:groupId" element={<SettlementList />} />

        {/* NEW: Notification route */}
        <Route path="/notifications" element={<Notifications />} />

        {/* NEW: Profile routes */}
        <Route path="/profile"                 element={<Profile />} />
        <Route path="/profile/edit"            element={<EditProfile />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
