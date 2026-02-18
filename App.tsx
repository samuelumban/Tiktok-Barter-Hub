import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MySongs } from './pages/MySongs';
import { Tasks } from './pages/Tasks';
import { Approvals } from './pages/Approvals';
import { Admin } from './pages/Admin';
import { GlobalContent } from './pages/GlobalContent';
import { User } from './types';
import { db } from './services/mockDb';

const App: React.FC = () => {
  // Simple state auth for demo purposes
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Subscribe to DB updates to keep user state fresh
    const unsubscribe = db.subscribe(() => {
      if (user) {
        const freshUser = db.getUser(user.id);
        if (freshUser) {
          setUser(freshUser);
        } else {
          // User might have been deleted
          setUser(null);
        }
      }
    });
    return unsubscribe;
  }, [user]);

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
            <Route path="/gallery" element={<GlobalContent />} />
            <Route path="/admin" element={<Admin user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </HashRouter>
  );
};

export default App;