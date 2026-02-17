import React, { useState, useEffect } from 'react';
import { User, Task, Song } from '../types';
import { db } from '../services/mockDb';
import { Check, X, ExternalLink, Star } from 'lucide-react';

interface ApprovalsProps {
  user: User;
}

export const Approvals: React.FC<ApprovalsProps> = ({ user }) => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);

  const refresh = () => {
    setPendingTasks(db.getPendingApprovals(user.id));
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const handleApprove = () => {
    if (approveId) {
        db.reviewTask(approveId, true, undefined, rating);
        setApproveId(null);
        setRating(5);
        refresh();
    }
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if(rejectId) {
        db.reviewTask(rejectId, false, feedback);
        setRejectId(null);
        setFeedback('');
        refresh();
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
            <p className="text-gray-500">Validasi konten yang dibuat untuk sound Anda. Berikan rating untuk konten yang bagus.</p>
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

                const isApproving = approveId === task.id;
                const isRejecting = rejectId === task.id;

                return (
                    <div key={task.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Left: Info */}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{song.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">Dibuat oleh: <span className="font-semibold text-gray-700">{creator?.username}</span></p>
                                
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Kiriman Konten</p>
                                    <a href={task.contentLink} target="_blank" rel="noreferrer" className="flex items-center text-indigo-600 hover:underline font-medium">
                                        <ExternalLink className="h-4 w-4 mr-2" /> Buka Link TikTok
                                    </a>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-col justify-center min-w-[280px] border-l border-gray-100 pl-0 md:pl-6">
                                {isRejecting ? (
                                    <form onSubmit={handleReject} className="space-y-3">
                                        <p className="text-sm font-bold text-red-600">Penolakan Konten</p>
                                        <textarea 
                                            placeholder="Alasan penolakan..."
                                            className="w-full text-sm p-2 border rounded"
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setRejectId(null)} className="flex-1 px-3 py-1.5 text-xs bg-gray-200 rounded">Batal</button>
                                            <button type="submit" className="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded">Konfirmasi Tolak</button>
                                        </div>
                                    </form>
                                ) : isApproving ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-bold text-green-700 mb-2">Berikan Rating:</p>
                                            <div className="flex space-x-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button 
                                                        key={star} 
                                                        onClick={() => setRating(star)}
                                                        className={`focus:outline-none transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        <Star className="h-6 w-6 fill-current" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setApproveId(null)} className="flex-1 px-3 py-2 text-sm bg-gray-200 rounded">Batal</button>
                                            <button type="button" onClick={handleApprove} className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded font-bold hover:bg-green-700">Kirim Review</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => setApproveId(task.id)}
                                            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-semibold"
                                        >
                                            <Check className="h-5 w-5 mr-2" /> Terima & Nilai
                                        </button>
                                        <button 
                                            onClick={() => setRejectId(task.id)}
                                            className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-gray-700 rounded-md transition-colors"
                                        >
                                            <X className="h-5 w-5 mr-2" /> Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};