import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Agenda() {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgendas() {
      const { data, error } = await supabase.from('agenda').select('*').order('date', { ascending: true });
      if (!error) setAgendas(data || []);
      setLoading(false);
    }
    fetchAgendas();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Agenda Sekolah</h1>
        <p className="text-gray-500">Pantau jadwal kegiatan dan acara penting sekolah Anda.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-3xl" />)}
        </div>
      ) : agendas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <CalendarIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Belum ada agenda kegiatan.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {agendas.map((item) => (
            <AgendaCard 
              key={item.id}
              date={new Date(item.date).getDate()}
              month={new Date(item.date).toLocaleString('id-ID', { month: 'short' }).toUpperCase()}
              title={item.title}
              location={item.description || 'Lokasi menyusul'}
              time="08:00 - selesai"
              status={item.status === 'akan datang' ? 'mendatang' : 'selesai'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AgendaCard({ date, month, title, location, time, status }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-8 group hover:border-primary/20 transition-all cursor-pointer">
      <div className="flex flex-col items-center justify-center w-20 h-20 bg-primary/5 rounded-2xl border border-primary/10">
        <span className="text-primary font-bold text-xl">{date}</span>
        <span className="text-primary-foreground bg-primary px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest">{month}</span>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
           <span className={cn(
             "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
             status === 'mendatang' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
           )}>
             {status}
           </span>
        </div>
        <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-2">{title}</h3>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {location}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
        </div>
      </div>
    </div>
  );
}
