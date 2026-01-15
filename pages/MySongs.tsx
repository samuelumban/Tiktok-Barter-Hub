import React, { useState, useEffect } from 'react';
import { User, Song, SongStatus } from '../types';
import { db } from '../services/mockDb';
import { Lock, Unlock, Plus, Clock, Music2 } from 'lucide-react';

interface MySongsProps {
  user: User;
}

export const MySongs: React.FC<MySongsProps> = ({ user }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    setSongs(db.getSongsByUser(user.id));
  }, [user]);

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (songs.length >= 5) {
        alert("You have reached the maximum limit of 5 songs.");
        return;
    }
    db.addSong(user.id, title, artist, url);
    setSongs(db.getSongsByUser(user.id));
    setIsModalOpen(false);
    setTitle('');
    setArtist('');
    setUrl('');
  };

  const calculateDaysLeft = (unlockDate: string) => {
    const diff = new Date(unlockDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">My Songs</h1>
            <p className="text-gray-500">Manage your songs in the barter pool.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            disabled={songs.length >= 5}
            className={`flex items-center px-4 py-2 rounded-lg text-white font-medium ${songs.length >= 5 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
            <Plus className="h-5 w-5 mr-2" /> Add Song ({songs.length}/5)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song) => {
             const daysLeft = calculateDaysLeft(song.unlockDate);
             const isLocked = song.status === SongStatus.LOCKED;
             
             return (
                <div key={song.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between h-48">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900 truncate">{song.title}</h3>
                            {isLocked ? (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full flex items-center">
                                    <Lock className="h-3 w-3 mr-1" /> Locked
                                </span>
                            ) : (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                                    <Unlock className="h-3 w-3 mr-1" /> Active
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm mb-4">{song.artist}</p>
                        <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                            ID: <span className="font-mono">{song.rowCode}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-gray-500">Used: {song.usageCount} times</span>
                        {isLocked && daysLeft > 0 && (
                            <span className="flex items-center text-orange-500">
                                <Clock className="h-4 w-4 mr-1" /> {daysLeft}d left
                            </span>
                        )}
                    </div>
                </div>
             );
        })}
        {songs.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                <Music2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No songs submitted yet. Start bartering now!</p>
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Submit New Song</h2>
                <form onSubmit={handleAddSong}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Song Title</label>
                            <input 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                            <input 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={artist}
                                onChange={e => setArtist(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">TikTok Audio URL</label>
                            <input 
                                type="url"
                                required
                                placeholder="https://tiktok.com/..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Submit Song
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};