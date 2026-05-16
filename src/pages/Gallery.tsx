import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Image as ImageIcon, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Gallery() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPhotos() {
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (!error) setPhotos(data || []);
      setLoading(false);
    }
    fetchPhotos();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Galeri Sekolah</h1>
        <p className="text-gray-500">Koleksi momen terbaik dalam kegiatan belajar mengajar dan ekstrakurikuler.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl" />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Belum ada foto galeri.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((item, i) => (
            <div key={item.id} className={cn(
              "group relative rounded-2xl overflow-hidden cursor-pointer",
              i % 3 === 0 ? "md:col-span-2 md:h-80" : "h-40 md:h-80"
            )}>
              <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <div className="text-center">
                  <Camera className="text-white w-8 h-8 mx-auto mb-2" />
                  <p className="text-white text-xs font-bold">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
