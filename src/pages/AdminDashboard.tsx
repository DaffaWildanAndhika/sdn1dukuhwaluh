import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Lock, LogOut, Users, Newspaper, Image as ImageIcon, 
  Trophy, Calendar, MessageSquare, X, User, Upload, ChevronRight, 
  Search, Bell, MoreVertical, Plus, Filter, Download,
  ExternalLink, CheckCircle2, AlertCircle, Clock, LayoutDashboard
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data states
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [guestbook, setGuestbook] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forms
  const [newsForm, setNewsForm] = useState({ title: '', content: '', category: 'Umum', image_url: '', slug: '' });
  const [galleryForm, setGalleryForm] = useState({ title: '', image_url: '', album: 'Sekolah' });
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [achievementForm, setAchievementForm] = useState({ title: '', description: '', category: 'akademik', image_url: '', date: new Date().toISOString().split('T')[0] });
  const [agendaForm, setAgendaForm] = useState({ title: '', description: '', date: new Date().toISOString().split('T')[0], status: 'akan datang' });
  const [teacherForm, setTeacherForm] = useState({ name: '', subject: '', image_url: '' });
  const [teacherFile, setTeacherFile] = useState<File | null>(null);

  useEffect(() => {
    const checkAdmin = async (session: any) => {
      if (!session) return;
      const { data, error } = await supabase.from('admins').select('id').eq('id', session.user.id).single();
      if (error || !data) {
        await supabase.auth.signOut();
        setLoginError('Sesi berakhir atau Anda bukan admin.');
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdmin(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkAdmin(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      if (activeTab === 'overview') fetchAllStats();
      if (activeTab === 'ppdb') fetchRegistrations();
      if (activeTab === 'news') fetchNews();
      if (activeTab === 'gallery') fetchGallery();
      if (activeTab === 'achievements') fetchAchievements();
      if (activeTab === 'agenda') fetchAgenda();
      if (activeTab === 'teachers') fetchTeachers();
      if (activeTab === 'guestbook') fetchGuestbook();
    }
  }, [session, activeTab]);

  const fetchAllStats = async () => {
    setLoading(true);
    await Promise.all([
      fetchRegistrations(),
      fetchNews(),
      fetchGallery(),
      fetchAchievements(),
      fetchAgenda(),
      fetchTeachers(),
      fetchGuestbook()
    ]);
    setLoading(false);
  };

  async function fetchRegistrations() {
    const { data, error } = await supabase.from('ppdb_registrations').select('*').order('created_at', { ascending: false });
    if (!error) setRegistrations(data || []);
  }

  async function fetchNews() {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (!error) setNews(data || []);
  }

  async function fetchGallery() {
    const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    if (!error) setGallery(data || []);
  }

  async function fetchAchievements() {
    const { data, error } = await supabase.from('achievements').select('*').order('created_at', { ascending: false });
    if (!error) setAchievements(data || []);
  }

  async function fetchAgenda() {
    const { data, error } = await supabase.from('agenda').select('*').order('date', { ascending: true });
    if (!error) setAgenda(data || []);
  }

  async function fetchTeachers() {
    const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: true });
    if (!error) setTeachers(data || []);
  }

  async function fetchGuestbook() {
    const { data, error } = await supabase.from('guest_book').select('*').order('created_at', { ascending: false });
    if (!error) setGuestbook(data || []);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      setLoading(false);
      return;
    }
    const { data: admin } = await supabase.from('admins').select('id').eq('id', user?.id).single();
    if (!admin) {
      await supabase.auth.signOut();
      setLoginError('Akses ditolak: Anda bukan admin.');
    }
    setLoading(false);
  };

  // Upload Logic
  async function uploadImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;
    const { error } = await supabase.storage.from('school-images').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('school-images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  // Delete Handlers
  const handleDelete = async (table: string, id: string, fetchFn: Function) => {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (!error) fetchFn();
      else alert(error.message);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary shadow-inner">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-black text-center text-slate-900 mb-2">Portal Admin</h1>
          <p className="text-slate-500 text-center text-sm mb-10 font-medium">Panel Pengendali Sistem Sekolah</p>
          
          {loginError && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl font-bold flex items-center gap-3">
              <AlertCircle size={18} />
              {loginError}
            </motion.div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Email Administrator</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" className="w-full bg-slate-50 border-2 border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all font-semibold" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@sekolah.sch.id" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 ml-1">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" className="w-full bg-slate-50 border-2 border-slate-100 pl-12 pr-4 py-4 rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all font-semibold" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Masuk ke Panel <ChevronRight size={20} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-primary/10 selection:text-primary">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 88 }}
        className="bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50 transition-all duration-300 shadow-sm"
      >
        <div className="p-6 flex items-center gap-4 h-24 border-b border-slate-50 overflow-hidden">
          <div className="w-12 h-12 bg-primary rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <ShieldCheck size={28} />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
              <h2 className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">AdminHub</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">School System v2.0</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem active={activeTab === 'overview'} open={sidebarOpen} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Ringkasan" />
          <div className="pt-4 pb-2">
            {sidebarOpen ? <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Pendaftaran</p> : <div className="h-px bg-slate-100 mx-4 mb-4" />}
            <NavItem active={activeTab === 'ppdb'} open={sidebarOpen} onClick={() => setActiveTab('ppdb')} icon={Users} label="Data PPDB" badge={registrations.filter(r => r.status === 'pending').length || undefined} />
          </div>
          <div className="pt-2 pb-2">
            {sidebarOpen ? <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Konten Sekolah</p> : <div className="h-px bg-slate-100 mx-4 mb-4" />}
            <NavItem active={activeTab === 'news'} open={sidebarOpen} onClick={() => setActiveTab('news')} icon={Newspaper} label="Berita & Artikel" />
            <NavItem active={activeTab === 'gallery'} open={sidebarOpen} onClick={() => setActiveTab('gallery')} icon={ImageIcon} label="Media Galeri" />
            <NavItem active={activeTab === 'achievements'} open={sidebarOpen} onClick={() => setActiveTab('achievements')} icon={Trophy} label="Prestasi Siswa" />
            <NavItem active={activeTab === 'agenda'} open={sidebarOpen} onClick={() => setActiveTab('agenda')} icon={Calendar} label="Agenda Kegiatan" />
          </div>
          <div className="pt-2 pb-2">
            {sidebarOpen ? <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Personalia</p> : <div className="h-px bg-slate-100 mx-4 mb-4" />}
            <NavItem active={activeTab === 'teachers'} open={sidebarOpen} onClick={() => setActiveTab('teachers')} icon={User} label="Direktori Guru" />
            <NavItem active={activeTab === 'guestbook'} open={sidebarOpen} onClick={() => setActiveTab('guestbook')} icon={MessageSquare} label="Buku Tamu" badge={guestbook.length || undefined} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-black text-sm uppercase tracking-wide">
            <LogOut size={20} />
            {sidebarOpen && <span>Keluar Sistem</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300 pb-12", sidebarOpen ? "pl-[280px]" : "pl-[88px]")}>
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors">
              {sidebarOpen ? <ChevronRight size={20} className="rotate-180" /> : <ChevronRight size={20} />}
            </button>
            <div className="relative max-w-md w-full hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Cari data, registrasi, atau berita..." className="w-full bg-slate-50/50 border border-slate-200 pl-12 pr-4 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:font-medium" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-px bg-slate-100 mx-2" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none mb-1">Administrator</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{session.user.email}</p>
              </div>
              <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white shadow-slate-200">
                {session.user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <DashboardOverview data={{ registrations, news, gallery, achievements, teachers, agenda, guestbook }} onTabChange={setActiveTab} />}
              {activeTab === 'ppdb' && <PPDBModule registrations={registrations} onUpdate={fetchRegistrations} />}
              {activeTab === 'news' && <ModuleHeader title="Berita & Artikel" description="Kelola publikasi informasi sekolah" actionLabel="Tulis Artikel" onAction={() => { setIsEditing(null); setNewsForm({ title: '', content: '', category: 'Umum', image_url: '', slug: '' }); setShowModal(true); }} />}
              {activeTab === 'news' && <NewsModule news={news} onEdit={(item: any) => { setIsEditing(item); setNewsForm(item); setShowModal(true); }} onDelete={(id: string) => handleDelete('news', id, fetchNews)} />}
              
              {activeTab === 'gallery' && <ModuleHeader title="Galeri Media" description="Kelola dokumentasi visual sekolah" actionLabel="Unggah Media" onAction={() => { setIsEditing(null); setGalleryForm({ title: '', image_url: '', album: 'Sekolah' }); setShowModal(true); }} />}
              {activeTab === 'gallery' && <GalleryModule gallery={gallery} onEdit={(item: any) => { setIsEditing(item); setGalleryForm(item); setShowModal(true); }} onDelete={(id: string) => handleDelete('gallery', id, fetchGallery)} />}

              {activeTab === 'achievements' && <ModuleHeader title="Prestasi Sekolah" description="Catatan pencapaian akademik & non-akademik" actionLabel="Tambah Prestasi" onAction={() => { setIsEditing(null); setAchievementForm({ title: '', description: '', category: 'akademik', image_url: '', date: new Date().toISOString().split('T')[0] }); setShowModal(true); }} />}
              {activeTab === 'achievements' && <AchievementModule achievements={achievements} onEdit={(item: any) => { setIsEditing(item); setAchievementForm(item); setShowModal(true); }} onDelete={(id: string) => handleDelete('achievements', id, fetchAchievements)} />}

              {activeTab === 'agenda' && <ModuleHeader title="Agenda Kegiatan" description="Jadwal acara dan program sekolah" actionLabel="Buat Agenda" onAction={() => { setIsEditing(null); setAgendaForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], status: 'akan datang' }); setShowModal(true); }} />}
              {activeTab === 'agenda' && <AgendaModule agenda={agenda} onEdit={(item: any) => { setIsEditing(item); setAgendaForm(item); setShowModal(true); }} onDelete={(id: string) => handleDelete('agenda', id, fetchAgenda)} />}

              {activeTab === 'teachers' && <ModuleHeader title="Direktori Guru" description="Manajemen data tenaga pengajar" actionLabel="Tambah Data Guru" onAction={() => { setIsEditing(null); setTeacherForm({ name: '', subject: '', image_url: '' }); setTeacherFile(null); setShowModal(true); }} />}
              {activeTab === 'teachers' && <TeacherModule teachers={teachers} onEdit={(item: any) => { setIsEditing(item); setTeacherForm(item); setTeacherFile(null); setShowModal(true); }} onDelete={(id: string) => handleDelete('teachers', id, fetchTeachers)} />}

              {activeTab === 'guestbook' && <HeaderOnly title="Buku Tamu" description="Feedback dan pesan dari pengunjung" count={guestbook.length} />}
              {activeTab === 'guestbook' && <GuestbookModule messages={guestbook} onDelete={(id: string) => handleDelete('guest_book', id, fetchGuestbook)} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals for Forms */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    {isEditing ? 'Ubah Data' : 'Tambah Baru'}
                  </h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{activeTab} Entry</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'news' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault(); setLoading(true);
                    const slug = newsForm.slug || newsForm.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    const payload = { ...newsForm, slug, author_id: session.user.id };
                    const { error } = isEditing 
                      ? await supabase.from('news').update(payload).eq('id', isEditing.id)
                      : await supabase.from('news').insert([payload]);
                    if (!error) { setShowModal(false); fetchNews(); } else alert(error.message);
                    setLoading(false);
                  }} className="space-y-6">
                    <FormField label="Judul Berita" value={newsForm.title} onChange={(v: string) => setNewsForm({...newsForm, title: v})} placeholder="Masukkan judul menarik..." required />
                    <FormField label="Konten Berita" type="textarea" value={newsForm.content} onChange={(v: string) => setNewsForm({...newsForm, content: v})} placeholder="Tulis rincian berita di sini..." required />
                    <FormField label="Kategori" type="select" value={newsForm.category} onChange={(v: string) => setNewsForm({...newsForm, category: v})} options={['Umum', 'Kegiatan', 'Pengumuman', 'Prestasi']} />
                    <FormField label="URL Gambar Hero" value={newsForm.image_url} onChange={(v: string) => setNewsForm({...newsForm, image_url: v})} placeholder="https://..." />
                    <div className="pt-6">
                      <SubmitButton loading={loading} label={isEditing ? "Perbarui Artikel" : "Terbitkan Berita"} />
                    </div>
                  </form>
                )}

                {activeTab === 'gallery' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault(); setLoading(true);
                    try {
                      let finalImageUrl = galleryForm.image_url;
                      if (galleryFile) finalImageUrl = await uploadImage(galleryFile);
                      if (!finalImageUrl) throw new Error('Harap pilih gambar');
                      const { error } = isEditing 
                        ? await supabase.from('gallery').update({ ...galleryForm, image_url: finalImageUrl }).eq('id', isEditing.id)
                        : await supabase.from('gallery').insert([{ ...galleryForm, image_url: finalImageUrl }]);
                      if (!error) { setShowModal(false); fetchGallery(); } else alert(error.message);
                    } catch (err: any) { alert(err.message); }
                    setLoading(false);
                  }} className="space-y-6">
                    <FormField label="Judul Foto" value={galleryForm.title} onChange={(v: string) => setGalleryForm({...galleryForm, title: v})} placeholder="Contoh: Gedung Laboratorium Baru" required />
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase text-slate-400 ml-1">Unggah Berkas Gambar</label>
                       <label className="flex flex-col items-center justify-center gap-3 p-10 border-4 border-dashed border-slate-100 rounded-3xl hover:border-primary/30 hover:bg-slate-50 transition-all cursor-pointer group">
                         <div className="w-16 h-16 bg-slate-50 group-hover:bg-primary/10 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-all">
                           <Upload size={32} />
                         </div>
                         <div className="text-center">
                           <p className="text-sm font-black text-slate-900">{galleryFile ? galleryFile.name : "Klik untuk pilih berkas"}</p>
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG up to 5MB</p>
                         </div>
                         <input type="file" className="hidden" accept="image/*" onChange={e => setGalleryFile(e.target.files?.[0] || null)} />
                       </label>
                    </div>
                    <FormField label="Atau Gunakan URL (Opsional)" value={galleryForm.image_url} onChange={(v: string) => setGalleryForm({...galleryForm, image_url: v})} placeholder="https://..." />
                    <div className="pt-6">
                      <SubmitButton loading={loading} label="Simpan ke Galeri" />
                    </div>
                  </form>
                )}

                {activeTab === 'achievements' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault(); setLoading(true);
                    const { error } = isEditing 
                      ? await supabase.from('achievements').update(achievementForm).eq('id', isEditing.id)
                      : await supabase.from('achievements').insert([achievementForm]);
                    if (!error) { setShowModal(false); fetchAchievements(); } else alert(error.message);
                    setLoading(false);
                  }} className="space-y-6">
                    <FormField label="Nama Prestasi" value={achievementForm.title} onChange={(v: string) => setAchievementForm({...achievementForm, title: v})} required />
                    <FormField label="Kategori" type="select" value={achievementForm.category} onChange={(v: string) => setAchievementForm({...achievementForm, category: v})} options={['akademik', 'non-akademik']} />
                    <FormField label="Tanggal Perolehan" type="date" value={achievementForm.date} onChange={(v: string) => setAchievementForm({...achievementForm, date: v})} required />
                    <FormField label="Deskripsi Pemenang" type="textarea" value={achievementForm.description} onChange={(v: string) => setAchievementForm({...achievementForm, description: v})} />
                    <FormField label="URL Gambar" value={achievementForm.image_url} onChange={(v: string) => setAchievementForm({...achievementForm, image_url: v})} />
                    <div className="pt-6">
                      <SubmitButton loading={loading} label="Simpan Prestasi" />
                    </div>
                  </form>
                )}

                {activeTab === 'agenda' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault(); setLoading(true);
                    const { error } = isEditing 
                      ? await supabase.from('agenda').update(agendaForm).eq('id', isEditing.id)
                      : await supabase.from('agenda').insert([agendaForm]);
                    if (!error) { setShowModal(false); fetchAgenda(); } else alert(error.message);
                    setLoading(false);
                  }} className="space-y-6">
                    <FormField label="Nama Kegiatan" value={agendaForm.title} onChange={(v: string) => setAgendaForm({...agendaForm, title: v})} required />
                    <FormField label="Tanggal Pelaksanaan" type="date" value={agendaForm.date} onChange={(v: string) => setAgendaForm({...agendaForm, date: v})} required />
                    <FormField label="Status" type="select" value={agendaForm.status} onChange={(v: string) => setAgendaForm({...agendaForm, status: v})} options={['akan datang', 'selesai', 'dibatalkan']} />
                    <FormField label="Rincian Kegiatan" type="textarea" value={agendaForm.description} onChange={(v: string) => setAgendaForm({...agendaForm, description: v})} />
                    <div className="pt-6">
                      <SubmitButton loading={loading} label="Buat Agenda" />
                    </div>
                  </form>
                )}

                {activeTab === 'teachers' && (
                  <form onSubmit={async (e) => {
                    e.preventDefault(); setLoading(true);
                    try {
                      let finalImageUrl = teacherForm.image_url;
                      if (teacherFile) finalImageUrl = await uploadImage(teacherFile);
                      const { error } = isEditing 
                        ? await supabase.from('teachers').update({ ...teacherForm, image_url: finalImageUrl }).eq('id', isEditing.id)
                        : await supabase.from('teachers').insert([{ ...teacherForm, image_url: finalImageUrl }]);
                      if (!error) { 
                        setShowModal(false); 
                        setTeacherFile(null);
                        fetchTeachers(); 
                      } else {
                        alert(error.message);
                      }
                    } catch (err: any) { alert(err.message); }
                    setLoading(false);
                  }} className="space-y-6">
                    <FormField label="Nama Lengkap & Gelar" value={teacherForm.name} onChange={(v: string) => setTeacherForm({...teacherForm, name: v})} required />
                    <FormField label="Mata Pelajaran" value={teacherForm.subject} onChange={(v: string) => setTeacherForm({...teacherForm, subject: v})} required />
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase text-slate-400 ml-1">Foto Profil Guru</label>
                       <label className="flex items-center gap-4 p-6 border-2 border-dashed border-slate-100 rounded-[2rem] hover:bg-slate-50 transition-all cursor-pointer group">
                         <div className="w-20 h-20 bg-slate-50 group-hover:bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all overflow-hidden">
                           {teacherFile ? <img src={URL.createObjectURL(teacherFile)} className="w-full h-full object-cover" /> : <User size={32} />}
                         </div>
                         <div>
                           <p className="text-sm font-black text-slate-900 leading-tight">Klik untuk unggah foto</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">300x300 recommended</p>
                         </div>
                         <input type="file" className="hidden" accept="image/*" onChange={e => setTeacherFile(e.target.files?.[0] || null)} />
                       </label>
                    </div>
                    <div className="pt-6">
                      <SubmitButton loading={loading} label="Simpan Data Guru" />
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function NavItem({ active, open, onClick, icon: Icon, label, badge }: any) {
  return (
    <button onClick={onClick} className={cn(
      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative text-left",
      active ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}>
      <Icon size={22} className={cn("transition-transform duration-200", active ? "scale-100" : "scale-90 group-hover:scale-100")} />
      {open && <span className="font-bold text-sm tracking-tight">{label}</span>}
      {badge !== undefined && (
        <span className={cn(
          "bg-rose-500 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-white",
          open ? "ml-auto" : "absolute top-2 right-2 border-none h-4 w-4 text-[8px]"
        )}>
          {badge}
        </span>
      )}
      {!open && active && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />}
    </button>
  );
}

function ModuleHeader({ title, description, actionLabel, onAction }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2 underline decoration-primary/20 decoration-[12px] underline-offset-[0px]">{title}</h1>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
          {description}
        </p>
      </div>
      <button onClick={onAction} className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 whitespace-nowrap">
        <Plus size={20} /> {actionLabel}
      </button>
    </div>
  );
}

function HeaderOnly({ title, description, count }: any) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight underline decoration-primary/20 decoration-[12px] underline-offset-[0px]">{title}</h1>
        <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase mt-1">{count} entries</span>
      </div>
      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{description}</p>
    </div>
  );
}

