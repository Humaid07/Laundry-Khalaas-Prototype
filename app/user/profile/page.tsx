'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, MapPin, CreditCard, Bell, Shield, HelpCircle,
  FileText, LogOut, ChevronRight, Star, Edit, X, Check,
  Phone, Mail, MessageCircle, Truck, Smartphone, Droplets,
  Wind, Leaf, Thermometer,
} from 'lucide-react';

/* ── types ── */
interface NotifSettings { orderUpdates: boolean; driverAlerts: boolean; promotions: boolean; reminders: boolean; }

/* ── static data ── */
const CLEANING_PREFS = [
  { id: 'hypoallergenic', label: 'Hypoallergenic Detergent', icon: Leaf,        desc: 'Gentle on sensitive skin' },
  { id: 'no_softener',    label: 'No Fabric Softener',       icon: Droplets,    desc: 'Skip the softener step' },
  { id: 'cold_water',     label: 'Cold Water Only',           icon: Thermometer, desc: 'Preserves fabric colour' },
  { id: 'hang_dry',       label: 'Hang Dry Preferred',        icon: Wind,        desc: 'Air dry instead of tumble dry' },
  { id: 'fragrance_free', label: 'Fragrance Free',            icon: Shield,      desc: 'No scented products used' },
];

const DEMO_REVIEWS = [
  { name: 'Sara M.',  rating: 5, date: 'Jun 20', comment: 'Super fast service! Clothes came back perfectly clean.', service: 'Dry Cleaning' },
  { name: 'Omar K.',  rating: 4, date: 'Jun 18', comment: 'Great service overall. Driver was punctual and friendly.', service: 'Wash & Fold' },
  { name: 'Aisha T.', rating: 5, date: 'Jun 15', comment: 'Best laundry service in Dubai. Highly recommend!', service: 'Ironing' },
];

/* ── tiny helpers ── */
function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
      <h3 className="font-bold text-gray-900 text-base">{title}</h3>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors">
        <X size={15} className="text-gray-500" />
      </button>
    </div>
  );
}

