'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

const FEATURES = [
  'Free Pickup & Delivery',
  '24-Hour Turnaround',
  'Hospital-Grade Hygiene',
  'All 7 Emirates',
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #b0003a 0%, #e91e8c 55%, #f06292 100%)',
      }}
    >
      {/* Logo row */}
      <div className="flex-shrink-0 px-5 pt-12 pb-2 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
          <Image
            src="/logo.png"
            alt="LaundryKhalas"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-white font-bold text-[15px] leading-tight">LaundryKhalas</p>
          <p className="text-pink-200 text-[11px] leading-tight">Premium Laundry &amp; Dry Cleaning</p>
        </div>
      </div>

      {/* Hero — fills remaining space above white card */}
      <div className="flex-1 flex flex-col justify-center px-5 pb-6">
        <h1 className="text-white font-black text-[2.4rem] leading-[1.1] mb-3">
          Fresh laundry,<br />without the<br />hassle.
        </h1>
        <p className="text-pink-100 text-sm leading-relaxed mb-7 max-w-xs">
          Book in seconds. We collect, clean, and deliver across all 7 Emirates.
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3">
          {FEATURES.map(label => (
            <div key={label} className="flex items-start gap-2">
              <CheckCircle size={14} className="text-pink-200 flex-shrink-0 mt-[1px]" />
              <span className="text-pink-100 text-xs font-medium leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* White bottom card — always anchored to bottom */}
      <div className="flex-shrink-0 bg-white rounded-t-[2rem] px-5 pt-7 pb-10 shadow-2xl">
        <button
          onClick={() => router.push('/user/book')}
          className="w-full flex items-center justify-center gap-2 py-[15px] rounded-2xl font-bold text-[15px] text-pink-600 border-2 border-pink-200 hover:bg-pink-50 active:bg-pink-100 active:scale-[0.98] transition-all"
        >
          Book a Pickup <ArrowRight size={17} />
        </button>

        <div className="flex items-center justify-center gap-10 mt-5">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-400 text-xs font-medium hover:text-gray-600 active:text-gray-800 transition-colors py-1"
          >
            Admin Panel →
          </button>
          <button
            onClick={() => router.push('/user')}
            className="text-gray-400 text-xs font-medium hover:text-gray-600 active:text-gray-800 transition-colors py-1"
          >
            Service Panel →
          </button>
        </div>
      </div>
    </div>
  );
}
