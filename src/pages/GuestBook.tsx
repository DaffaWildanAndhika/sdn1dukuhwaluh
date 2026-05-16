import { MessageSquare, ThumbsUp, Heart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function GuestBook() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    const { error } = await supabase.from('guest_book').insert([data]);
    if (!error) {
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="bg-emerald-600 text-white p-12 rounded-3xl mb-12 flex items-center justify-between overflow-hidden">
        <div>
          <h1 className="text-4xl font-bold mb-4">Buku Tamu Digital</h1>
          <p className="opacity-90">Sampaikan kritik, saran, atau tujuan kunjungan Anda kepada kami.</p>
        </div>
        <MessageSquare className="w-32 h-32 opacity-10 -rotate-12 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <input {...register('name')} required className="input-field" placeholder="Nama Lengkap" />
            <input {...register('institution')} className="input-field" placeholder="Instansi (Opsional)" />
            <input {...register('purpose')} className="input-field" placeholder="Tujuan Kunjungan" />
            <textarea {...register('message')} required rows={4} className="input-field" placeholder="Pesan, Kritik, atau Saran" />
          </div>
          
          <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all">
            Kirim Pesan
          </button>
          
          {success && (
            <p className="text-center text-emerald-600 text-sm font-bold flex items-center justify-center gap-2">
              <ThumbsUp className="w-4 h-4" /> Pesan terkirim! Terima kasih.
            </p>
          )}
        </form>

        <div className="flex flex-col justify-center gap-8">
          <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200">
            <h3 className="font-bold text-xl mb-4">Mengapa suara Anda penting?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Setiap masukan yang Anda berikan adalah bahan evaluasi kami untuk terus meningkatkan kualitas pelayanan dan fasilitas pendidikan bagi putra-putri kami.
            </p>
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                +1K
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">Telah Memberikan Masukan</p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-4 italic">"Pendidikan adalah senjata paling ampuh untuk mengubah dunia."</p>
            <div className="flex items-center justify-center gap-2 text-rose-500">
               <Heart className="w-4 h-4 fill-current" />
               <span className="text-xs font-bold uppercase">Kami Mendengarkan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
