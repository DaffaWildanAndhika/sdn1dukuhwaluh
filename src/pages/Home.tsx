import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Newspaper, Trophy, Calendar, Users, ShieldCheck, 
  MapPin, Phone, Mail, Award, Camera, Target, History, User, 
  MessageSquare, ThumbsUp, Heart, Search, Filter, Clock, Star, Info, School
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { cn, formatDate } from '../lib/utils';

// Variants for animations
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
};

export default function Home() {
  const [news, setNews] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [newsRes, galleryRes, achievementsRes, agendaRes, teachersRes] = await Promise.all([
        supabase.from('news').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('gallery').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('achievements').select('*').order('date', { ascending: false }).limit(3),
        supabase.from('agenda').select('*').order('date', { ascending: true }).limit(3),
        supabase.from('teachers').select('*').order('created_at', { ascending: true }).limit(4)
      ]);
      
      if (!newsRes.error) setNews(newsRes.data || []);
      if (!galleryRes.error) setGallery(galleryRes.data || []);
      if (!achievementsRes.error) setAchievements(achievementsRes.data || []);
      if (!agendaRes.error) setAgenda(agendaRes.data || []);
      if (!teachersRes.error) setTeachers(teachersRes.data || []);
      setLoading(false);
    }
    fetchData();

    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, []);

  return (
    <div className="space-y-32">
      {/* 1. Hero Section */}
      <section id="home" className="pt-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto relative h-[600px] rounded-[40px] overflow-hidden bg-slate-900">
          {/* Local Video Background */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2"
            >
              <source src="/orientasi.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-8 md:px-20 z-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <span className="inline-block px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold mb-8 tracking-widest uppercase">
                Tahun Ajaran 2024/2025
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                Investasi Terbaik <br/> Untuk <span className="text-primary italic">Masa Depan</span>
              </h1>
              <p className="text-xl text-gray-200 mb-10 leading-relaxed max-w-lg opacity-90">
                Mencetak generasi unggul yang siap menghadapi tantangan global dengan landasan karakter yang kokoh.
              </p>
              <div className="flex flex-wrap gap-5">
                <Link to="/ppdb" className="px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-2xl shadow-primary/40">
                  Daftar Sekarang <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#profile" className="px-10 py-4 bg-white/10 text-white backdrop-blur-xl border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all">
                  Kenali Kami
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Stats Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <StatCard icon={Users} label="Siswa Aktif" value="850+" color="bg-blue-600" />
          <StatCard icon={ShieldCheck} label="Guru & Staff" value="65" color="bg-emerald-600" />
          <StatCard icon={Trophy} label="Prestasi" value="120+" color="bg-amber-600" />
          <StatCard icon={Calendar} label="Ekstrakurikuler" value="18" color="bg-rose-600" />
        </motion.div>
      </div>

      {/* 3. Profile Section */}
      <section id="profile" className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="text-center mb-20">
          <motion.h2 {...fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">Profil Sekolah</motion.h2>
          <motion.p {...fadeInUp} className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            E-School Hub adalah perpaduan tradisi pendidikan yang kuat dengan teknologi mutakhir.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/10 rounded-[40px] rotate-3 -z-10" />
            <img 
              src="/sekolah.png" 
              className="rounded-[40px] shadow-2xl border-4 border-white"
              alt="School Building"
            />
          </motion.div>
          <div className="space-y-10">
            <ProfileBlock 
              icon={Target} 
              title="Visi & Misi" 
              content="Mewujudkan generasi cerdas, berkarakter, dan berdaya saing global berbasis teknologi dan nilai luhur."
            />
            <ProfileBlock 
              icon={History} 
              title="Sejarah Singkat" 
              content="Didirikan tahun 1995 sebagai pionir literasi digital di Indonesia, kini bertransformasi menjadi institusi terakreditasi A."
            />
          </div>
        </div>

        <motion.div {...fadeInUp} className="flex justify-between items-end mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">Profil Guru</h2>
          <Link to="/guru" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all uppercase tracking-tighter text-sm">
            Lihat Semua Guru <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[30px]" />)
          ) : teachers.length > 0 ? (
            teachers.map((teacher) => (
              <ProfileCard key={teacher.id} name={teacher.name} role={teacher.subject} image={teacher.image_url} />
            ))
          ) : (
            <>
              <ProfileCard name="Dr. Budi Santoso" role="Kepala Sekolah" />
              <ProfileCard name="Siti Aminah, M.Pd" role="Waka Kurikulum" />
              <ProfileCard name="Joko Susilo, S.T" role="Waka Humas" />
              <ProfileCard name="Indah Permata" role="Bendahara" />
            </>
          )}
        </div>
      </section>
      {/* 4. News Section */}
      <section id="news" className="bg-gray-900 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm">Warta Kampus</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Berita Terbaru</h2>
            </div>
            <Link to="/news" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
              Semua Berita <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map(i => <div key={i} className="h-[450px] bg-white/5 animate-pulse rounded-[40px]" />)}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-20 text-gray-500">Belum ada berita terbaru.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {news.map((item, i) => (
                <NewsCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Gallery & Achievements */}
      <section id="gallery" className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold mb-12 flex items-center gap-4">
              <Camera className="w-8 h-8 text-primary" /> Galeri Momen
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {gallery.length === 0 ? (
                <div className="col-span-2 py-20 border-2 border-dashed border-gray-100 rounded-[30px] flex items-center justify-center text-gray-400">
                  Foto galeri akan muncul di sini
                </div>
              ) : gallery.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={cn("relative rounded-[30px] overflow-hidden group h-64 shadow-sm", (i === 0 || gallery.length === 1) && "col-span-2")}
                >
                  <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-bold uppercase tracking-widest">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div id="achievements">
            <h2 className="text-4xl font-bold mb-12 flex items-center gap-4">
              <Trophy className="w-8 h-8 text-amber-500" /> Prestasi
            </h2>
            <div className="space-y-6">
              {achievements.length === 0 ? (
                <p className="text-gray-400 italic">Belum ada prestasi tercatat.</p>
              ) : achievements.map((item) => (
                <AchievementItem 
                  key={item.id}
                  title={item.title} 
                  year={new Date(item.date).getFullYear()} 
                  image={item.image_url || 'https://images.unsplash.com/photo-1563206767-5b18f218e7de?auto=format&fit=crop&q=80&w=400'}
                />
              ))}
            </div>
            <Link to="/achievements" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:gap-4 transition-all uppercase tracking-tighter">
              Lihat Portal Prestasi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Agenda & Guest Book */}
      <section className="bg-gray-50 py-32 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div id="agenda">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-bold flex items-center gap-4">
                <Calendar className="w-8 h-8 text-primary" /> Agenda
              </h2>
              <div className="text-xs font-bold text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm uppercase tracking-widest">
                Updates 2024
              </div>
            </div>
            <div className="space-y-4">
              {agenda.length === 0 ? (
                <p className="text-gray-400 italic">Tidak ada agenda mendatang.</p>
              ) : agenda.map((item) => (
                <AgendaRow 
                  key={item.id}
                  date={new Date(item.date).getDate()} 
                  month={new Date(item.date).toLocaleString('id-ID', { month: 'short' }).toUpperCase()} 
                  title={item.title} 
                  status={item.status} 
                />
              ))}
            </div>
          </div>

          <div id="guestbook">
            <div className="bg-white p-10 rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Buku Tamu</h2>
                <p className="text-gray-500 mb-10 text-sm">Sampaikan kesan, pesan, atau pertanyaan Anda kepada kami secara terbuka.</p>
                <GuestBookForm />
              </div>
              <MessageSquare className="absolute -bottom-10 -right-10 w-48 h-48 text-primary/5 -rotate-12" />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-32">
        <div className="bg-primary p-12 md:p-20 rounded-[40px] text-center text-white relative overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Siap Menjadi Bagian Dari Kami?</h2>
            <p className="text-lg opacity-80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Pendaftaran peserta didik baru telah dibuka. Jangan lewatkan kesempatan untuk bergabung dengan komunitas belajar terbaik.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link to="/ppdb" className="px-12 py-5 bg-white text-primary rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-black/20">
                Daftar PPDB Sekarang
              </Link>
              <a href="https://wa.me/6281234567890" className="px-12 py-5 bg-white/10 border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                Tanya Lewat WhatsApp
              </a>
            </div>
          </motion.div>
          <div className="absolute top-0 right-0 p-10 opacity-10">
             <School className="w-64 h-64" />
          </div>
        </div>
      </section>
    </div>
  );
}