function DashboardOverview({ data, onTabChange }: any) {
  const stats = [
    { label: 'Total Pendaftar', value: data.registrations.length, trend: '+12%', icon: Users, color: 'bg-indigo-500', tab: 'ppdb' },
    { label: 'Artikel Berita', value: data.news.length, trend: '+3', icon: Newspaper, color: 'bg-emerald-500', tab: 'news' },
    { label: 'Agenda Aktif', value: data.agenda.filter((a: any) => a.status === 'akan datang').length, trend: 'Besok: 1', icon: Calendar, color: 'bg-amber-500', tab: 'agenda' },
    { label: 'Guru & Staff', value: data.teachers.length, trend: 'Aktif', icon: User, color: 'bg-slate-900', tab: 'teachers' },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onTabChange(stat.tab)}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className={cn("w-16 h-16 rounded-3xl mb-6 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", stat.color)}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-end gap-3">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</h3>
                <span className="text-[10px] font-black text-emerald-500 py-1 px-2 bg-emerald-50 rounded-lg mb-0.5">{stat.trend}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Pendaftaran Terbaru</h3>
            <button onClick={() => onTabChange('ppdb')} className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">Lihat Semua <ChevronRight size={14} /></button>
          </div>
          <div className="space-y-4">
            {data.registrations.slice(0, 5).map((reg: any) => (
              <div key={reg.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-50 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-100">
                    {reg.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{reg.full_name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reg.school_origin} • {formatDate(reg.created_at)}</p>
                  </div>
                </div>
                <StatusBadge status={reg.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Aktivitas Terkini</h3>
          <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {data.news.slice(0, 3).map((item: any) => (
              <div key={item.id} className="relative pl-10">
                <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-[6px] border-slate-50 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Berita Baru</p>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-2 line-clamp-2">{item.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(item.created_at)}</p>
                </div>
              </div>
            ))}
            {data.agenda.filter((a: any) => a.status === 'akan datang').slice(0, 2).map((item: any) => (
              <div key={item.id} className="relative pl-10">
                <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-white border-[6px] border-slate-50 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Agenda Mendatang</p>
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-2 line-clamp-2">{item.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PPDBModule({ registrations, onUpdate }: any) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
         <h2 className="text-xl font-black text-slate-900">List Registrasi Calon Siswa</h2>
         <div className="flex items-center gap-2">
            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-all"><Filter size={18} /></button>
            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 hover:bg-slate-100 transition-all"><Download size={18} /></button>
         </div>
      </div>
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FBFCFE] border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Register No.</th>
              <th className="px-8 py-5">Nama Siswa / Detail</th>
              <th className="px-8 py-5">Aksi / Verifikasi</th>
              <th className="px-8 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {registrations.map((reg: any) => (
              <tr key={reg.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-6">
                  <span className="font-mono text-xs font-black text-slate-300 group-hover:text-primary transition-colors">{reg.registration_number}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      {reg.full_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-none mb-1.5">{reg.full_name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reg.school_origin} • Terdaftar {formatDate(reg.created_at)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {reg.kartu_keluarga_url && <a href={reg.kartu_keluarga_url} target="_blank" className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition-all"><ImageIcon size={16} /></a>}
                    <button onClick={async () => {
                      const next = reg.status === 'pending' ? 'diterima' : reg.status === 'diterima' ? 'ditolak' : 'pending';
                      await supabase.from('ppdb_registrations').update({ status: next }).eq('id', reg.id);
                      onUpdate();
                    }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all">
                       Ubah Status
                    </button>
                    <button className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"><MoreVertical size={16} /></button>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <StatusBadge status={reg.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewsModule({ news, onEdit, onDelete }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item: any) => (
        <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group">
          <div className="h-56 bg-slate-100 relative overflow-hidden">
            {item.image_url ? (
               <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-200"><Newspaper size={48} /></div>
            )}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">{item.category}</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-6">
               <button onClick={() => onEdit(item)} className="px-5 py-2 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">Edit</button>
               <button onClick={() => onDelete(item.id)} className="px-5 py-2 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">Hapus</button>
            </div>
          </div>
          <div className="p-8 flex-1 flex flex-col">
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug mb-4 flex-1 line-clamp-3">{item.title}</h3>
            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(item.created_at)}</p>
              <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest">
                <LayoutDashboard size={12} /> Live
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GalleryModule({ gallery, onEdit, onDelete }: any) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {gallery.map((item: any) => (
        <div key={item.id} className="aspect-square bg-slate-100 rounded-[2rem] overflow-hidden relative group border border-slate-100">
           <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
           <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-between">
              <p className="text-white font-black text-sm tracking-tight leading-tight line-clamp-2">{item.title}</p>
              <div className="flex items-center gap-3">
                 <button onClick={() => onEdit(item)} className="flex-1 py-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all">Edit</button>
                 <button onClick={() => onDelete(item.id)} className="flex-1 py-3 bg-rose-500/40 hover:bg-rose-500/60 backdrop-blur-md rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all">Hapus</button>
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}

function AchievementModule({ achievements, onEdit, onDelete }: any) {
  return (
    <div className="space-y-4">
      {achievements.map((item: any) => (
        <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all border-l-8 border-l-primary">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-primary font-black shadow-inner">
               <Trophy size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-2">{item.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                 <span className="text-primary">{item.category}</span>
                 <span className="w-1 h-1 bg-slate-200 rounded-full" />
                 {formatDate(item.date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all">
             <button onClick={() => onEdit(item)} className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"><LayoutDashboard size={20} /></button>
             <button onClick={() => onDelete(item.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><X size={20} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AgendaModule({ agenda, onEdit, onDelete }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {agenda.map((item: any) => (
        <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
           <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 opacity-10 rounded-full transition-transform group-hover:scale-125 ${item.status === 'akan datang' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
           <div className="flex items-start justify-between mb-8">
              <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", item.status === 'akan datang' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                {item.status}
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => onEdit(item)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-primary transition-colors"><LayoutDashboard size={18} /></button>
                 <button onClick={() => onDelete(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"><X size={18} /></button>
              </div>
           </div>
           <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight mb-4">{item.title}</h3>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Calendar size={14} className="text-slate-400" />
                 <span className="text-xs font-black text-slate-400 uppercase tracking-tight">{formatDate(item.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Clock size={14} className="text-slate-400" />
                 <span className="text-xs font-black text-slate-400 uppercase tracking-tight">All Day</span>
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}

function TeacherModule({ teachers, onEdit, onDelete }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {teachers.map((item: any) => (
        <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all group">
           <div className="w-24 h-24 bg-slate-50 rounded-full mb-6 p-1 border-4 border-white shadow-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
              {item.image_url ? (
                <img src={item.image_url} className="w-full h-full object-cover rounded-full" alt={item.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200"><User size={40} /></div>
              )}
           </div>
           <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-1">{item.name}</h3>
           <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6">{item.subject}</p>
           <div className="flex items-center gap-3 w-full border-t border-slate-50 pt-6 mt-auto">
              <button onClick={() => onEdit(item)} className="flex-1 py-3 bg-slate-50 hover:bg-primary/10 hover:text-primary rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-wider transition-all">Edit</button>
              <button onClick={() => onDelete(item.id)} className="flex-1 py-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-wider transition-all">Hapus</button>
           </div>
        </div>
      ))}
    </div>
  );
}

function GuestbookModule({ messages, onDelete }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {messages.map((item: any) => (
        <div key={item.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 relative group shadow-sm">
           <div className="absolute top-8 right-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
              <button className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><Search size={18} /></button>
              <button onClick={() => onDelete(item.id)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><X size={18} /></button>
           </div>
           <p className="text-primary font-black text-6xl leading-none absolute top-4 left-6 opacity-10 select-none">“</p>
           <p className="text-slate-600 italic text-lg leading-relaxed mb-8 relative z-10">{item.message}</p>
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">{item.name?.charAt(0)}</div>
              <div>
                <h4 className="font-bold text-slate-900 leading-tight">{item.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.institution} • {formatDate(item.created_at)}</p>
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: any) {
  const styles: any = {
    pending: "bg-amber-100 text-amber-600 border-amber-200",
    diterima: "bg-emerald-100 text-emerald-600 border-emerald-200",
    ditolak: "bg-rose-100 text-rose-600 border-rose-200"
  };
  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center justify-center gap-1.5", styles[status] || styles.pending)}>
      {status === 'pending' && <Clock size={10} />}
      {status === 'diterima' && <CheckCircle2 size={10} />}
      {status === 'ditolak' && <AlertCircle size={10} />}
      {status}
    </span>
  );
}

function FormField({ label, type = 'text', value, onChange, placeholder, required, options }: { 
  label: string; 
  type?: string; 
  value: string; 
  onChange: (v: string) => void; 
  placeholder?: string; 
  required?: boolean; 
  options?: string[];
}) {
  const baseClass = "w-full bg-slate-50 border-2 border-slate-100 px-6 py-4 rounded-2xl focus:border-primary focus:ring-0 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300";
  
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
      {type === 'textarea' ? (
        <textarea className={cn(baseClass, "h-40 resize-none")} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
      ) : type === 'select' ? (
        <select className={baseClass} value={value} onChange={e => onChange(e.target.value)} required={required}>
          {options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} className={baseClass} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} />
      )}
    </div>
  );
}

function SubmitButton({ loading, label }: any) {
  return (
    <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">
      {loading ? "Memproses..." : label}
    </button>
  );
}
