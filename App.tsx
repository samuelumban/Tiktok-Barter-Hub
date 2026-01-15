import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MySongs } from './pages/MySongs';
import { Tasks } from './pages/Tasks';
import { Approvals } from './pages/Approvals';
import { Admin } from './pages/Admin';
import { User } from './types';

const App: React.FC = () => {
  // Simple state auth for demo purposes
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <HashRouter>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/songs" element={<MySongs user={user} />} />
            <Route path="/tasks" element={<Tasks user={user} />} />
            <Route path="/approvals" element={<Approvals user={user} />} />
            <Route path="/admin" element={<Admin user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;