import React, { useEffect, useState } from 'react';
import { User, DashboardStats } from '../types';
import { db } from '../services/mockDb';
import { AlertTriangle, Award, CheckCircle, Music2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Refresh user data from DB to get latest credits
    const freshUser = db.getUser(user.id);
    if (freshUser) {
        setStats(db.getStats(freshUser.id));
    }
  }, [user]);

  if (!stats) return <div>Loading...</div>;

  const data = [
    { name: 'Credits', value: stats.credits, color: '#8884d8' },
    { name: 'Active Songs', value: stats.activeSongs, color: '#82ca9d' },
    { name: 'Debt', value: stats.debt, color: '#ff8042' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.username}</h1>
        <p className="text-gray-500">Here's what's happening in your barter ecosystem.</p>
      </header>

      {/* Debt Alert */}
      {stats.debt > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Content Debt Alert</h3>
            <p className="text-sm text-red-700 mt-1">
              You have a content debt of <strong>{stats.debt}</strong> tasks. 
              Please complete tasks to unlock full features and avoid suspension.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Credits</p>
              <p className="text-3xl font-bold text-gray-900">{stats.credits}</p>
            </div>
            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
             Level: <span className="font-bold text-indigo-600">{user.tier}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Songs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSongs}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Music2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
             In Barter Pool
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
             Requires your approval
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tasks Required</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSongs + 1}</p>
            </div>
             <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
             Based on {stats.activeSongs} songs + 1 admin
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};