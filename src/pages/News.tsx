import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Newspaper, Search, Filter, ArrowRight } from 'lucide-react';
import { formatDate } from '../lib/utils';

export default function News() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) setNews(data || []);
      setLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Berita & Artikel</h1>
          <p className="text-gray-500">Informasi terbaru seputar kegiatan dan perkembangan sekolah.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 w-64" placeholder="Cari berita..." />
          </div>
          <button className="p-2 bg-white border border-gray-100 rounded-full text-gray-600 hover:text-primary">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-3xl" />)}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Belum ada berita yang diterbitkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all flex flex-col cursor-pointer">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={item.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase text-primary">
                  {item.category}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-xs text-gray-400 mb-2">{formatDate(item.created_at)}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                  {item.content.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-2 text-primary text-sm font-bold group-hover:gap-4 transition-all">
                  Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