// Support Components
function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-lg transition-all group"
    >
      <div className={cn("p-4 rounded-2xl text-white group-hover:scale-110 transition-transform", color)}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">{value}</div>
        <div className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{label}</div>
      </div>
    </motion.div>
  );
}

function ProfileBlock({ icon: Icon, title, content }: any) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="flex gap-6 group"
    >
      <div className="shrink-0 w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500 leading-relaxed italic">{content}</p>
      </div>
    </motion.div>
  );
}

function ProfileCard({ name, role, image }: any) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="bg-white p-8 rounded-[30px] border border-gray-100 text-center hover:border-primary/20 transition-all hover:shadow-lg h-full flex flex-col items-center"
    >
      <div className="w-24 h-24 bg-gray-50 rounded-2xl mx-auto mb-6 flex items-center justify-center text-gray-300 overflow-hidden shadow-inner shrink-0">
        {image ? (
          <img src={image} className="w-full h-full object-cover" alt={name} />
        ) : (
          <User className="w-12 h-12" />
        )}
      </div>
      <h4 className="font-bold text-gray-900 mb-2 leading-tight">{name}</h4>
      <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-auto">{role}</p>
    </motion.div>
  );
}

function NewsCard({ item, index }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group bg-white/5 rounded-[40px] overflow-hidden border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer flex flex-col h-[480px]"
    >
      <div className="relative h-60 overflow-hidden ring-1 ring-white/10">
        <img src={item.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
        <div className="absolute top-6 left-6 px-4 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
          {item.category}
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <span className="text-xs text-primary font-bold mb-4">{formatDate(item.created_at)}</span>
        <h3 className="text-2xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-3 mb-8 leading-relaxed">
          {item.content}
        </p>
        <div className="mt-auto flex items-center gap-2 text-primary font-bold text-sm">
          Baca Detail <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

function AchievementItem({ title, year, image }: any) {
  return (
    <div className="flex gap-5 items-center group cursor-pointer">
      <div className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
        <div className="absolute inset-0 bg-amber-500/10" />
      </div>
      <div>
        <div className="text-[10px] font-bold text-amber-600 mb-1 uppercase tracking-widest">{year}</div>
        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">{title}</h3>
      </div>
    </div>
  );
}

function AgendaRow({ date, month, title, status }: any) {
  const isSelesai = status.toLowerCase() === 'selesai';
  return (
    <div className="flex gap-6 items-center p-6 bg-white rounded-3xl border border-gray-100 hover:border-primary/20 transition-all group cursor-pointer shadow-sm">
      <div className={cn(
        "shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl border transition-all",
        isSelesai ? "bg-gray-50 border-gray-200 grayscale" : "bg-primary/5 border-primary/10 group-hover:bg-primary group-hover:border-primary"
      )}>
        <span className={cn("text-xs font-bold uppercase", isSelesai ? "text-gray-400" : "text-primary group-hover:text-white")}>{month}</span>
        <span className={cn("text-xl font-bold", isSelesai ? "text-gray-400" : "text-gray-900 group-hover:text-white")}>{date}</span>
      </div>
      <div className="flex-1">
        <div className={cn("text-[10px] font-bold uppercase mb-1 tracking-widest", isSelesai ? "text-gray-300" : "text-blue-500")}>
          {status}
        </div>
        <h3 className={cn("font-bold text-gray-900 group-hover:text-primary transition-colors", isSelesai && "text-gray-400")}>{title}</h3>
      </div>
    </div>
  );
}

function GuestBookForm() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data: any) => {
    const { error } = await supabase.from('guest_book').insert([data]);
    if (!error) {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input {...register('name')} required className="input-field" placeholder="Nama Anda" />
        <input {...register('institution')} className="input-field" placeholder="Instansi" />
      </div>
      <input {...register('purpose')} required className="input-field" placeholder="Tujuan Kunjungan / Pesan" />
      <textarea {...register('message')} required rows={3} className="input-field" placeholder="Detail pesan atau saran..." />
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
      >
        {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
      </button>
      {success && (
         <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-emerald-500 font-bold text-sm mt-4 flex items-center justify-center gap-2">
            <ThumbsUp className="w-4 h-4" /> Pesan terkirim!
         </motion.p>
      )}
    </form>
  );
}
