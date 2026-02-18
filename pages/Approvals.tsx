import React, { useState, useEffect } from 'react';
import { User, Task, Song } from '../types';
import { db } from '../services/mockDb';
import { Check, ExternalLink, Star } from 'lucide-react';

interface ApprovalsProps {
  user: User;
}

export const Approvals: React.FC<ApprovalsProps> = ({ user }) => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  
  // Track opened links to visually indicate user has (presumably) watched the content
  const [openedLinks, setOpenedLinks] = useState<string[]>([]);

  const refresh = () => {
    setPendingTasks(db.getPendingApprovals(user.id));
  };

  useEffect(() => {
    refresh();
    return db.subscribe(refresh);
  }, [user]);

  const handleRateAndApprove = (taskId: string, rating: number) => {
      // Direct approval on rating click
      if (window.confirm(`Berikan rating bintang ${rating} dan setujui konten ini?`)) {
          db.reviewTask(taskId, true, undefined, rating);
          // refresh() is handled by subscription
      }
  };

  const handleLinkClick = (taskId: string) => {
      if (!openedLinks.includes(taskId)) {
          setOpenedLinks([...openedLinks, taskId]);
      }
  };

  const getSongDetails = (songId: string): Song | undefined => {
    return db.getAllSongs().find(s => s.id === songId);
  };
  
  const getAssignee = (userId: string): User | undefined => {
      return db.getUser(userId);
  };

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Persetujuan</h1>
            <p className="text-gray-500">Tonton konten yang dibuat, lalu berikan rating untuk menyetujui.</p>
        </div>

        <div className="space-y-4">
            {pendingTasks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Check className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">Semua selesai! Tidak ada persetujuan tertunda.</p>
                </div>
            )}

            {pendingTasks.map(task => {
                const song = getSongDetails(task.songId);
                const creator = getAssignee(task.assigneeId);
                if (!song) return null;
                
                const hasOpened = openedLinks.includes(task.id);

                return (
                    <div key={task.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            {/* Left: Info */}
                            <div className="flex-1 w-full">
                                <h3 className="font-bold text-lg text-gray-900">{song.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">Kreator: <span className="font-semibold text-gray-700">{creator?.username}</span></p>
                                
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-indigo-900">Link Konten:</span>
                                    <a 
                                        href={task.contentLink} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        onClick={() => handleLinkClick(task.id)}
                                        className="flex items-center text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Buka TikTok <ExternalLink className="h-4 w-4 ml-2" />
                                    </a>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 italic">
                                    *Klik link di atas untuk membuka konten, lalu berikan rating di sebelah kanan.
                                </p>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-col justify-center items-center md:items-end min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
                                <p className="text-sm font-bold text-gray-700 mb-3">Berikan Rating:</p>
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            onClick={() => handleRateAndApprove(task.id, star)}
                                            className="focus:outline-none group"
                                            title={`Beri Bintang ${star}`}
                                        >
                                            <Star className="h-8 w-8 text-gray-300 hover:text-yellow-400 fill-current group-hover:text-yellow-400 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    Pilih bintang untuk menyetujui.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};