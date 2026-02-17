import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { User, UserRole } from '../types';
import { UserPlus } from 'lucide-react';

interface AdminProps {
    user: User;
}

export const Admin: React.FC<AdminProps> = ({ user }) => {
    // Initialize state with all users to allow refreshing the list
    const [allUsers, setAllUsers] = useState(db.getAllUsers());
    const [newUsername, setNewUsername] = useState('');

    if (user.role !== UserRole.ADMIN) return <div>Access Denied</div>;

    const allTasks = db.getAllTasks();
    const allSongs = db.getAllSongs();

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim()) return;

        try {
            db.addUser(newUsername.trim());
            // Update the local state with the fresh list from DB
            setAllUsers([...db.getAllUsers()]);
            setNewUsername('');
        } catch (err: any) {
            alert(err.message || "Failed to add user");
        }
    };

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

            {/* Add User Section */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-indigo-600" />
                    Add New User
                </h3>
                <form onSubmit={handleAddUser} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Username</label>
                        <input 
                            type="text" 
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="e.g. creative_user_99"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors h-10"
                    >
                        Add User
                    </button>
                </form>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-black">User Monitor</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-black uppercase">
                            <tr>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Username</th>
                                <th className="px-6 py-3">Credits</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-black">
                            {allUsers.map(u => (
                                <tr key={u.id}>
                                    <td className="px-6 py-4 font-mono text-black">{u.userCode}</td>
                                    <td className="px-6 py-4 text-black">{u.username}</td>
                                    <td className="px-6 py-4 text-black">{u.credits}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-black">{new Date(u.lastActivity).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};