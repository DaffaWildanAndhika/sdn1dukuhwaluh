import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Star, Award } from 'lucide-react';

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      const { data, error } = await supabase.from('achievements').select('*').order('date', { ascending: false });
      if (!error) setAchievements(data || []);
      setLoading(false);
    }
    fetchAchievements();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Prestasi Siswa</h1>
        <p className="text-gray-500 font-medium">Bangganya kami atas dedikasi dan pencapaian luar biasa para pejuang muda.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-3xl" />)}
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Belum ada prestasi yang tercatat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {achievements.map((item) => (
            <AchievementCard 
              key={item.id}
              title={item.title}
              student={item.description}
              year={new Date(item.date).getFullYear()}
              category={item.category}
              image={item.image_url || 'https://images.unsplash.com/photo-1563206767-5b18f218e7de?auto=format&fit=crop&q=80&w=800'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AchievementCard({ title, student, year, category, image }: any) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="relative h-48">
        <img src={image} className="w-full h-full object-cover" alt={title} />
        <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" /> {category}
        </div>
      </div>
      <div className="p-6">
        <div className="text-primary text-xs font-bold uppercase mb-1">{year}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500 text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" /> {student}
        </p>
      </div>
    </div>
  );
}
