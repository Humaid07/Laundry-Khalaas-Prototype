'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Phone, Video, MoreVertical, MapPin, Package, Truck, CheckCircle, Star } from 'lucide-react';
import { ORDERS, DRIVERS } from '@/lib/mock-data';

/* ─── types ─── */
type MsgType = 'text' | 'options' | 'order_card' | 'driver_card';
type FlowStep =
  | 'main'
  | 'booking_service' | 'booking_time' | 'booking_address' | 'booking_confirm' | 'booking_done'
  | 'tracking'
  | 'change_time' | 'change_done'
  | 'support'
  | 'cancel_confirm' | 'cancel_done';

interface ChatMsg {
  id: string;
  role: 'agent' | 'user';
  content: string;
  type: MsgType;
  options?: string[];
  orderData?: Record<string, unknown>;
  driverData?: Record<string, unknown>;
  timestamp: string;
}

/* ─── helpers ─── */
const ts = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const agent = (content: string, type: MsgType = 'text', opts?: string[], extra: Partial<ChatMsg> = {}): ChatMsg =>
  ({ id: uid(), role: 'agent', content, type, options: opts, timestamp: ts(), ...extra });

const user = (content: string): ChatMsg =>
  ({ id: uid(), role: 'user', content, type: 'text', timestamp: ts() });

/* ─── static data ─── */
const MAIN_MENU = ['📦 Book a Pickup', '🔍 Track My Order', '⏰ Change Pickup Time', '📞 Call Support', '❌ Cancel Order'];
const SERVICES  = ['👕 Wash & Fold', '👔 Dry Cleaning', '👗 Ironing', '🛏 Duvets & Blankets', '🏠 Curtains', '🏢 Business Laundry'];
const TIMES     = ['Today 2–4 PM', 'Today 4–6 PM', 'Tomorrow 10 AM–12 PM', 'Tomorrow 2–4 PM'];
const CHANGE_TIMES = ['Today 4–6 PM', 'Tomorrow 10 AM–12 PM', 'Tomorrow 2–4 PM', 'Tomorrow 4–6 PM'];

const INITIAL: ChatMsg[] = [
  agent("Hi Humaid! 👋 Welcome to LaundryKhalas. I'm your AI assistant — here to help you book, track, and manage your laundry.", 'text'),
  agent("What would you like to do today?", 'options', MAIN_MENU),
];

