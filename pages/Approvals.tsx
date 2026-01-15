import React, { useState, useEffect } from 'react';
import { User, Task, Song } from '../types';
import { db } from '../services/mockDb';
import { Check, X, ExternalLink, MessageSquare } from 'lucide-react';

interface ApprovalsProps {
  user: User;
}

export const Approvals: React.FC<ApprovalsProps> = ({ user }) => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const refresh = () => {
    setPendingTasks(db.getPendingApprovals(user.id));
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const handleApprove = (taskId: string) => {
    db.reviewTask(taskId, true);
    refresh();
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
            <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
            <p className="text-gray-500">Validate content created for your songs.</p>
        </div>

        <div className="space-y-4">
            {pendingTasks.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <Check className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">All caught up! No pending approvals.</p>
                </div>
            )}

            {pendingTasks.map(task => {
                const song = getSongDetails(task.songId);
                const creator = getAssignee(task.assigneeId);
                if (!song) return null;

                return (
                    <div key={task.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Left: Info */}
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900">{song.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">Created by: {creator?.username || 'Unknown'}</p>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Content Submission</p>
                                    <a href={task.contentLink} target="_blank" rel="noreferrer" className="flex items-center text-indigo-600 hover:underline">
                                        <ExternalLink className="h-4 w-4 mr-2" /> Open TikTok Link
                                    </a>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-col justify-center min-w-[200px] border-l border-gray-100 pl-0 md:pl-6">
                                {rejectId === task.id ? (
                                    <form onSubmit={handleReject} className="space-y-3">
                                        <textarea 
                                            placeholder="Reason for rejection..."
                                            className="w-full text-sm p-2 border rounded"
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setRejectId(null)} className="flex-1 px-3 py-1.5 text-xs bg-gray-200 rounded">Cancel</button>
                                            <button type="submit" className="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded">Confirm Reject</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => handleApprove(task.id)}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                        >
                                            <Check className="h-4 w-4 mr-2" /> Approve
                                        </button>
                                        <button 
                                            onClick={() => setRejectId(task.id)}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md transition-colors"
                                        >
                                            <X className="h-4 w-4 mr-2" /> Reject
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