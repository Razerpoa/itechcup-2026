import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 relative">
        <h1 className="text-[120px] md:text-[150px] font-extrabold text-[#FF9B71] tracking-tighter leading-none select-none">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay opacity-30">
          <h1 className="text-[120px] md:text-[150px] font-extrabold text-[#964825] tracking-tighter leading-none translate-x-2 translate-y-2">
            404
          </h1>
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        Halaman tidak ditemukan
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
        Maaf, halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau tidak pernah ada.
      </p>
      
      <Link 
        href="/"
        className="bg-[#FF9B71] text-white hover:bg-[#F5865A] active:bg-[#E8754D] px-8 py-3.5 rounded-full font-bold transition-all shadow-md flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Kembali ke Beranda
      </Link>
    </div>
  )
}