/* ═══════════════════════════════════════════════════════ */
export default function AgentPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL);
  const [step, setStep]         = useState<FlowStep>('main');
  const [booking, setBooking]   = useState({ service: '', time: '' });
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  /* push one or more agent messages after a short delay */
  const reply = (msgs: ChatMsg[], delay = 1100) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(p => [...p, ...msgs]);
    }, delay);
  };

  /* called when user taps an option button or sends a typed message */
  const handleOption = (text: string) => {
    if (typing) return;                          // debounce while agent is typing
    setMessages(p => [...p, user(text)]);

    const order  = ORDERS[0];
    const driver = DRIVERS[0];

    switch (step) {

      /* ── Main menu ── */
      case 'main':
        if (text.includes('Book a Pickup')) {
          setStep('booking_service');
          reply([
            agent("Great! Let's get your laundry sorted. 🧺"),
            agent("Which service do you need?", 'options', SERVICES),
          ]);
        } else if (text.includes('Track My Order')) {
          setStep('tracking');
          reply([
            agent("One moment while I check your latest order..."),
            agent(`Your order is on the way! Driver ${driver.name} is heading to you.`, 'driver_card', undefined, { driverData: driver as unknown as Record<string, unknown> }),
            agent("Anything else I can help with?", 'options', ['📋 View Full Order', '🏠 Back to Menu']),
          ], 1200);
        } else if (text.includes('Change Pickup Time')) {
          setStep('change_time');
          reply([
            agent(`Your current pickup for order ${order.id} is Today 2–4 PM.\n\nChoose a new slot:`, 'options', CHANGE_TIMES),
          ]);
        } else if (text.includes('Call Support')) {
          setStep('support');
          reply([
            agent("Our support team is available 24/7 🌙\n\n📞 Dubai & North: +971 4 123 4567\n📞 Abu Dhabi & Al Ain: +971 2 987 6543\n📧 support@laundrykhalaas.ae", 'options', ['💬 Chat with Agent', '🏠 Back to Menu']),
          ]);
        } else if (text.includes('Cancel Order')) {
          setStep('cancel_confirm');
          reply([
            agent(`Are you sure you want to cancel order ${order.id} (${order.services.join(' + ')})?`, 'options', ['✅ Yes, Cancel It', '❌ No, Keep My Order']),
          ]);
        }
        break;

      /* ── Booking: service selection ── */
      case 'booking_service': {
        const svc = text.replace(/^[^\s]+\s/, '');   // strip leading emoji
        setBooking(p => ({ ...p, service: svc }));
        setStep('booking_time');
        reply([
          agent(`Got it — ${svc} it is! 👍\n\nWhen would you like us to collect?`, 'options', TIMES),
        ]);
        break;
      }

      /* ── Booking: time selection ── */
      case 'booking_time':
        setBooking(p => ({ ...p, time: text }));
        setStep('booking_address');
        reply([
          agent(`Pickup at ${text} — perfect!\n\nYour saved address:\n📍 Apt 1204, Marina Heights, Dubai Marina\n\nShall we use this?`, 'options', ['✅ Yes, Use This Address', '📝 Enter a Different Address']),
        ]);
        break;

      /* ── Booking: address confirm ── */
      case 'booking_address':
        if (text.includes('Yes')) {
          setStep('booking_confirm');
          reply([
            agent("Here's your order summary:", 'order_card', undefined, {
              orderData: {
                id: 'LK-AE-1025',
                services: [booking.service || 'Wash & Fold'],
                items: [{ name: 'Mixed laundry', qty: 1 }],
                pickupSlot: booking.time || 'Today 2–4 PM',
                deliveryEta: 'Tomorrow by 6 PM',
                paymentMethod: 'Pay on Delivery',
                amount: 45,
                status: 'created',
              },
            }),
            agent("Ready to confirm?", 'options', ['✅ Book It!', '✏️ Change Something']),
          ], 900);
        } else {
          reply([agent("No problem — please type your delivery address and I'll update it for you.")]);
        }
        break;

      /* ── Booking: final confirm ── */
      case 'booking_confirm':
        if (text.includes('Book It')) {
          setStep('booking_done');
          reply([
            agent("🎉 Your order LK-AE-1025 is confirmed! A driver will be assigned shortly and you'll get live updates.\n\nEstimated delivery: Tomorrow by 6 PM"),
            agent("What would you like to do next?", 'options', ['📦 Track This Order', '📋 Main Menu', '🏠 Go to Home']),
          ]);
        } else {
          setStep('booking_service');
          reply([agent("No problem! Let's start over. Which service do you need?", 'options', SERVICES)]);
        }
        break;

      /* ── Booking: done ── */
      case 'booking_done':
        if (text.includes('Track')) {
          setStep('tracking');
          reply([agent("Your order LK-AE-1025 is pending driver assignment. I'll notify you as soon as someone is on the way! 🚗", 'options', ['📋 Main Menu', '🏠 Go to Home'])]);
        } else if (text.includes('Home')) {
          router.push('/user');
        } else {
          setStep('main');
          reply([agent("What else can I help you with?", 'options', MAIN_MENU)]);
        }
        break;

      /* ── Tracking ── */
      case 'tracking':
        if (text.includes('View Full Order')) {
          router.push(`/user/orders/${order.id}`);
        } else {
          setStep('main');
          reply([agent("What else can I help you with?", 'options', MAIN_MENU)]);
        }
        break;

      /* ── Change time ── */
      case 'change_time':
        setStep('change_done');
        reply([
          agent(`✅ Done! Pickup updated to ${text}. You'll get a reminder 30 minutes before.`, 'options', ['📋 Main Menu', '🏠 Go to Home']),
        ]);
        break;

      case 'change_done':
        if (text.includes('Home')) { router.push('/user'); }
        else { setStep('main'); reply([agent("Anything else?", 'options', MAIN_MENU)]); }
        break;

      /* ── Support ── */
      case 'support':
        if (text.includes('Chat')) {
          setStep('main');
          reply([agent("You're already chatting with me! 😊 How can I help?", 'options', MAIN_MENU)]);
        } else {
          setStep('main');
          reply([agent("No problem! What else can I help with?", 'options', MAIN_MENU)]);
        }
        break;

      /* ── Cancel ── */
      case 'cancel_confirm':
        if (text.includes('Yes')) {
          setStep('cancel_done');
          reply([
            agent(`Your order ${order.id} has been cancelled. If you paid online, a refund will be processed within 3–5 business days. 💙`, 'options', ['📦 Book New Order', '🏠 Go to Home']),
          ]);
        } else {
          setStep('main');
          reply([agent(`Great choice! Order ${order.id} is still active and on track. 🎯\n\nAnything else?`, 'options', MAIN_MENU)]);
        }
        break;

      case 'cancel_done':
        if (text.includes('Book')) {
          setStep('booking_service');
          reply([agent("Let's book a new order! Which service do you need?", 'options', SERVICES)]);
        } else {
          router.push('/user');
        }
        break;
    }
  };

  /* typed message fallback */
  const sendTyped = () => {
    const t = input.trim();
    if (!t || typing) return;
    setInput('');
    setMessages(p => [...p, user(t)]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(p => [...p,
        agent("Thanks! I can help you best through the options below. What would you like to do?", 'options', MAIN_MENU),
      ]);
      setStep('main');
    }, 1300);
  };

  const QUICK = ['📦 Book a Pickup', '🔍 Track My Order', '📞 Call Support'];

  /* ─── render ─── */
  return (
    <div className="flex flex-col h-screen bg-gray-100">

      {/* Header */}
      <div className="px-4 pt-12 pb-3 flex items-center gap-3 text-white z-10"
        style={{ background: 'linear-gradient(135deg,#128C7E,#075E54)' }}>
        <button onClick={() => router.back()} className="flex-shrink-0 active:opacity-70">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-sm font-bold">LK</div>
        <div className="flex-1">
          <p className="font-bold text-sm leading-tight">LaundryKhalas Agent</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span className="text-green-200 text-xs">AI-powered · Online</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Phone size={18} className="text-white/80" />
          <Video size={18} className="text-white/80" />
          <MoreVertical size={18} className="text-white/80" />
        </div>
      </div>

      {/* Banner */}
      <div className="bg-teal-700 text-center py-1.5 flex-shrink-0">
        <p className="text-teal-200 text-[10px] font-medium">Powered by WhatsApp Agent · LaundryKhalas AI</p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-3 py-4" style={{ background: '#e5ddd5' }}>
        <div className="flex justify-center mb-3">
          <span className="bg-black/20 text-white text-xs px-3 py-1 rounded-full font-medium">Today</span>
        </div>

        <div className="space-y-1">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
              {msg.role === 'agent' && (
                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-[10px] font-bold mr-1.5 flex-shrink-0 self-end mb-0.5">LK</div>
              )}
              <div className={`max-w-[82%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                {/* text / options bubble */}
                {(msg.type === 'text' || msg.type === 'options') && (
                  <div>
                    <div className={`rounded-2xl px-3.5 py-2.5 shadow-sm ${msg.role === 'user' ? 'chat-bubble-out' : 'chat-bubble-in'}`}>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-green-100' : 'text-gray-400'}`}>{msg.timestamp}</p>
                    </div>
                    {msg.type === 'options' && msg.options && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.options.map(opt => (
                          <button key={opt} onClick={() => handleOption(opt)} disabled={typing}
                            className="bg-white text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm hover:bg-teal-50 active:bg-teal-100 disabled:opacity-50 transition-colors">
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* order card */}
                {msg.type === 'order_card' && msg.orderData && (
                  <div>
                    <OrderCard order={msg.orderData} onTrack={() => router.push('/user/orders')} />
                    <p className="text-[10px] mt-1 text-right text-gray-400">{msg.timestamp}</p>
                  </div>
                )}

                {/* driver card */}
                {msg.type === 'driver_card' && msg.driverData && (
                  <div>
                    <DriverCard driver={msg.driverData} onTrack={() => router.push(`/user/orders/${ORDERS[0].id}`)} />
                    <p className="text-[10px] mt-1 text-right text-gray-400">{msg.timestamp}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* typing indicator */}
          {typing && (
            <div className="flex items-end gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">LK</div>
              <div className="chat-bubble-in rounded-2xl px-4 py-3 flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
              </div>
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="bg-white border-t border-gray-100 px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
        {QUICK.map(r => (
          <button key={r} onClick={() => handleOption(r)} disabled={typing}
            className="flex-shrink-0 text-xs text-teal-700 font-semibold bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full hover:bg-teal-100 active:bg-teal-200 disabled:opacity-40 transition-colors whitespace-nowrap">
            {r}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="bg-white px-3 py-3 flex items-center gap-2 border-t border-gray-100 flex-shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendTyped()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none text-gray-800 placeholder-gray-400" />
        <button onClick={sendTyped} disabled={typing}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#128C7E,#075E54)' }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─── sub-components ─── */
function OrderCard({ order, onTrack }: { order: Record<string, unknown>; onTrack: () => void }) {
  const items = (order.items as { qty: number; name: string }[] | undefined) ?? [];
  const services = (order.services as string[] | undefined) ?? [];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-72">
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#c2185b,#e91e8c)' }}>
        <Package size={14} className="text-white" />
        <span className="text-white text-xs font-bold">{order.id as string}</span>
        <span className="ml-auto text-white/80 text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Pending</span>
      </div>
      <div className="p-3.5 space-y-2 text-xs">
        <Row label="Service"  value={services.join(' + ')} />
        <Row label="Items"    value={items.map(i => `${i.qty}x ${i.name}`).join(', ')} />
        <Row label="Pickup"   value={order.pickupSlot as string} />
        <Row label="Delivery" value={order.deliveryEta as string} />
        <Row label="Payment"  value={order.paymentMethod as string} />
        <div className="flex justify-between pt-2 border-t border-gray-100">
          <span className="text-gray-700 font-bold">Total</span>
          <span className="font-bold text-pink-600">AED {order.amount as number}</span>
        </div>
      </div>
      <div className="px-3.5 pb-3.5">
        <button onClick={onTrack} className="w-full text-white text-xs font-bold py-2 rounded-xl"
          style={{ background: 'linear-gradient(135deg,#c2185b,#e91e8c)' }}>
          View Order
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-700 text-right max-w-[55%]">{value}</span>
    </div>
  );
}

function DriverCard({ driver, onTrack }: { driver: Record<string, unknown>; onTrack: () => void }) {
  const initials = String(driver.name ?? '').split(' ').map((n: string) => n[0]).join('').slice(0, 2);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-64">
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#128C7E,#075E54)' }}>
        <Truck size={13} className="text-white" />
        <span className="text-white text-xs font-bold">Driver Assigned</span>
        <CheckCircle size={13} className="text-green-300 ml-auto" />
      </div>
      <div className="p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#c2185b,#e91e8c)' }}>
          {initials}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">{driver.name as string}</p>
          <div className="flex items-center gap-1">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-600">{driver.rating as number}</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-gray-500">{driver.vehicle as string}</span>
          </div>
        </div>
      </div>
      <div className="px-3.5 pb-3 space-y-2 text-xs">
        <div className="flex items-center gap-2 bg-teal-50 rounded-xl px-3 py-2">
          <MapPin size={11} className="text-teal-600 flex-shrink-0" />
          <span className="text-teal-700 font-semibold">Near {driver.location as string} · ETA 18 min</span>
        </div>
        <button onClick={onTrack} className="w-full text-white text-xs font-bold py-2 rounded-xl"
          style={{ background: 'linear-gradient(135deg,#c2185b,#e91e8c)' }}>
          Track on Map
        </button>
      </div>
    </div>
  );
}
