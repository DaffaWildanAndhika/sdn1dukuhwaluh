import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, School, Home, Info, Newspaper, Image, Trophy, Calendar, UserPlus, BookOpen, ShieldCheck, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

const navLinks = [
  { name: 'Home', href: '/#home', icon: Home },
  { name: 'Profil', href: '/#profile', icon: Info },
  { name: 'Berita', href: '/#news', icon: Newspaper },
  { name: 'Galeri', href: '/#gallery', icon: Image },
  { name: 'Agenda', href: '/#agenda', icon: Calendar },
  { name: 'Guru', href: '/guru', icon: GraduationCap },
  { name: 'PPDB', href: '/ppdb', icon: UserPlus },
  { name: 'Buku Tamu', href: '/#guestbook', icon: BookOpen },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('admins')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    }
    
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAdmin();
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const elementId = href.substring(2);
      const element = document.getElementById(elementId);
      if (element) {
        if (location.pathname === '/') {
          e.preventDefault();
          element.scrollIntoView({ behavior: 'smooth' });
          setIsOpen(false);
        }
      }
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
      scrolled ? "py-2 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100" : "py-4 bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" onClick={(e) => handleNavLinkClick(e, '/#home')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 p-1.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all flex items-center justify-center shrink-0">
            <img src="/logo.jpg" className="w-full h-full object-contain" alt="Logo" referrerPolicy="no-referrer" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-primary transition-colors">SDN 1 DUKUHWALUH</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href || (location.pathname === '/' && link.href.startsWith('/#') && location.hash === link.href.substring(1));
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-gray-100",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {link.name}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className="ml-4 p-2 text-gray-400 hover:text-primary transition-colors"
              title="Admin Dashboard"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-600"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-gray-100 md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    (location.pathname === link.href || (location.pathname === '/' && link.href.startsWith('/#'))) ? "bg-primary/10 text-primary" : "hover:bg-gray-50"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-rose-500 hover:bg-rose-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium">Admin Hub</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
