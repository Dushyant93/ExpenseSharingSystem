import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

import ExpenseList from './pages/expenses/ExpenseList';
import AddExpense  from './pages/expenses/AddExpense';
import EditExpense from './pages/expenses/EditExpense';

import GroupList from './pages/groups/GroupList';
import AddGroup  from './pages/groups/AddGroup';
import EditGroup from './pages/groups/EditGroup';

// Settlement pages
import BalanceDashboard from './pages/settlements/BalanceDashboard';
import AddSettlement    from './pages/settlements/AddSettlement';
import SettlementList from './pages/settlements/SettlementList';


import './index.css';

function App() {
  return (
    <Router>
      backend/middleware/authMiddleware.js
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/expenses/add" element={<AddExpense />} />
        <Route path="/expenses/edit/:id" element={<EditExpense />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={ <Dashboard /> } />
        
        <Route path="/groups" element={ <GroupList /> } />
        <Route path="/groups/add" element={ <AddGroup /> } />
        <Route path="/groups/edit/:id" element={ <EditGroup /> } />

        <Route path="/settlements/balances/:groupId" element={<BalanceDashboard />} />
        <Route path="/settlements/add/:groupId"      element={<AddSettlement />} />
        <Route path="/settlements/:groupId" element={<SettlementList />} />

        {/* redirect unknown URLs to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
