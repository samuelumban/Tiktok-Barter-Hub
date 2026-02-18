import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/mockDb';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [viewState, setViewState] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>('LOGIN');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [usernameHasSpace, setUsernameHasSpace] = useState(false);

  // Forgot Password State
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Trim username to allow login if user accidentally added a space
    const user = db.login(loginUsername.trim(), loginPassword);
    if (user) {
        onLogin(user);
        navigate('/');
    } else {
        setError('Username atau password salah.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameHasSpace) {
        setError('Username tidak boleh mengandung spasi.');
        return;
    }
    try {
        const user = db.registerUser({
            name: regName,
            username: regUsername.trim(),
            password: regPassword,
            phoneNumber: regPhone,
            email: regEmail
        });
        onLogin(user);
        navigate('/');
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        db.resetPassword(forgotUsername.trim(), forgotPhone, newPassword);
        setSuccessMsg('Password berhasil diubah. Silakan login.');
        setTimeout(() => {
            setViewState('LOGIN');
            setSuccessMsg('');
            setError('');
        }, 2000);
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleRegUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setRegUsername(val);
      if (/\s/.test(val)) {
          setUsernameHasSpace(true);
      } else {
          setUsernameHasSpace(false);
      }
  };

  const renderRegister = () => (
    <form onSubmit={handleRegister} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Pendaftaran Baru</h2>
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input 
                type="text" 
                required
                placeholder="cth: Budi Santoso"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
                type="text" 
                required
                placeholder="cth: budi_kreator (tanpa spasi)"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${usernameHasSpace ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300'}`}
                value={regUsername}
                onChange={handleRegUsernameChange}
            />
            {usernameHasSpace && <p className="text-xs text-red-500 mt-1">Username tidak boleh mengandung spasi!</p>}
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
                type="password" 
                required
                placeholder="cth: Rahasia123!"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. HP / WhatsApp</label>
            <input 
                type="tel" 
                required
                placeholder="cth: 08123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
                type="email" 
                required
                placeholder="cth: budi@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
            />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
            type="submit" 
            disabled={usernameHasSpace}
            className={`w-full text-white py-3 rounded-lg font-bold transition-colors shadow-lg ${usernameHasSpace ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
        >
            Daftar Sekarang
        </button>
        <div className="mt-4 text-center">
            <button type="button" onClick={() => { setViewState('LOGIN'); setError(''); }} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Sudah punya akun? Masuk
            </button>
        </div>
    </form>
  );

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Masuk</h2>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
                type="text" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="Masukkan username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
                type="password" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder="******"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
            />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}
        
        <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
            Masuk Dasbor
        </button>
        
        <div className="flex flex-col space-y-2 mt-4 text-center">
             <button type="button" onClick={() => { setViewState('FORGOT_PASSWORD'); setError(''); }} className="text-sm text-gray-500 hover:text-gray-700">
                Lupa Password?
            </button>
            <button type="button" onClick={() => { setViewState('REGISTER'); setError(''); }} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Belum punya akun? Daftar
            </button>
        </div>
    </form>
  );

  const renderForgotPassword = () => (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Reset Password</h2>
        <p className="text-sm text-gray-500 text-center mb-4">Masukkan Username dan No. HP yang terdaftar untuk mengubah password.</p>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
                type="text" 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. HP Terdaftar</label>
            <input 
                type="tel" 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={forgotPhone}
                onChange={(e) => setForgotPhone(e.target.value)}
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input 
                type="password" 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
            type="submit" 
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg"
        >
            Ubah Password
        </button>
        <div className="mt-4 text-center">
            <button type="button" onClick={() => { setViewState('LOGIN'); setError(''); }} className="text-sm text-gray-600 hover:text-gray-800">
                Kembali ke Login
            </button>
        </div>
      </form>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-indigo-600 p-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">TikTok Barter Hub</h1>
                <p className="text-indigo-200">Ekosistem Konten Komunitas</p>
            </div>
            
            <div className="p-8">
                {viewState === 'REGISTER' && renderRegister()}
                {viewState === 'LOGIN' && renderLogin()}
                {viewState === 'FORGOT_PASSWORD' && renderForgotPassword()}
            </div>
        </div>
    </div>
  );
};