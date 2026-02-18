import React, { useState, useEffect } from 'react';
import { User, Song, SongStatus, SongGenre } from '../types';
import { db } from '../services/mockDb';
import { Lock, Unlock, Plus, Clock, Music2, Info, FileVideo, Pencil } from 'lucide-react';

interface MySongsProps {
  user: User;
}

const GENRES: SongGenre[] = ['Pop', 'Religi', 'Dangdut', 'Remix', 'Rohani', 'Jazz', 'Etnik', 'Humor', 'Kids', 'Rock', 'Indie'];

export const MySongs: React.FC<MySongsProps> = ({ user }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('');
  const [genre, setGenre] = useState<SongGenre>('Pop');
  const [capcutUrl, setCapcutUrl] = useState('');

  const refreshSongs = () => {
    setSongs(db.getSongsByUser(user.id));
  };

  useEffect(() => {
    refreshSongs();
    return db.subscribe(refreshSongs);
  }, [user]);

  const openAddModal = () => {
      setEditingSongId(null);
      setTitle('');
      setArtist('');
      setUrl('');
      setGenre('Pop');
      setCapcutUrl('');
      setIsModalOpen(true);
  };

  const openEditModal = (song: Song) => {
      setEditingSongId(song.id);
      setTitle(song.title);
      setArtist(song.artist);
      setUrl(song.tiktokAudioUrl);
      setGenre(song.genre || 'Pop');
      setCapcutUrl(song.capcutTemplateUrl || '');
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        if (editingSongId) {
            // Edit Mode
            db.updateSong(editingSongId, {
                title,
                artist,
                tiktokAudioUrl: url,
                genre,
                capcutTemplateUrl: capcutUrl || undefined
            });
        } else {
            // Add Mode
            if (songs.length >= 5) {
                alert("Anda telah mencapai batas maksimum 5 sound.");
                return;
            }
            db.addSong(user.id, title, artist, url, genre, capcutUrl || undefined);
        }
        
        setIsModalOpen(false);
        // Reset Form
        setTitle('');
        setArtist('');
        setUrl('');
        setGenre('Pop');
        setCapcutUrl('');
        setEditingSongId(null);
    } catch (err: any) {
        alert(err.message);
    }
  };

  const calculateDaysLeft = (unlockDate: string) => {
    const diff = new Date(unlockDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Sound Saya</h1>
            <p className="text-gray-500">Kelola sound Anda di sistem barter.</p>
        </div>
        <button 
            onClick={openAddModal}
            disabled={songs.length >= 5}
            className={`flex items-center px-4 py-2 rounded-lg text-white font-medium ${songs.length >= 5 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
            <Plus className="h-5 w-5 mr-2" /> Tambah Sound ({songs.length}/5)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => {
             const daysLeft = calculateDaysLeft(song.unlockDate);
             const isLocked = song.status === SongStatus.LOCKED;
             
             return (
                <div key={song.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between h-56 relative group">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 truncate pr-2">{song.title}</h3>
                            {isLocked ? (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full flex items-center shrink-0">
                                    <Lock className="h-3 w-3 mr-1" /> Terkunci
                                </span>
                            ) : (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center shrink-0">
                                    <Unlock className="h-3 w-3 mr-1" /> Aktif
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">{song.artist}</p>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                                {song.genre}
                            </span>
                            {song.capcutTemplateUrl && (
                                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full flex items-center">
                                    <FileVideo className="h-3 w-3 mr-1" /> CapCut
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded mt-3">
                            ID: <span className="font-mono">{song.rowCode}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-gray-500">Dipakai: {song.usageCount} kali</span>
                        {isLocked && daysLeft > 0 && (
                            <span className="flex items-center text-orange-500">
                                <Clock className="h-4 w-4 mr-1" /> Sisa {daysLeft} hari
                            </span>
                        )}
                        {!isLocked && (
                            <button 
                                onClick={() => openEditModal(song)}
                                className="absolute bottom-4 right-4 bg-white border border-gray-300 p-1.5 rounded-full shadow hover:bg-gray-50 text-gray-600"
                                title="Edit Sound"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
             );
        })}
        {songs.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                <Music2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada sound. Mulai barter sekarang!</p>
            </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start mt-4">
        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
            Tambahkan sound Anda maksimal 5 sound, dan akan dikunci selama 7 hari untuk mengganti sound lain.
        </p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">{editingSongId ? 'Edit Sound' : 'Tambah Sound Baru'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judul Sound</label>
                            <input 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Artis</label>
                            <input 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={artist}
                                onChange={e => setArtist(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value as SongGenre)}
                            >
                                {GENRES.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Audio TikTok</label>
                            <input 
                                type="url"
                                required
                                placeholder="https://tiktok.com/music/..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Template CapCut (Opsional)</label>
                            <input 
                                type="url"
                                placeholder="https://www.capcut.com/template/..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={capcutUrl}
                                onChange={e => setCapcutUrl(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Masukkan link template CapCut jika Anda sudah memilikinya.</p>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            {editingSongId ? 'Simpan Perubahan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};