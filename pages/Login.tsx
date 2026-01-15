import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.login(username);
    if (user) {
        onLogin(user);
    } else {
        setError('User not found. Try "creator_jane", "musician_bob", or "admin".');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-indigo-600 p-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">TikTok Barter Hub</h1>
                <p className="text-indigo-200">Community Content Ecosystem</p>
            </div>
            
            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    
                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Access Dashboard
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">Demo Credentials:</p>
                    <div className="flex justify-center space-x-2 mt-2">
                        <button onClick={() => setUsername('creator_jane')} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">creator_jane</button>
                        <button onClick={() => setUsername('musician_bob')} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">musician_bob</button>
                         <button onClick={() => setUsername('admin')} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">admin</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};