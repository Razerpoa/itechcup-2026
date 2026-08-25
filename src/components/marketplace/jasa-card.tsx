import Image from 'next/image'
import Link from 'next/link'
import { Star, CheckCircle, ArrowRight } from 'lucide-react'
import { cn, formatRupiah } from '@/lib/utils'

export interface JasaCardProps {
  id: string | number
  judul: string
  namaPelajar: string
  fotoProfil?: string
  ratingRata: number
  jumlahProyekSelesai: number
  hargaBasic: number
  tags: string[]
  className?: string
}

export default function JasaCard({
  id,
  judul,
  namaPelajar,
  fotoProfil,
  ratingRata,
  jumlahProyekSelesai,
  hargaBasic,
  tags,
  className
}: JasaCardProps) {
  return (
    <article className={cn("bg-white rounded-2xl p-6 border border-[#EAEAEA] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5", className)}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#FAFAFA] overflow-hidden border border-[#EAEAEA] relative">
          {fotoProfil ? (
            <Image src={fotoProfil} alt={namaPelajar} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full bg-[#FFD9CA] flex items-center justify-center text-[#964825] font-bold">
              {namaPelajar.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-900">{namaPelajar}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="flex items-center text-amber-500 font-medium">
              <Star className="w-3 h-3 fill-current mr-1" />
              {ratingRata.toFixed(1)}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {jumlahProyekSelesai} selesai
            </span>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-extrabold text-lg leading-tight text-gray-900 mb-3 line-clamp-2">
          {judul}
        </h4>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="px-3 py-1 rounded-full bg-[#FFF1EB] text-[#B94D30] font-semibold text-[11px]">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 font-medium text-[11px]">
              +{tags.length - 3}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-auto flex justify-between items-end pt-4 border-t border-gray-100">
        <div>
          <p className="font-medium text-xs text-gray-500 mb-0.5">Mulai dari</p>
          <p className="font-bold text-[#964825] tracking-tight">
            {formatRupiah(hargaBasic)}
          </p>
        </div>
        <Link 
          href={`/profil/${id}`}
          className="text-[#FF9B71] hover:text-[#F5865A] font-bold text-sm flex items-center gap-1 transition-colors"
        >
          Lihat Jasa
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  )
}
