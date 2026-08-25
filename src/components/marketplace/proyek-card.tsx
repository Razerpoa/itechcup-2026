import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowRight, Bookmark } from 'lucide-react'
import { cn, formatRupiah, formatRelativeTime } from '@/lib/utils'

export interface ProyekCardProps {
  id: string | number
  judul: string
  keteranganSingkat: string
  namaUsaha: string
  fotoUsaha?: string
  budgetMin: number
  budgetMax: number
  dpPersen: number
  tags: string[]
  createdAt: string | Date
  jumlahPelamar?: number
  className?: string
}

export default function ProyekCard({
  id,
  judul,
  keteranganSingkat,
  namaUsaha,
  fotoUsaha,
  budgetMin: __budgetMin,
  budgetMax,
  dpPersen,
  tags,
  createdAt,
  jumlahPelamar = 0,
  className
}: ProyekCardProps) {
  return (
    <article className={cn("bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-6 relative group", className)}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-[68px] h-[68px] rounded-2xl bg-[#FAFAFA] overflow-hidden flex-shrink-0 border border-[#EAEAEA] p-0.5 relative">
            {fotoUsaha ? (
              <Image src={fotoUsaha} alt={namaUsaha} fill className="object-cover rounded-xl" unoptimized />
            ) : (
              <div className="w-full h-full bg-[#FFD9CA] rounded-xl flex items-center justify-center text-[#964825] font-bold text-xl">
                {namaUsaha.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight text-gray-900 tracking-tight mb-1">{namaUsaha}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF9B71]"></span>
              {formatRelativeTime(createdAt)}
            </p>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition-colors -mr-2 -mt-2">
          <Bookmark className="w-6 h-6" />
        </button>
      </div>
      
      <div>
        <h4 className="font-extrabold text-xl leading-tight text-gray-900 tracking-tight mb-3 line-clamp-2">
          {judul}
        </h4>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{keteranganSingkat}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {dpPersen > 0 && (
            <span className="px-3 py-1 rounded-full bg-[#FFF1EB] text-[#B94D30] font-semibold text-xs tracking-wide">
              DP {dpPersen}%
            </span>
          )}
          {tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium text-xs tracking-wide">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4 text-[#FF9B71]" />
          <span>{jumlahPelamar} Pelamar</span>
        </div>
      </div>
      
      <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-100">
        <div>
          <p className="font-medium text-xs text-gray-500 mb-0.5 tracking-wider uppercase">Budget</p>
          <p className="font-extrabold text-lg text-gray-900 tracking-tighter">
            {formatRupiah(budgetMax)}
          </p>
        </div>
        <Link 
          href={`/marketplace/${id}`}
          className="bg-[#FF9B71] hover:bg-[#F5865A] active:bg-[#E8754D] text-white font-bold text-sm px-5 py-2.5 rounded-full transition-all flex items-center justify-center gap-2"
        >
          Lihat Detail
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  )
}
