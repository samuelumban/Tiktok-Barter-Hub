import React, { useState, useEffect } from 'react';
import { Task, Song, User } from '../types';
import { db } from '../services/mockDb';
import { ExternalLink, Star } from 'lucide-react';

export const GlobalContent: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        setTasks(db.getApprovedTasks());
        setSongs(db.getAllSongs());
        setUsers(db.getAllUsers());
    }, []);

    const getSong = (id: string) => songs.find(s => s.id === id);
    const getUser = (id: string) => users.find(u => u.id === id);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Galeri Konten</h1>
                <p className="text-gray-500">Kumpulan konten yang berhasil dibuat oleh komunitas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => {
                    const song = getSong(task.songId);
                    const creator = getUser(task.assigneeId);
                    if (!song || !creator) return null;

                    return (
                        <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 truncate flex-1">{song.title}</h3>
                                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-600">
                                        <Star className="w-3 h-3 fill-current mr-1" />
                                        <span className="text-xs font-bold">{task.rating || '-'}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">By {song.artist}</p>
                                
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <span>Kreator: <span className="font-semibold text-indigo-600">{creator.username}</span></span>
                                </div>

                                <a 
                                    href={task.contentLink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block w-full text-center py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                                >
                                    Tonton di TikTok <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 text-xs text-gray-400 border-t border-gray-100 flex justify-between">
                                <span>{new Date(task.completedAt || '').toLocaleDateString()}</span>
                                <span>{song.genre}</span>
                            </div>
                        </div>
                    );
                })}

                {tasks.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-gray-500 text-lg">Belum ada konten yang disetujui di galeri.</p>
                    </div>
                )}
            </div>
        </div>
    );
};