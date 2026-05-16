import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, ShieldCheck, GraduationCap, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Teachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (!error) setTeachers(data || []);
      setLoading(false);
    }
    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-900 pt-20 pb-40 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Users className="w-4 h-4" /> Tenaga Pendidik
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight"
          >
            Direktori <span className="text-primary italic">Guru & Staff</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium"
          >
            Bertemu dengan para profesional berdedikasi yang membimbing generasi masa depan dengan integritas dan semangat inovasi.
          </motion.p>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 pb-32">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-[40px]" />
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] shadow-xl border border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl mx-auto mb-6 flex items-center justify-center text-slate-300">
               <User size={40} />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest">Data guru belum tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachers.map((teacher, i) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 text-center hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-slate-200/50 group flex flex-col items-center"
              >
                <div className="relative w-32 h-32 mb-8 shrink-0">
                   <div className="absolute inset-0 bg-primary/10 rounded-[35%] rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                   <div className="relative w-full h-full bg-slate-50 rounded-[35%] overflow-hidden border-4 border-white shadow-lg">
                      {teacher.image_url ? (
                        <img src={teacher.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={teacher.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={40} /></div>
                      )}
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary border border-slate-50">
                      <ShieldCheck size={20} />
                   </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{teacher.name}</h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                    <GraduationCap size={12} /> {teacher.subject}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Philosophy Section */}
      <section className="bg-slate-50 py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <div className="absolute -top-10 -left-10 text-[200px] font-black text-slate-900/[0.03] select-none leading-none pointer-events-none">QUOTE</div>
             <blockquote className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight italic">
              "Seorang guru yang baik dapat menginspirasi harapan, memicu imajinasi, dan menanamkan cinta belajar."
             </blockquote>
             <p className="mt-8 text-primary font-black uppercase tracking-widest">— Brad Henry</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h4 className="font-black text-slate-900 mb-2">95%</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Kepuasan Orang Tua Terhadap Tenaga Pendidik</p>
             </div>
             <div className="bg-primary text-white p-8 rounded-[40px] shadow-xl shadow-primary/20">
                <h4 className="font-black mb-2">12+</h4>
                <p className="text-xs opacity-70 font-bold uppercase tracking-widest leading-relaxed">Rata-rata Pengalaman Mengajar</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