function SaveBtn({ label = 'Save', onPress }: { label?: string; onPress: () => void }) {
  return (
    <div className="px-5 pb-8 pt-3 flex-shrink-0">
      <button onClick={onPress} className="w-full py-3.5 rounded-2xl text-white font-bold text-sm active:opacity-80 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #c2185b, #e91e8c)' }}>
        {label}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();

  /* modal */
  const [modal, setModal] = useState<'notif' | 'payment' | 'ratings' | 'prefs' | 'support' | null>(null);
  const close = () => setModal(null);

  /* settings state */
  const [notif, setNotif] = useState<NotifSettings>({ orderUpdates: true, driverAlerts: true, promotions: false, reminders: true });
  const [payment, setPayment] = useState<'cod' | 'card' | 'apple'>('cod');
  const [prefs, setPrefs] = useState<string[]>(['hypoallergenic']);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [reviewDone, setReviewDone] = useState(false);

  /* derived labels */
  const notifCount = Object.values(notif).filter(Boolean).length;
  const paymentLabel = payment === 'cod' ? 'Pay on Delivery' : payment === 'card' ? 'Pay Online (Card)' : 'Apple Pay';
  const prefsLabel = prefs.length === 0 ? 'None selected'
    : prefs.length === 1 ? (CLEANING_PREFS.find(p => p.id === prefs[0])?.label ?? '')
    : `${prefs.length} preferences selected`;

  const MENU = [
    { section: 'Account',      icon: MapPin,      label: 'Saved Addresses',     sub: '2 addresses',               color: 'text-pink-500 bg-pink-50',   action: null },
    { section: 'Account',      icon: CreditCard,  label: 'Payment Methods',     sub: paymentLabel,                color: 'text-purple-500 bg-purple-50', action: 'payment' as const },
    { section: 'Account',      icon: Bell,        label: 'Notifications',       sub: `${notifCount} of 4 active`, color: 'text-amber-500 bg-amber-50',  action: 'notif' as const },
    { section: 'Preferences',  icon: Shield,      label: 'Cleaning Preferences',sub: prefsLabel,                  color: 'text-blue-500 bg-blue-50',    action: 'prefs' as const },
    { section: 'Preferences',  icon: Star,        label: 'Feedback & Ratings',  sub: reviewDone ? 'Thanks!' : 'Rate your last order', color: 'text-amber-500 bg-amber-50', action: 'ratings' as const },
    { section: 'Support',      icon: HelpCircle,  label: 'Help & Support',      sub: '24/7 · 2 numbers + email',  color: 'text-green-500 bg-green-50',  action: 'support' as const },
    { section: 'Support',      icon: FileText,    label: 'Terms & Privacy',     sub: 'Legal documents',           color: 'text-gray-500 bg-gray-100',   action: null },
  ];
  const sections = ['Account', 'Preferences', 'Support'];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-8" style={{ background: 'linear-gradient(145deg,#c2185b 0%,#e91e8c 50%,#f06292 100%)' }}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center active:bg-white/30 transition-colors">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-bold flex-1">Profile</h1>
          <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center active:bg-white/30 transition-colors">
            <Edit size={16} className="text-white" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/30 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">H</div>
          <div>
            <h2 className="text-white text-lg font-bold">Humaid Al Mansoori</h2>
            <p className="text-pink-200 text-sm">+971 50 XXX 5566</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded-full">VIP Member</span>
              <span className="text-[10px] text-pink-200">12 orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-4 -mt-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-3 divide-x divide-gray-100">
          {[{ label: 'Orders', value: '12' }, { label: 'AED Saved', value: '240' }, { label: 'Rating', value: '4.9' }].map(({ label, value }) => (
            <div key={label} className="text-center px-2">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Menu sections ── */}
      <div className="px-4 space-y-4 pb-6">
        {sections.map(section => {
          const items = MENU.filter(i => i.section === section);
          return (
            <div key={section}>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 px-1">{section}</p>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={() => item.action && setModal(item.action)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 active:scale-[0.99] transition-all text-left ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm font-semibold">{item.label}</p>
                        <p className="text-gray-400 text-xs truncate">{item.sub}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Saved addresses */}
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 px-1">Saved Addresses</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {[['Apt 1204, Marina Heights, Dubai Marina, Dubai', 'Home · Default'], ['Office 22, DIFC, Dubai', 'Work']].map(([addr, tag], i) => (
              <div key={addr} className={`flex items-start gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={15} className="text-pink-500" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-semibold leading-snug">{addr}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{tag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <button onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-red-100 shadow-sm hover:bg-red-50 active:bg-red-100 active:scale-[0.99] transition-all">
          <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-red-500" />
          </div>
          <span className="text-red-600 font-semibold text-sm">Sign Out</span>
        </button>
      </div>

      {/* ════════════════ MODALS ════════════════ */}
      {modal && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={close}>
          <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col" onClick={e => e.stopPropagation()}>

            {/* ── Notifications ── */}
            {modal === 'notif' && <>
              <ModalHeader title="Notifications" onClose={close} />
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                {([
                  { key: 'orderUpdates', label: 'Order Updates',     desc: 'Status changes for your orders' },
                  { key: 'driverAlerts', label: 'Driver Alerts',     desc: 'When driver is on the way' },
                  { key: 'promotions',   label: 'Promotions & Offers', desc: 'Discounts and special deals' },
                  { key: 'reminders',   label: 'Pickup Reminders',   desc: 'Alert 30 min before pickup' },
                ] as { key: keyof NotifSettings; label: string; desc: string }[]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <button onClick={() => setNotif(p => ({ ...p, [key]: !p[key] }))}
                      className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${notif[key] ? 'bg-pink-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notif[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <SaveBtn onPress={close} />
            </>}

            {/* ── Payment Methods ── */}
            {modal === 'payment' && <>
              <ModalHeader title="Payment Method" onClose={close} />
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                {([
                  { key: 'cod',   icon: Truck,       label: 'Pay on Delivery',      desc: 'Cash or card when order arrives' },
                  { key: 'card',  icon: CreditCard,  label: 'Pay Online (Card)',     desc: 'Visa, Mastercard, AMEX' },
                  { key: 'apple', icon: Smartphone,  label: 'Apple Pay',            desc: 'Fast and secure' },
                ] as { key: 'cod' | 'card' | 'apple'; icon: React.FC<{ size?: number }>; label: string; desc: string }[]).map(({ key, icon: Icon, label, desc }) => {
                  const active = payment === key;
                  return (
                    <button key={key} onClick={() => setPayment(key)}
                      className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 border-2 transition-all ${active ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-pink-100 text-pink-600' : 'bg-white text-gray-400'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-semibold ${active ? 'text-pink-700' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      {active && <Check size={16} className="text-pink-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <SaveBtn label="Confirm" onPress={close} />
            </>}

            {/* ── Feedback & Ratings ── */}
            {modal === 'ratings' && <>
              <ModalHeader title="Feedback & Ratings" onClose={close} />
              <div className="overflow-y-auto flex-1 px-5 py-4">
                {!reviewDone ? (
                  <div className="bg-pink-50 rounded-2xl p-4 mb-5">
                    <p className="text-xs font-bold text-pink-600 uppercase tracking-wide mb-1">Rate Your Last Order</p>
                    <p className="text-sm text-gray-500 mb-3">Order LK-AE-1022 · Wash &amp; Fold</p>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setMyRating(n)} className="active:scale-110 transition-transform">
                          <Star size={30} className={n <= myRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                        </button>
                      ))}
                    </div>
                    {myRating > 0 && <>
                      <textarea value={myReview} onChange={e => setMyReview(e.target.value)}
                        placeholder="Tell us more... (optional)"
                        className="w-full bg-white rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none border border-pink-100 resize-none mb-3" rows={3} />
                      <button onClick={() => { setReviewDone(true); close(); }}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-bold active:opacity-80"
                        style={{ background: 'linear-gradient(135deg,#c2185b,#e91e8c)' }}>
                        Submit Review
                      </button>
                    </>}
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-2xl p-4 mb-5 flex items-center gap-3">
                    <Check size={18} className="text-green-600" />
                    <p className="text-green-700 text-sm font-semibold">Thanks for your review!</p>
                  </div>
                )}

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Customer Reviews</p>
                <div className="space-y-3">
                  {DEMO_REVIEWS.map((r, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-xs font-bold">{r.name[0]}</div>
                          <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{r.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map(n => <Star key={n} size={12} className={n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                      <span className="text-[10px] text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full mt-2 inline-block">{r.service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>}

            {/* ── Cleaning Preferences ── */}
            {modal === 'prefs' && <>
              <ModalHeader title="Cleaning Preferences" onClose={close} />
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                <p className="text-xs text-gray-400 mb-1">Select all that apply — saved for every future order.</p>
                {CLEANING_PREFS.map(({ id, label, icon: Icon, desc }) => {
                  const on = prefs.includes(id);
                  return (
                    <button key={id} onClick={() => setPrefs(p => on ? p.filter(x => x !== id) : [...p, id])}
                      className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 border-2 transition-all text-left ${on ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${on ? 'bg-pink-100 text-pink-600' : 'bg-white text-gray-400'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${on ? 'text-pink-700' : 'text-gray-700'}`}>{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${on ? 'border-pink-500 bg-pink-500' : 'border-gray-300'}`}>
                        {on && <Check size={11} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <SaveBtn label="Save Preferences" onPress={close} />
            </>}

            {/* ── Help & Support ── */}
            {modal === 'support' && <>
              <ModalHeader title="Help & Support" onClose={close} />
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                <div className="bg-green-50 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <p className="text-green-700 text-sm font-semibold">Support online · Avg reply &lt; 2 min</p>
                </div>
                {[
                  { icon: Phone, color: 'bg-green-50 text-green-600', label: 'Dubai & Northern Emirates', value: '+971 4 123 4567' },
                  { icon: Phone, color: 'bg-green-50 text-green-600', label: 'Abu Dhabi & Al Ain',        value: '+971 2 987 6543' },
                  { icon: Mail,  color: 'bg-blue-50 text-blue-600',   label: 'Email Support',             value: 'support@laundrykhalaas.ae' },
                ].map(({ icon: Icon, color, label, value }) => (
                  <div key={value} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-sm font-bold text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => { close(); router.push('/user/agent'); }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm active:opacity-80"
                  style={{ background: 'linear-gradient(135deg,#128C7E,#075E54)' }}>
                  <MessageCircle size={16} /> Chat with AI Agent
                </button>
              </div>
            </>}

          </div>
        </div>
      )}
    </div>
  );
}
