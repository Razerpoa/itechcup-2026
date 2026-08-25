'use client'

import React, { useState } from 'react'
import { Headphones, Mail, MessageCircle, Send } from 'lucide-react'

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-white border border-[#EAEAEA] shadow-lg hover:border-[#FF9B71] flex items-center justify-center cursor-pointer transition-all"
      >
        <Headphones className={`w-5 h-5 transition-colors ${isOpen ? 'text-[#FF9B71]' : 'text-gray-500 hover:text-[#FF9B71]'}`} />
      </div>

      {isOpen && (
        <div className="fixed bottom-40 right-6 z-50 bg-white rounded-2xl shadow-xl border border-[#EAEAEA] p-5 w-64 animate-in fade-in zoom-in-95 duration-200">
          <h3 className="font-extrabold text-sm text-gray-900 mb-3">Hubungi Support</h3>
          
          <div className="space-y-2">
            <a 
              href="mailto:mitramuda.id@gmail.com"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer w-full group"
            >
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                <Mail className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-gray-900">mitramuda.id@gmail.com</div>
                <div className="text-[11px] text-gray-500">Email Support</div>
              </div>
            </a>
            
            <a 
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer w-full group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-gray-900">+62 812-3456-7890</div>
                <div className="text-[11px] text-gray-500">WhatsApp Cepat</div>
              </div>
            </a>
            
            <a 
              href="https://t.me/MitraMudaID"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer w-full group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <Send className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-gray-900">@MitraMudaID</div>
                <div className="text-[11px] text-gray-500">Telegram Channel</div>
              </div>
            </a>
          </div>
          
          <div className="text-[10px] text-gray-400 text-center mt-3 border-t border-gray-100 pt-3">
            Jam layanan: Senin-Jumat 08.00-17.00 WIB
          </div>
        </div>
      )}
    </>
  )
}
