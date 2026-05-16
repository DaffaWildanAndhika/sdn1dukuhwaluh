import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Login() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [initialLoading, setInitialLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/ppdb';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(from, { replace: true });
      } else {
        setInitialLoading(false);
      }
    };
    checkSession();
  }, [navigate, from]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (authMode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Pendaftaran berhasil! Silakan cek email Anda atau langsung login jika verifikasi tidak diaktifkan.');
        setAuthMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-100"
      >
        <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary">
          {authMode === 'login' ? <LogIn className="w-10 h-10" /> : <UserPlus className="w-10 h-10" />}
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2">
          {authMode === 'login' ? 'Selamat Datang' : 'Buat Akun Baru'}
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8">
          {authMode === 'login' 
            ? 'Masuk untuk melanjutkan pendaftaran PPDB' 
            : 'Daftar untuk mulai proses pendaftaran siswa baru'}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block ml-1">Email Sekolah/Pribadi</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                className="input-field pl-12" 
                placeholder="nama@email.com"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block ml-1">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="password" 
                className="input-field pl-12" 
                placeholder="••••••••"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Memproses...' : authMode === 'login' ? 'Masuk Sekarang' : 'Daftar Sekarang'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            {authMode === 'login' ? 'Belum punya akun?' : 'Sudah memiliki akun?'}
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="ml-2 text-primary font-bold hover:underline"
            >
              {authMode === 'login' ? 'Daftar Disini' : 'Login Disini'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
