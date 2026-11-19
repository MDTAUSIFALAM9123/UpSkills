'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, X, MessageCircle } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  const phoneNumber = '918340593996';
  const whatsappNumber = '918340593996';
  const whatsappMessage = encodeURIComponent(
    'Hello UpSkills Team! \nI want to know more about your courses, enrollment process, and learning programs. Please assist me.'
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div
      ref={contactRef}
      className="fixed right-4 bottom-5 z-[9999] flex flex-col items-end gap-3 sm:right-7 sm:bottom-7"
    >
      {/* Contact Options */}
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-5 scale-95 opacity-0'
        }`}
      >
        {/* Call Now */}
        <a
          href={`tel:+${phoneNumber}`}
          className="group flex items-center gap-4 rounded-full border border-white/10 bg-[#1E1B4B] py-3 pr-4 pl-6 text-white shadow-xl shadow-purple-950/20 transition-all duration-300 hover:-translate-x-1"
        >
          <div className="text-left">
            <p className="text-sm font-bold">Call Now</p>
            <p className="text-[10px] text-purple-200">Talk to our team</p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 transition-colors group-hover:bg-purple-500">
            <Phone size={20} />
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-full border border-white/10 bg-[#1E1B4B] py-3 pr-4 pl-6 text-white shadow-xl shadow-purple-950/20 transition-all duration-300 hover:-translate-x-1"
        >
          <div className="text-left">
            <p className="text-sm font-bold">Connect On</p>
            <p className="text-[10px] text-purple-200">Quick support available</p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <FaWhatsapp size={26} className="text-[#25D366]" />
          </div>
        </a>
      </div>

      {/* Main Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
        aria-expanded={isOpen}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white shadow-lg shadow-purple-600/40 transition-all duration-300 hover:scale-110 hover:shadow-purple-600/60 active:scale-95"
      >
        {isOpen ? (
          <X size={28} className="transition-transform duration-300" />
        ) : (
          <MessageCircle
            size={28}
            className="transition-transform duration-300 group-hover:rotate-12"
          />
        )}
      </button>
    </div>
  );
}
