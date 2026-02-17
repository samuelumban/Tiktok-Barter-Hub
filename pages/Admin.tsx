import React, { useState } from 'react';
import { db } from '../services/mockDb';
import { User, UserRole } from '../types';
import { UserPlus, Trash2, Music, ExternalLink, Mail, Phone, MessageCircle, AlertCircle } from 'lucide-react';

interface AdminProps {
    user: User;
}

export const Admin: React.FC<AdminProps> = ({ user }) => {
    // Initialize state with all users to allow refreshing the list
    const [allUsers, setAllUsers] = useState(db.getAllUsers());
    const [allSongs, setAllSongs] = useState(db.getAllSongs());
    const [newUsername, setNewUsername] = useState('');

    if (user.role !== UserRole.ADMIN) return <div>Akses Ditolak</div>;

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
            alert(err.message || "Gagal menambah user");
        }
    };

    const handleDeleteSong = (songId: string) => {
        if (window.confirm("Yakin ingin menghapus sound ini?")) {
            db.deleteSong(songId);
            setAllSongs([...db.getAllSongs()]);
        }
    };

    const getUserName = (userId: string) => {
        const u = allUsers.find(user => user.id === userId);
        return u ? u.username : 'Tidak Diketahui';
    };

    const getActivityStatus = (lastSubmissionDate?: string) => {
        if (!lastSubmissionDate) return 'red'; // Never submitted
        
        const now = new Date().getTime();
        const submission = new Date(lastSubmissionDate).getTime();
        const diffHours = (now - submission) / (1000 * 60 * 60);

        if (diffHours < 24) return 'green';
        if (diffHours < 48) return 'yellow';
        return 'red';
    };

    const getStatusLabel = (status: 'green' | 'yellow' | 'red') => {
        switch(status) {
            case 'green': return 'Aktif (< 24 Jam)';
            case 'yellow': return 'Peringatan (24-48 Jam)';
            case 'red': return 'Bahaya (> 48 Jam)';
        }
    };

    const generateWaLink = (u: User) => {
        if (!u.phoneNumber) return '#';
        
        // Ensure format 62...
        let phone = u.phoneNumber.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }

        const message = `Hi, ${u.username} Anda tidak melakukan submit tugas membuat konten selama 48 jam, segera kerjakan tugas anda. Jika tugas tidak dikerjakan maka sound Anda akan dihapus`;
        
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Panel Kontrol Admin</h1>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow border-l-4 border-indigo-500">
                    <div className="text-gray-500 text-sm">Total User</div>
                    <div className="text-2xl font-bold">{allUsers.length}</div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                    <div className="text-gray-500 text-sm">Total Sound</div>
                    <div className="text-2xl font-bold">{allSongs.length}</div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-purple-500">
                    <div className="text-gray-500 text-sm">Tugas Selesai</div>
                    <div className="text-2xl font-bold">{allTasks.filter(t => t.status === 'approved').length}</div>
                </div>
            </div>

            {/* Add User Section */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-indigo-600" />
                    Tambah User Manual
                </h3>
                <form onSubmit={handleAddUser} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username Baru (Password default: password123)</label>
                        <input 
                            type="text" 
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="cth. kreator_kreatif_99"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors h-10"
                    >
                        Tambah
                    </button>
                </form>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-black">Data User Terdaftar</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-black uppercase">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Status Konten</th>
                                <th className="px-6 py-3">Kontak</th>
                                <th className="px-6 py-3">Kredit</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-black">
                            {allUsers.map(u => {
                                const activityColor = getActivityStatus(u.lastTaskSubmission);
                                return (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-gray-500 text-xs">{u.userCode}</div>
                                            <div className="font-bold">{u.username}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className={`h-3 w-3 rounded-full ${
                                                    activityColor === 'green' ? 'bg-green-500' : 
                                                    activityColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}></span>
                                                <span className="text-xs font-medium text-gray-700">
                                                    {getStatusLabel(activityColor)}
                                                </span>
                                            </div>
                                            {u.lastTaskSubmission && (
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    Update: {new Date(u.lastTaskSubmission).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-black">
                                            <div className="flex flex-col space-y-1">
                                                {u.phoneNumber && (
                                                    <div className="flex items-center text-xs">
                                                        <Phone className="h-3 w-3 mr-1 text-gray-400" /> {u.phoneNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-black">{u.credits}</td>
                                        <td className="px-6 py-4">
                                            {u.phoneNumber ? (
                                                <a 
                                                    href={generateWaLink(u)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 text-xs font-medium transition-colors"
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No Phone</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Song Management */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-black flex items-center">
                        <Music className="h-5 w-5 mr-2 text-indigo-600" />
                        Manajemen & Link Sound
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-black uppercase">
                            <tr>
                                <th className="px-6 py-3">Kode</th>
                                <th className="px-6 py-3">Judul / Artis</th>
                                <th className="px-6 py-3">Pemilik</th>
                                <th className="px-6 py-3">Link</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-black">
                            {allSongs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Tidak ada sound ditemukan.</td>
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
                                        <td className="px-6 py-4 text-black">
                                            <a 
                                                href={s.tiktokAudioUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                Buka <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {s.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-black">
                                            <button 
                                                onClick={() => handleDeleteSong(s.id)}
                                                className="text-red-600 hover:text-red-900 flex items-center p-2 rounded hover:bg-red-50 transition-colors"
                                                title="Hapus Sound"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="ml-1">Hapus</span>
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