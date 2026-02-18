import React, { useState, useEffect } from 'react';
import { Task, Song, User } from '../types';
import { db } from '../services/mockDb';
import { ExternalLink, Star } from 'lucide-react';

export const GlobalContent: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const refreshData = () => {
        setTasks(db.getApprovedTasks());
        setSongs(db.getAllSongs());
        setUsers(db.getAllUsers());
    };

    useEffect(() => {
        refreshData();
        return db.subscribe(refreshData);
    }, []);

    const getSong = (id: string) => songs.find(s => s.id === id);
    const getUser = (id: string) => users.find(u => u.id === id);
    const getOwner = (ownerId: string) => users.find(u => u.id === ownerId);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Galeri Konten</h1>
                <p className="text-sm text-gray-500">Kumpulan konten komunitas.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {tasks.map(task => {
                    const song = getSong(task.songId);
                    const creator = getUser(task.assigneeId);
                    if (!song || !creator) return null;
                    const owner = getOwner(song.ownerId);

                    return (
                        <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="p-3">
                                <h3 className="font-bold text-sm text-gray-900 truncate mb-1">{song.title}</h3>
                                <p className="text-[10px] text-gray-500 truncate mb-3">
                                    {owner?.username || 'Owner'} • <span className="text-indigo-600 font-medium">{creator.username}</span>
                                </p>
                                
                                <a 
                                    href={task.contentLink} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block w-full text-center py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors flex items-center justify-center mb-2"
                                >
                                     Tonton <ExternalLink className="h-3 w-3 ml-1" />
                                </a>
                            </div>
                            <div className="bg-gray-50 px-3 py-2 text-[10px] text-gray-400 border-t border-gray-100 flex justify-between items-center">
                                <span>{new Date(task.completedAt || task.submittedAt || '').toLocaleDateString()}</span>
                                <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{song.genre}</span>
                            </div>
                        </div>
                    );
                })}

                {tasks.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-gray-400 text-sm">Belum ada konten di galeri.</p>
                    </div>
                )}
            </div>
        </div>
    );
};