import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PPDB from './pages/PPDB';
import Teachers from './pages/Teacher';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { motion } from 'motion/react';
import { cn } from './lib/utils';
import { School, MapPin, Phone, Mail } from 'lucide-react';

import { useLocation } from 'react-router-dom';

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("min-h-screen", !isAdminPage && "pt-20")}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // @ts-ignore
  const isSupabaseMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <>
      {isSupabaseMissing && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-500 text-white text-[10px] font-bold py-1 px-4 text-center">
          ⚠️ Supabase not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your Secrets.
        </div>
      )}
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        
        {/* Redirects for merged pages */}
        <Route path="/profile" element={<Navigate to="/#profile" replace />} />
        <Route path="/news" element={<Navigate to="/#news" replace />} />
        <Route path="/gallery" element={<Navigate to="/#gallery" replace />} />
        <Route path="/achievements" element={<Navigate to="/#achievements" replace />} />
        <Route path="/agenda" element={<Navigate to="/#agenda" replace />} />
        <Route path="/guestbook" element={<Navigate to="/#guestbook" replace />} />
        
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/ppdb" element={<PageWrapper><PPDB /></PageWrapper>} />
        <Route path="/guru" element={<PageWrapper><Teachers /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
      </Routes>
      
      {!isAdminPage && (
        <footer className="bg-slate-900 text-white py-24 px-4 md:px-8 mt-32 border-t border-white/5">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 p-2 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden">
                  <img src="/logo.jpg" className="w-full h-full object-contain" alt="Logo" referrerPolicy="no-referrer" />
                </div>
                <h3 className="font-black text-2xl tracking-tighter uppercase italic">SDN 1 DUKUHWALUH <span className="text-primary NOT-italic">Hub</span></h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                Mencetak generasi unggul yang siap menghadapi tantangan global dengan landasan karakter yang kokoh dan inovasi teknologi.
              </p>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-8 text-primary">Navigasi</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><Link to="/#home" className="hover:text-white transition-colors">Beranda Utama</Link></li>
                <li><Link to="/#profile" className="hover:text-white transition-colors">Profil Sekolah</Link></li>
                <li><Link to="/guru" className="hover:text-white transition-colors">Direktori Guru & Staff</Link></li>
                <li><Link to="/ppdb" className="hover:text-white transition-colors">Informasi PPDB</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-8 text-primary">Hubungi Kami</h4>
              <div className="space-y-6 text-sm text-slate-400">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <span className="leading-relaxed">Jl. Pendidikan No. 123, Sleman, Yogyakarta 55281</span>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <span>(0274) 123 4567</span>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <span>info@eschoolhub.sch.id</span>
                </div>
              </div>
            </div>

            <div className="rounded-[40px] overflow-hidden border-4 border-white/5 shadow-2xl h-64 lg:h-full min-h-[200px]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126514.99632363!2d110.334005!3d-7.79558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a57fd2e3c054b%3A0x6b80145c26b868e8!2sYogyakarta%2C%20Yogyakarta%20City%2C%20Special%20Region%20of%20Yogyakarta!5e0!3m2!1sen!2sid!4v1715870000000!5m2!1sen!2sid"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi Sekolah"
              />
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <p>© 2024 SDN 1 DUKUHWALUH. Seluruh hak cipta dilindungi.</p>
            <p className="flex items-center gap-2">
              Dibuat dengan <span className="text-rose-500">❤️</span> oleh Tim Inovasi Sekolah
            </p>
          </div>
        </footer>
      )}
    </>
  );
}

export function AppContainer() {
  return (
    <Router>
      <App />
    </Router>
  );
}
