export interface SkillCategoryGroup {
  id: string
  name: string
  skills: string[]
}

export const SKILL_CATEGORIES: SkillCategoryGroup[] = [
  {
    id: 'tech',
    name: 'Teknologi & Web',
    skills: [
      'Web Development',
      'Frontend Developer',
      'Backend Developer',
      'Fullstack Developer',
      'WordPress & Landing Page',
      'React & Next.js',
      'Mobile App (Android/iOS)',
      'Flutter Developer',
      'UI/UX Design',
      'Figma Prototyping',
      'QA & Software Testing',
      'Database (MySQL/PostgreSQL)',
      'IT Support & Teknisi Komputer',
      'Teknisi Jaringan (TKJ)'
    ]
  },
  {
    id: 'design',
    name: 'Desain & Kreatif',
    skills: [
      'Desain Grafis',
      'Logo & Brand Identity',
      'Desain Kemasan (Packaging)',
      'Desain Feed & Story Medsos',
      'Desain Spanduk & Brosur',
      'Ilustrasi Digital & Vektor',
      '3D Modeling (Blender)',
      'Desain Presentasi (PPT/Pitch Deck)',
      'Desain Merchandise & Sablon',
      'Tipografi & Hand Lettering',
      'Desain Maskot'
    ]
  },
  {
    id: 'multimedia',
    name: 'Video, Foto & Audio',
    skills: [
      'Video Editor (Reels/TikTok/Shorts)',
      'Video Editor YouTube',
      'Motion Graphics & Animasi 2D',
      'Animasi 3D',
      'Color Grading',
      'Fotografi Produk UMKM',
      'Videografi & Video Iklan',
      'Voice Over & Pengisi Suara',
      'Audio Editing & Podcast',
      'Operator Live Streaming (OBS)'
    ]
  },
  {
    id: 'marketing',
    name: 'Pemasaran & Medsos',
    skills: [
      'Social Media Specialist',
      'Admin Media Sosial',
      'Copywriting Iklan',
      'Content Writing & Artikel SEO',
      'Digital Marketing',
      'Iklan Meta & TikTok Ads',
      'Content Creator',
      'Host Live Streaming Jualan',
      'Manajemen E-Commerce (Shopee/Tokopedia)',
      'Email Marketing'
    ]
  },
  {
    id: 'admin',
    name: 'Admin, Data & Bahasa',
    skills: [
      'Data Entry & Excel/Spreadsheet',
      'Admin Online / Virtual Assistant',
      'Pembukuan Sederhana UMKM',
      'Penerjemah Bahasa Inggris',
      'Penerjemah Bahasa Mandarin',
      'Transkripsi Audio ke Teks',
      'Riset Pasar UMKM',
      'Pengetikan & Pengolahan Dokumen'
    ]
  }
]

export const ALL_SKILLS: string[] = Array.from(
  new Set(SKILL_CATEGORIES.flatMap((c) => c.skills))
)

export const PROJECT_SERVICE_CATEGORIES = [
  'Desain Grafis & Kreatif',
  'Web & Pemrograman IT',
  'Video, Foto & Animasi',
  'Pemasaran Digital & Medsos',
  'Penulisan & Copywriting',
  'Admin, Data & Bisnis',
  'Aplikasi Mobile',
  'Lainnya'
]
