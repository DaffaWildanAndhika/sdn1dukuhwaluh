import { User, Target, History, Users } from 'lucide-react';

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Profil Sekolah</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Mengenal lebih dekat visi, misi, dan sejarah E-School Hub sebagai lembaga pendidikan terkemuka.</p>
      </div>

      <div className="grid gap-12">
        <Section title="Visi & Misi" icon={Target}>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-primary mb-4 italic">"Mewujudkan generasi cerdas, berkarakter, dan berdaya saing global berbasis teknologi dan nilai luhur."</h3>
            <ul className="space-y-4 text-gray-600 list-disc ml-5">
              <li>Menyelenggarakan pendidikan berkualitas berbasis kurikulum nasional dan internasional.</li>
              <li>Mengembangkan potensi minat dan bakat siswa melalui kegiatan ekstrakurikuler yang variatif.</li>
              <li>Menanamkan nilai-nilai religius dan etika dalam budaya sekolah.</li>
            </ul>
          </div>
        </Section>

        <Section title="Sejarah" icon={History}>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm leading-relaxed text-gray-600">
            Didirikan pada tahun 1995, E-School Hub berawal dari sebuah lembaga kursus kecil yang fokus pada pengembangan literasi digital. Seiring berjalannya waktu dan meningkatnya kepercayaan masyarakat, kami bertransformasi menjadi sekolah formal yang kini memiliki akreditasi A.
          </div>
        </Section>

        <Section title="Struktur Organisasi" icon={Users}>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ProfileCard name="Dr. Budi Santoso" role="Kepala Sekolah" />
              <ProfileCard name="Siti Aminah, M.Pd" role="Waka Kurikulum" />
              <ProfileCard name="Joko Susilo, S.T" role="Waka Humas" />
              <ProfileCard name="Indah Permata" role="Bendahara" />
           </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ProfileCard({ name, role }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-300">
        <User className="w-8 h-8" />
      </div>
      <h4 className="font-bold text-sm mb-1">{name}</h4>
      <p className="text-xs text-primary font-medium">{role}</p>
    </div>
  );
}
