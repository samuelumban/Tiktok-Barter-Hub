import React from 'react';
import { db } from '../services/mockDb';
import { User, UserRole } from '../types';

interface AdminProps {
    user: User;
}
 
export const Admin: React.FC<AdminProps> = ({ user }) => {
    if (user.role !== UserRole.ADMIN) return <div>Access Denied</div>;

    const allUsers = db.getAllUsers();
    const allTasks = db.getAllTasks();
    const allSongs = db.getAllSongs();

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow border-l-4 border-indigo-500">
                    <div className="text-gray-500 text-sm">Total Users</div>
                    <div className="text-2xl font-bold">{allUsers.length}</div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                    <div className="text-gray-500 text-sm">Total Songs</div>
                    <div className="text-2xl font-bold">{allSongs.length}</div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
                    <div className="text-gray-500 text-sm">Tasks Completed</div>
                    <div className="text-2xl font-bold">{allTasks.filter(t => t.status === 'approved').length}</div>
                </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-700">User Monitor</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Username</th>
                                <th className="px-6 py-3">Credits</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {allUsers.map(u => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4 font-mono">{u.userCode}</td>
                                    <td className="px-6 py-4">{u.username}</td>
                                    <td className="px-6 py-4">{u.credits}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(u.lastActivity).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};