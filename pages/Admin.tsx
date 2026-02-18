import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { User, UserRole, Song, CapcutStatus } from '../types';
import { UserPlus, Trash2, Music, ExternalLink, Mail, Phone, MessageCircle, AlertCircle, Pencil, X, Save, FileVideo, Sparkles, Download } from 'lucide-react';

interface AdminProps {
    user: User;
}

export const Admin: React.FC<AdminProps> = ({ user }) => {
    // Initialize state with all users to allow refreshing the list
    const [allUsers, setAllUsers] = useState(db.getAllUsers());
    const [allSongs, setAllSongs] = useState(db.getAllSongs());
    const [newUsername, setNewUsername] = useState('');

    // Edit State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    // CapCut Fulfillment
    const [templateLinks, setTemplateLinks] = useState<{[key: string]: string}>({});

    const refreshData = () => {
        setAllUsers([...db.getAllUsers()]);
        setAllSongs([...db.getAllSongs()]);
    };

    useEffect(() => {
        refreshData();
        return db.subscribe(refreshData);
    }, []);

    if (user.role !== UserRole.ADMIN) return <div>Akses Ditolak</div>;

    const allTasks = db.getAllTasks();

    // Stats Logic
    const zeroUsageSongs = allSongs.filter(s => s.usageCount === 0).length;
    const pendingCapcutRequests = allSongs.filter(s => s.capcutStatus === CapcutStatus.REQUESTED);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUsername.trim()) return;

        try {
            db.addUser(newUsername.trim());
            setNewUsername('');
        } catch (err: any) {
            alert(err.message || "Gagal menambah user");
        }
    };

    const handleDeleteSong = (songId: string) => {
        if (window.confirm("Yakin ingin menghapus sound ini?")) {
            db.deleteSong(songId);
        }
    };

    const handleFulfillCapcut = (songId: string) => {
        const link = templateLinks[songId];
        if (!link) return;
        try {
            db.fulfillCapcutRequest(songId, link);
            // clear input
            const newLinks = {...templateLinks};
            delete newLinks[songId];
            setTemplateLinks(newLinks);
        } catch (err: any) {
            alert(err.message);
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
        let phone = u.phoneNumber.replace(/[^0-9]/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }
        const message = `Hi, ${u.username} Anda tidak melakukan submit tugas membuat konten selama 48 jam, segera kerjakan tugas anda. Jika tugas tidak dikerjakan maka sound Anda akan dihapus`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    const startEditing = (u: User) => {
        setEditingUser(u);
        setEditForm({ ...u });
    };

    const saveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser || !editForm) return;

        try {
            db.updateUser(editingUser.id, editForm);
            setEditingUser(null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    // --- Export Functions ---
    const escapeCsv = (str: any) => {
        if (str === null || str === undefined) return '';
        return '"' + String(str).replace(/"/g, '""') + '"';
    };

    const downloadCSV = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportUsers = () => {
        const headers = ['User Code', 'Username', 'Name', 'Phone', 'Email', 'Role', 'Credits', 'Tier', 'TikTok Username', 'Content Category', 'Last Activity', 'Last Submission'];
        const rows = allUsers.map(u => [
            escapeCsv(u.userCode),
            escapeCsv(u.username),
            escapeCsv(u.name),
            escapeCsv(u.phoneNumber),
            escapeCsv(u.email),
            escapeCsv(u.role),
            u.credits,
            escapeCsv(u.tier),
            escapeCsv(u.tiktokUsername),
            escapeCsv(u.contentCategory),
            escapeCsv(u.lastActivity),
            escapeCsv(u.lastTaskSubmission)
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        downloadCSV(csvContent, `Users_BarterHub_${new Date().toISOString().split('T')[0]}.csv`);
    };

    const handleExportSongs = () => {
        const headers = ['Song Code', 'Title', 'Artist', 'Genre', 'Owner Username', 'Owner Name', 'Audio URL', 'CapCut URL', 'Status', 'Usage Count', 'Submitted At'];
        const rows = allSongs.map(s => {
            const owner = allUsers.find(u => u.id === s.ownerId);
            return [
                escapeCsv(s.rowCode),
                escapeCsv(s.title),
                escapeCsv(s.artist),
                escapeCsv(s.genre),
                escapeCsv(owner?.username || 'Unknown'),
                escapeCsv(owner?.name || 'Unknown'),
                escapeCsv(s.tiktokAudioUrl),
                escapeCsv(s.capcutTemplateUrl),
                escapeCsv(s.status),
                s.usageCount,
                escapeCsv(s.submittedAt)
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        downloadCSV(csvContent, `Songs_BarterHub_${new Date().toISOString().split('T')[0]}.csv`);
    };

    // Group Songs By User
    const songsByUser: { [key: string]: Song[] } = {};
    allSongs.forEach(s => {
        if (!songsByUser[s.ownerId]) songsByUser[s.ownerId] = [];
        songsByUser[s.ownerId].push(s);
    });

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Panel Kontrol Admin</h1>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded shadow border-l-4 border-indigo-500">
                    <div className="text-gray-500 text-sm">Total User</div>
                    <div className="text-2xl font-bold">{allUsers.length}</div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-green-500">
                    <div className="text-gray-500 text-sm">Total Sound</div>
                    <div className="text-2xl font-bold">{allSongs.length}</div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                    <div className="text-gray-500 text-sm">Sound 0 Usage</div>
                    <div className="text-2xl font-bold">{zeroUsageSongs}</div>
                </div>
                <div className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                    <div className="text-gray-500 text-sm">Req CapCut</div>
                    <div className="text-2xl font-bold">{pendingCapcutRequests.length}</div>
                </div>
            </div>

            {/* CapCut Request Management */}
            {pendingCapcutRequests.length > 0 && (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg shadow p-6 text-white">
                    <h3 className="font-bold text-yellow-400 mb-4 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Permintaan Template CapCut
                    </h3>
                    <div className="space-y-4">
                        {pendingCapcutRequests.map(s => (
                            <div key={s.id} className="bg-white/10 p-4 rounded flex items-center justify-between">
                                <div>
                                    <p className="font-bold">{s.title} - {s.artist}</p>
                                    <p className="text-sm text-gray-300">Owner: {getUserName(s.ownerId)}</p>
                                    <a href={s.tiktokAudioUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-300 hover:underline">Link Audio</a>
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Paste Link Template CapCut..."
                                        className="px-3 py-1 rounded text-black text-sm w-64"
                                        value={templateLinks[s.id] || ''}
                                        onChange={e => setTemplateLinks({...templateLinks, [s.id]: e.target.value})}
                                    />
                                    <button 
                                        onClick={() => handleFulfillCapcut(s.id)}
                                        className="px-4 py-1 bg-green-500 hover:bg-green-600 rounded text-sm font-bold"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-black">Data User Terdaftar</h3>
                    <button 
                        onClick={handleExportUsers}
                        className="flex items-center text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" /> Export Excel
                    </button>
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
                                            <div className="text-gray-500 text-xs">{u.name}</div>
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
                                                 {u.email && (
                                                    <div className="flex items-center text-xs">
                                                        <Mail className="h-3 w-3 mr-1 text-gray-400" /> {u.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-black">{u.credits}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                {u.phoneNumber && (
                                                    <a 
                                                        href={generateWaLink(u)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center px-2 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded border border-green-200 text-xs font-medium transition-colors"
                                                        title="Kirim WA"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => startEditing(u)}
                                                    className="inline-flex items-center px-2 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded border border-blue-200 text-xs font-medium transition-colors"
                                                    title="Edit Data User"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            </div>
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
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-black flex items-center">
                        <Music className="h-5 w-5 mr-2 text-indigo-600" />
                        Manajemen & Link Sound (Dikelompokkan per User)
                    </h3>
                    <button 
                        onClick={handleExportSongs}
                        className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors"
                    >
                        <Download className="h-4 w-4 mr-2" /> Export Excel
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-black uppercase">
                            <tr>
                                <th className="px-6 py-3">Kode</th>
                                <th className="px-6 py-3">Judul / Artis</th>
                                <th className="px-6 py-3">Genre</th>
                                <th className="px-6 py-3">Link</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Usage</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-black">
                            {allUsers.map(u => {
                                const userSongs = songsByUser[u.id];
                                if (!userSongs || userSongs.length === 0) return null;

                                return (
                                    <React.Fragment key={u.id}>
                                        <tr className="bg-gray-100 border-t-2 border-gray-200">
                                            <td colSpan={7} className="px-6 py-2 font-bold text-gray-700">
                                                <div className="flex items-center">
                                                    <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded mr-2">{u.userCode}</span>
                                                    {u.username}
                                                </div>
                                            </td>
                                        </tr>
                                        {userSongs.map(s => (
                                            <tr key={s.id} className="bg-white hover:bg-gray-50">
                                                <td className="px-6 py-4 font-mono text-gray-500 pl-10">{s.rowCode}</td>
                                                <td className="px-6 py-4 text-black">
                                                    <div className="font-medium">{s.title}</div>
                                                    <div className="text-gray-500 text-xs">{s.artist}</div>
                                                </td>
                                                <td className="px-6 py-4 text-black">
                                                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">{s.genre}</span>
                                                </td>
                                                <td className="px-6 py-4 text-black space-y-1">
                                                    <a href={s.tiktokAudioUrl} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 hover:underline">
                                                        Audio <ExternalLink className="h-3 w-3 ml-1" />
                                                    </a>
                                                    {s.capcutTemplateUrl && (
                                                        <a href={s.capcutTemplateUrl} target="_blank" rel="noreferrer" className="flex items-center text-pink-600 hover:text-pink-800 hover:underline">
                                                            CapCut <FileVideo className="h-3 w-3 ml-1" />
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-bold ${s.usageCount === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                                        {s.usageCount}
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
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                            {allSongs.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Tidak ada sound ditemukan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Edit Data User: {editingUser.userCode}</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={saveEdit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                        value={editForm.username || ''}
                                        onChange={e => setEditForm({...editForm, username: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                        value={editForm.password || ''}
                                        onChange={e => setEditForm({...editForm, password: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                    value={editForm.name || ''}
                                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                        value={editForm.phoneNumber || ''}
                                        onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                        value={editForm.email || ''}
                                        onChange={e => setEditForm({...editForm, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Kredit</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                    value={editForm.credits || 0}
                                    onChange={e => setEditForm({...editForm, credits: parseInt(e.target.value)})}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 flex items-center"
                                >
                                    <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};