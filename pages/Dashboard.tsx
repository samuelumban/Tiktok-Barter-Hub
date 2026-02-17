import React, { useEffect, useState } from 'react';
import { User, DashboardStats, ContentCategory, Song, CapcutStatus } from '../types';
import { db } from '../services/mockDb';
import { AlertTriangle, Award, CheckCircle, Music2, TrendingUp, Sparkles, UserCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
}

const CATEGORIES: ContentCategory[] = [
    'Quotes Motivasi', 'Quotes Religi', 'Quotes Rohani', 'Lipsing', 
    'Dance', 'Drama', 'Vlog', 'Cooking', 'Lyrics', 'Personal', 'Gosip', 'Berita'
];

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  
  // Profile Form
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [tiktokLink, setTiktokLink] = useState('');
  const [category, setCategory] = useState<ContentCategory>('Quotes Motivasi');

  // CapCut Request State
  const [selectedSongForCapcut, setSelectedSongForCapcut] = useState('');

  useEffect(() => {
    // Refresh user data
    const freshUser = db.getUser(user.id);
    if (freshUser) {
        setStats(db.getStats(freshUser.id));
        setUserSongs(db.getSongsByUser(freshUser.id));
        
        // Check if profile incomplete
        if (!freshUser.tiktokUsername || !freshUser.tiktokLink || !freshUser.contentCategory) {
            setShowProfileModal(true);
        }
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      try {
          db.updateUserProfile(user.id, { tiktokUsername, tiktokLink, category });
          setShowProfileModal(false);
      } catch (err: any) {
          alert(err.message);
      }
  };

  const handleRequestCapcut = () => {
      if (!selectedSongForCapcut) return;
      try {
          db.requestCapcutTemplate(user.id, selectedSongForCapcut);
          alert("Request Template CapCut berhasil dikirim ke Admin!");
          // Refresh songs to update status UI
          setUserSongs(db.getSongsByUser(user.id));
          setSelectedSongForCapcut('');
      } catch (err: any) {
          alert(err.message);
      }
  };

  if (!stats) return <div>Memuat...</div>;

  const data = [
    { name: 'Kredit', value: stats.credits, color: '#8884d8' },
    { name: 'Sound Anda', value: stats.activeSongs, color: '#82ca9d' },
    { name: 'Hutang', value: stats.debt, color: '#ff8042' },
  ];

  return (
    <div className="space-y-6 relative">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Selamat datang kembali, {user.username}</h1>
        <p className="text-gray-500">Inilah yang terjadi di ekosistem barter Anda.</p>
        {user.contentCategory && (
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 bg-white p-2 rounded-lg inline-flex shadow-sm">
                <span className="flex items-center"><UserCircle className="w-4 h-4 mr-1"/> {user.tiktokUsername || '-'}</span>
                <span className="border-l pl-4">{user.contentCategory}</span>
            </div>
        )}
      </header>

      {/* Debt Alert */}
      {stats.debt > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Peringatan Hutang Konten</h3>
            <p className="text-sm text-red-700 mt-1">
              Anda memiliki hutang konten sebanyak <strong>{stats.debt}</strong> tugas. 
              Mohon selesaikan tugas untuk membuka fitur lengkap dan menghindari suspensi.
            </p>
          </div>
        </div>
      )}

      {/* CapCut Claim Section */}
      {stats.credits >= 500 && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-bold flex items-center text-yellow-400">
                          <Sparkles className="mr-2 h-6 w-6" /> Klaim Reward Template CapCut
                      </h3>
                      <p className="text-gray-300 mt-1 max-w-lg">
                          Selamat! Kredit Anda mencapai 500+. Anda berhak request pembuatan Template CapCut eksklusif untuk salah satu sound Anda.
                      </p>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                      <select 
                        className="bg-gray-700 border-none text-white text-sm rounded focus:ring-2 focus:ring-yellow-500"
                        value={selectedSongForCapcut}
                        onChange={e => setSelectedSongForCapcut(e.target.value)}
                      >
                          <option value="">Pilih Sound...</option>
                          {userSongs.filter(s => s.capcutStatus === CapcutStatus.NONE).map(s => (
                              <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                      </select>
                      <button 
                        onClick={handleRequestCapcut}
                        disabled={!selectedSongForCapcut}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Klaim Sekarang
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Poin Kredit</p>
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
              <p className="text-sm font-medium text-gray-500">Sound Anda</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSongs}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Music2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
             Di Sistem Barter
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Menunggu Review</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
            <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
             Butuh persetujuan Anda
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tugas Diperlukan</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSongs + 1}</p>
            </div>
             <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
             Sound Random dari user
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Performa</h3>
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

      {/* Profile Modal */}
      {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Lengkapi Profil Kreator</h2>
                  <p className="text-gray-500 mb-6">Agar barter berjalan lancar, mohon lengkapi data TikTok Anda.</p>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username TikTok (tanpa @)</label>
                          <input 
                            required
                            type="text"
                            placeholder="username_tiktok"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            value={tiktokUsername}
                            onChange={e => setTiktokUsername(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Link Profil TikTok</label>
                          <input 
                            required
                            type="url"
                            placeholder="https://tiktok.com/@username"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            value={tiktokLink}
                            onChange={e => setTiktokLink(e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Konten Utama</label>
                          <select 
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            value={category}
                            onChange={e => setCategory(e.target.value as ContentCategory)}
                          >
                              {CATEGORIES.map(c => (
                                  <option key={c} value={c}>{c}</option>
                              ))}
                          </select>
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow mt-4"
                      >
                          Simpan & Lanjutkan
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};