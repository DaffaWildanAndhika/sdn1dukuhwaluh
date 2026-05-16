import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, Send, Upload, Info, Bell, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const ppdbSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  schoolOrigin: z.string().min(3, 'Asal sekolah minimal 3 karakter'),
});

type PPDBFormData = z.infer<typeof ppdbSchema>;

export default function PPDB() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [regNo, setRegNo] = useState('');
  const [myRegistration, setMyRegistration] = useState<any>(null);
  const [showNotification, setShowNotification] = useState<{show: boolean, status: string, oldStatus: string}>({
    show: false,
    status: '',
    oldStatus: ''
  });
  
  // File states
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    kk: null,
    akta: null,
    sehat: null
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PPDBFormData>({
    resolver: zodResolver(ppdbSchema),
  });

  useEffect(() => {
    let channel: any = null;
    let isMounted = true;

    const setupRealtime = (userId: string) => {
      if (channel) supabase.removeChannel(channel);
      
      channel = supabase
        .channel(`my_registration_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ppdb_registrations',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (isMounted) {
              setMyRegistration((prev: any) => {
                if (prev && prev.status !== payload.new.status) {
                  setShowNotification({
                    show: true,
                    status: payload.new.status,
                    oldStatus: prev.status
                  });
                  // Hide notification after 5 seconds
                  setTimeout(() => setShowNotification(p => ({ ...p, show: false })), 5000);
                }
                return payload.new;
              });
            }
          }
        )
        .subscribe();
    };

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;

      if (session) {
        setSession(session);
        // Penting: Tunggu data pendaftaran selesai diambil sebelum menghilangkan loading
        await fetchMyRegistration(session.user.id);
        setupRealtime(session.user.id);
        setAuthLoading(false);
      } else {
        setAuthLoading(false);
        navigate('/login', { state: { from: { pathname: '/ppdb' } }, replace: true });
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      
      if (session) {
        fetchMyRegistration(session.user.id);
        setupRealtime(session.user.id);
      } else {
        setMyRegistration(null);
        if (channel) supabase.removeChannel(channel);
        navigate('/login', { state: { from: { pathname: '/ppdb' } }, replace: true });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchMyRegistration = async (userId: string) => {
    const { data, error } = await supabase
      .from('ppdb_registrations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!error && data) {
      setMyRegistration(data);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('ppdb')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('ppdb').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onSubmit = async (data: PPDBFormData) => {
    if (!files.kk || !files.akta || !files.sehat) {
      alert('Harap unggah semua dokumen yang diperlukan (PDF)');
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationNumber = `PPDB-${Date.now().toString().slice(-6)}`;
      
      // Upload documents
      const [kkUrl, aktaUrl, sehatUrl] = await Promise.all([
        uploadFile(files.kk, 'kk'),
        uploadFile(files.akta, 'akta'),
        uploadFile(files.sehat, 'sehat')
      ]);
      
      const { error } = await supabase
        .from('ppdb_registrations')
        .insert([{
          user_id: session.user.id,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          school_origin: data.schoolOrigin,
          registration_number: registrationNumber,
          status: 'pending',
          kartu_keluarga_url: kkUrl,
          akta_kelahiran_url: aktaUrl,
          surat_sehat_url: sehatUrl
        }]);

      if (error) throw error;

      setRegNo(registrationNumber);
      setSubmitted(true);
      fetchMyRegistration(session.user.id);
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Terjadi kesalahan saat pendaftaran. Pastikan bucket storage "ppdb" sudah dibuat di Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      alert('Dokumen harus berformat PDF');
      e.target.value = '';
      return;
    }
    setFiles(prev => ({ ...prev, [key]: file }));
  };

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-4" />
        <div className="h-4 w-32 bg-gray-100 rounded-full mb-2" />
        <div className="h-3 w-48 bg-gray-50 rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  const registrationData = myRegistration || (submitted ? { 
    full_name: 'Pendaftaran Anda', 
    registration_number: regNo, 
    status: 'pending' 
  } : null);

  return (
    <>
      <AnimatePresence>
        {showNotification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] w-full max-w-sm px-4"
          >
            <div className="bg-white shadow-2xl rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 animate-bounce transition-colors",
                showNotification.status === 'diterima' ? "bg-emerald-100 text-emerald-600" :
                showNotification.status === 'ditolak' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
              )}>
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 leading-tight">Pembaruan Status!</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Status Anda kini: <span className={cn(
                    "font-bold uppercase",
                    showNotification.status === 'diterima' ? "text-emerald-500" :
                    showNotification.status === 'ditolak' ? "text-rose-500" : "text-amber-500"
                  )}>{showNotification.status}</span>.
                </p>
              </div>
              <button 
                onClick={() => setShowNotification(p => ({ ...p, show: false }))}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {registrationData ? (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
            registrationData.status === 'pending' ? "bg-amber-50 text-amber-600" :
            registrationData.status === 'diterima' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            <UserPlus className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Status Pendaftaran</h1>
          <p className="text-gray-600 mb-8 font-medium">{registrationData.full_name}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Nomor Registrasi</span>
              <span className="text-2xl font-mono font-bold text-gray-900">{registrationData.registration_number}</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Status Saat Ini</span>
              <span className={cn(
                "text-2xl font-bold uppercase",
                registrationData.status === 'pending' ? "text-amber-500" :
                registrationData.status === 'diterima' ? "text-emerald-500" : "text-rose-500"
              )}>{registrationData.status}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-sm text-gray-500">
            <p>Terima kasih telah melakukan pendaftaran. Silakan cek halaman ini secara berkala untuk perubahan status pendaftaran Anda.</p>
          </div>

          <div className="mt-12 flex items-center justify-center gap-4">
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-gray-400 font-medium hover:text-rose-500 transition-colors"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="bg-primary text-white p-12 rounded-3xl mb-12 relative overflow-hidden">
            <div className="relative z-10 font-sans flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold mb-4">PPDB Online</h1>
                <p className="opacity-90 max-w-xl">
                  Halo, <strong>{session.user.email}</strong>. Silakan lengkapi formulir pendaftaran di bawah ini.
                </p>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="bg-white/10 hover:bg-white/20 p-2 px-4 rounded-xl text-xs font-bold transition-all"
              >
                Sign Out
              </button>
            </div>
            <UserPlus className="absolute bottom-[-20%] right-[-5%] w-64 h-64 opacity-10 rotate-12" />
          </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nama Lengkap" error={errors.fullName?.message}>
                <input {...register('fullName')} className="input-field" placeholder="Masukkan nama lengkap" />
              </FormField>
              <FormField label="Asal Sekolah" error={errors.schoolOrigin?.message}>
                <input {...register('schoolOrigin')} className="input-field" placeholder="E.g. SMP N 1 Yogyakarta" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Email Aktif" error={errors.email?.message}>
                <input {...register('email')} type="email" className="input-field" defaultValue={session.user.email} placeholder="email@example.com" />
              </FormField>
              <FormField label="Nomor Telepon/WA" error={errors.phone?.message}>
                <input {...register('phone')} className="input-field" placeholder="0812...." />
              </FormField>
            </div>

            <FormField label="Alamat Lengkap" error={errors.address?.message}>
              <textarea {...register('address')} rows={3} className="input-field" placeholder="Alamat rumah saat ini" />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-100">
              <FileField label="Kartu Keluarga" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'kk')} />
              <FileField label="Akta Kelahiran" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'akta')} />
              <FileField label="Surat Ket. Sehat" onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'sehat')} />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'} <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
            <h3 className="font-bold flex items-center gap-2 text-amber-800 mb-4">
              <Info className="w-5 h-5" /> Persyaratan
            </h3>
            <ul className="text-sm text-amber-700 space-y-3">
              <li className="flex gap-2"><span>•</span> FC Akta Kelahiran</li>
              <li className="flex gap-2"><span>•</span> FC Kartu Keluarga</li>
              <li className="flex gap-2"><span>•</span> Pas Foto 3x4 (2 lembar)</li>
              <li className="flex gap-2"><span>•</span> Surat Keterangan Lulus</li>
            </ul>
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-3xl">
            <h3 className="font-bold mb-4">Bantuan PPDB</h3>
            <p className="text-sm opacity-70 mb-4">Mengalami kendala saat pendaftaran? Hubungi panitia kami.</p>
            <div className="space-y-2 text-sm font-medium">
              <p>WA: 0812 3456 7890</p>
              <p>Email: ppdb@eschoolhub.sch.id</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</>
);
}

function FormField({ label, children, error }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">{label}</label>
      {children}
      {error && <p className="text-xs text-rose-500 font-medium ml-1">{error}</p>}
    </div>
  );
}

function FileField({ label, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">{label} (PDF)</label>
      <div className="relative group">
        <input 
          type="file" 
          accept="application/pdf"
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
        />
        <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex items-center justify-between group-hover:border-primary/30 transition-all">
          <span className="text-[10px] text-gray-400 font-medium truncate">Pilih file...</span>
          <Upload className="w-4 h-4 text-gray-400 group-hover:text-primary" />
        </div>
      </div>
    </div>
  );
}
