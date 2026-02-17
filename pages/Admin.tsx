import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { User, UserRole } from '../types';
import { UserPlus, Trash2, Music } from 'lucide-react';

interface AdminProps {
    user: User;
}

export const Admin: React.FC<AdminProps> = ({ user }) => {
    // Initialize state with all users to allow refreshing the list
    const [allUsers, setAllUsers] = useState(db.getAllUsers());
    const [allSongs, setAllSongs] = useState(db.getAllSongs());
    const [newUsername, setNewUsername] = useState('');

    if (user.role !== UserRole.ADMIN) return <div>Access Denied</div>;

    const allTasks = db.getAllTasks();

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

    const handleDeleteSong = (songId: string) => {
        if (window.confirm("Are you sure you want to delete this song?")) {
            db.deleteSong(songId);
            setAllSongs([...db.getAllSongs()]);
        }
    };

    const getUserName = (userId: string) => {
        const u = allUsers.find(user => user.id === userId);
        return u ? u.username : 'Unknown';
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

            {/* Song Management */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-black flex items-center">
                        <Music className="h-5 w-5 mr-2 text-indigo-600" />
                        Song Management
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-black uppercase">
                            <tr>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Title / Artist</th>
                                <th className="px-6 py-3">Owner</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-black">
                            {allSongs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No songs found.</td>
                                </tr>
                            ) : (
                                allSongs.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-6 py-4 font-mono text-black">{s.rowCode}</td>
                                        <td className="px-6 py-4 text-black">
                                            <div className="font-medium">{s.title}</div>
                                            <div className="text-gray-500 text-xs">{s.artist}</div>
                                        </td>
                                        <td className="px-6 py-4 text-black">{getUserName(s.ownerId)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-black">
                                            <button 
                                                onClick={() => handleDeleteSong(s.id)}
                                                className="text-red-600 hover:text-red-900 flex items-center p-2 rounded hover:bg-red-50 transition-colors"
                                                title="Delete Song"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="ml-1">Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};