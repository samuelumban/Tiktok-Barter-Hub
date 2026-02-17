import React, { useState, useEffect } from 'react';
import { User, Task, Song, TaskStatus } from '../types';
import { db } from '../services/mockDb';
import { PlayCircle, ExternalLink, Send, CheckCircle, XCircle, FileVideo } from 'lucide-react';

interface TasksProps {
  user: User;
}

export const Tasks: React.FC<TasksProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitTaskId, setSubmitTaskId] = useState<string | null>(null);
  const [submitLink, setSubmitLink] = useState('');

  const refreshTasks = () => {
    setTasks(db.getTasksByAssignee(user.id));
  };

  useEffect(() => {
    refreshTasks();
  }, [user]);

  const handleGetTask = () => {
    setLoading(true);
    // Simulate finding a task
    setTimeout(() => {
        try {
            const newTask = db.assignRandomTask(user.id);
            if (newTask) {
                refreshTasks();
            } else {
                alert("Tidak ada sound tersedia saat ini. Coba lagi nanti!");
            }
        } catch (err: any) {
            alert(err.message);
        }
        setLoading(false);
    }, 800);
  };

  const handleSubmitContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitTaskId && submitLink) {
        db.submitTask(submitTaskId, submitLink);
        setSubmitTaskId(null);
        setSubmitLink('');
        refreshTasks();
    }
  };

  const getSongDetails = (songId: string): Song | undefined => {
    return db.getAllSongs().find(s => s.id === songId);
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch(status) {
        case TaskStatus.PENDING: return 'Tertunda';
        case TaskStatus.SUBMITTED: return 'Terkirim';
        case TaskStatus.APPROVED: return 'Disetujui';
        case TaskStatus.REJECTED: return 'Ditolak';
        default: return status;
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Tugas Saya</h1>
            <p className="text-gray-500">Buat konten.</p>
        </div>
        <button 
            onClick={handleGetTask}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-lg shadow-md hover:from-pink-600 hover:to-rose-600 transition-all transform hover:-translate-y-0.5"
        >
            {loading ? 'Mencari Sound...' : 'Ambil Tugas Baru'}
        </button>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">Tidak ada tugas aktif. Klik "Ambil Tugas Baru" untuk mulai.</p>
             </div>
        )}
        
        {tasks.map(task => {
            const song = getSongDetails(task.songId);
            if (!song) return null;

            return (
                <div key={task.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center mb-2">
                                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500 mr-3">{task.taskCode}</span>
                                <h3 className="font-bold text-lg">{song.title} <span className="font-normal text-gray-500">oleh {song.artist}</span></h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                                <a href={song.tiktokAudioUrl} target="_blank" rel="noreferrer" className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-indigo-700">
                                    <PlayCircle className="h-4 w-4 mr-1" /> Gunakan Audio
                                </a>
                                {song.capcutTemplateUrl && (
                                     <a href={song.capcutTemplateUrl} target="_blank" rel="noreferrer" className="flex items-center px-3 py-1.5 bg-black hover:bg-gray-800 rounded-full text-white">
                                        <FileVideo className="h-4 w-4 mr-1" /> Gunakan Template CapCut
                                    </a>
                                )}
                            </div>
                             <span className={`inline-flex items-center capitalize px-2 py-0.5 rounded-full text-xs font-medium 
                                    ${task.status === TaskStatus.PENDING ? 'bg-blue-100 text-blue-700' : 
                                      task.status === TaskStatus.SUBMITTED ? 'bg-yellow-100 text-yellow-700' :
                                      task.status === TaskStatus.APPROVED ? 'bg-green-100 text-green-700' :
                                      'bg-red-100 text-red-700'}`}>
                                    Status: {getStatusLabel(task.status)}
                             </span>
                            {task.feedback && task.status === TaskStatus.REJECTED && (
                                <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">Masukan: {task.feedback}</p>
                            )}
                        </div>

                        <div className="mt-4 md:mt-0 flex-shrink-0">
                            {task.status === TaskStatus.PENDING || task.status === TaskStatus.REJECTED ? (
                                submitTaskId === task.id ? (
                                    <form onSubmit={handleSubmitContent} className="flex flex-col space-y-2">
                                        <input 
                                            type="url" 
                                            placeholder="Paste Link TikTok Disini" 
                                            className="px-3 py-2 border rounded-md text-sm w-full md:w-64 focus:ring-2 focus:ring-indigo-500"
                                            value={submitLink}
                                            onChange={e => setSubmitLink(e.target.value)}
                                            required
                                        />
                                        <div className="flex space-x-2">
                                            <button type="submit" className="flex-1 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex justify-center items-center">
                                                <Send className="h-4 w-4 mr-1" /> Kirim
                                            </button>
                                            <button type="button" onClick={() => setSubmitTaskId(null)} className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                                                <XCircle className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button 
                                        onClick={() => setSubmitTaskId(task.id)}
                                        className="px-4 py-2 border-2 border-indigo-600 text-indigo-600 rounded-md text-sm font-bold hover:bg-indigo-50"
                                    >
                                        Setor Link Konten
                                    </button>
                                )
                            ) : (
                                <div className="text-right">
                                    <a href={task.contentLink} target="_blank" rel="noreferrer" className="text-sm text-indigo-500 hover:underline flex items-center justify-end">
                                        Lihat Kiriman <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                    {task.status === TaskStatus.APPROVED && (
                                        <div className="mt-1">
                                             <p className="text-xs text-green-600 flex items-center justify-end font-bold">
                                                <CheckCircle className="h-3 w-3 mr-1" /> +10 Poin
                                            </p>
                                        </div>
                                    )}
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