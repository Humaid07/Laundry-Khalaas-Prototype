// Mock data for LaundryKhalas demo app

export type OrderStatus =
  | 'created'
  | 'confirmed'
  | 'pickup_assigned'
  | 'picked_up'
  | 'cleaning'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type ServiceType =
  | 'wash_fold'
  | 'dry_cleaning'
  | 'ironing'
  | 'blankets_duvets'
  | 'curtains_upholstery'
  | 'business_laundry';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
  rating: number;
  status: 'available' | 'on_pickup' | 'on_delivery' | 'off_duty';
  location: string;
  emirate: string;
  completedToday: number;
  avatar: string;
}

export interface OrderItem {
  name: string;
  qty: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  services: string[];
  items: OrderItem[];
  pickupAddress: string;
  deliveryAddress: string;
  emirate: string;
  pickupSlot: string;
  deliveryEta: string;
  status: OrderStatus;
  driverId: string | null;
  driverName: string | null;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  notes: string;
  createdAt: string;
  updatedAt: string;
  facilityAssigned: string;
  isB2B: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  emirate: string;
  savedAddresses: string[];
  ordersCount: number;
  lastOrder: string;
  status: 'active' | 'inactive' | 'vip';
  joinedAt: string;
  totalSpent: number;
}

export interface BusinessClient {
  id: string;
  name: string;
  type: string;
  emirate: string;
  contactName: string;
  phone: string;
  weeklyVolume: string;
  contractStatus: 'active' | 'pending' | 'expired';
  lastPickup: string;
  outstandingInvoice: number;
  accountHealth: 'excellent' | 'good' | 'attention';
  logo: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  turnaround: string;
  startingPrice: string;
  priceUnit: string;
  icon: string;
  type: ServiceType;
  popular: boolean;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  type: 'text' | 'options' | 'order_summary' | 'driver_card';
  options?: string[];
  orderData?: Partial<Order>;
  driverData?: Partial<Driver>;
}

export const DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Ahmed Khan',
    phone: '+971 50 XXX 1660',
    vehicle: 'Toyota Hiace Van',
    vehicleNumber: 'Dubai A 12345',
    rating: 4.8,
    status: 'on_pickup',
    location: 'Dubai Marina',
    emirate: 'Dubai',
    completedToday: 7,
    avatar: 'AK',
  },
  {
    id: 'd2',
    name: 'Fatima Noor',
    phone: '+971 55 XXX 2891',
    vehicle: 'Hyundai H-1 Van',
    vehicleNumber: 'Dubai B 67890',
    rating: 4.9,
    status: 'on_delivery',
    location: 'Business Bay',
    emirate: 'Dubai',
    completedToday: 9,
    avatar: 'FN',
  },
  {
    id: 'd3',
    name: 'Imran Ali',
    phone: '+971 52 XXX 4422',
    vehicle: 'Kia Bongo Van',
    vehicleNumber: 'Dubai C 11223',
    rating: 4.7,
    status: 'on_pickup',
    location: 'JVC',
    emirate: 'Dubai',
    completedToday: 6,
    avatar: 'IA',
  },
  {
    id: 'd4',
    name: 'Mohammed Rashid',
    phone: '+971 56 XXX 7733',
    vehicle: 'Toyota Hiace Van',
    vehicleNumber: 'Sharjah A 44556',
    rating: 4.6,
    status: 'available',
    location: 'Al Nahda, Sharjah',
    emirate: 'Sharjah',
    completedToday: 5,
    avatar: 'MR',
  },
  {
    id: 'd5',
    name: 'Khalid Hassan',
    phone: '+971 50 XXX 9988',
    vehicle: 'Ford Transit Van',
    vehicleNumber: 'Abu Dhabi A 77889',
    rating: 4.9,
    status: 'available',
    location: 'Al Reem Island, Abu Dhabi',
    emirate: 'Abu Dhabi',
    completedToday: 11,
    avatar: 'KH',
  },
  {
    id: 'd6',
    name: 'Rania Malik',
    phone: '+971 54 XXX 3344',
    vehicle: 'Nissan Urvan Van',
    vehicleNumber: 'Dubai D 55667',
    rating: 4.8,
    status: 'available',
    location: 'Al Barsha, Dubai',
    emirate: 'Dubai',
    completedToday: 8,
    avatar: 'RM',
  },
];

export const ORDERS: Order[] = [
  {
    id: 'LK-AE-1024',
    customerId: 'c1',
    customerName: 'Humaid Al Mansoori',
    customerPhone: '+971 50 XXX 5566',
    services: ['Wash & Fold', 'Dry Cleaning'],
    items: [
      { name: 'Shirts', qty: 6 },
      { name: 'Trousers', qty: 3 },
      { name: 'Suit', qty: 1 },
      { name: 'Duvet', qty: 1 },
    ],
    pickupAddress: 'Apt 1204, Marina Heights, Dubai Marina, Dubai',
    deliveryAddress: 'Apt 1204, Marina Heights, Dubai Marina, Dubai',
    emirate: 'Dubai',
    pickupSlot: 'Today, 6:00 PM – 8:00 PM',
    deliveryEta: 'Tomorrow by 8:00 PM',
    status: 'pickup_assigned',
    driverId: 'd1',
    driverName: 'Ahmed Khan',
    amount: 145,
    paymentMethod: 'Pay on Delivery',
    paymentStatus: 'pending',
    notes: '',
    createdAt: '2024-01-15T14:30:00',
    updatedAt: '2024-01-15T14:45:00',
    facilityAssigned: 'Dubai Marina Facility',
    isB2B: false,
  },
  {
    id: 'LK-AE-1025',
    customerId: 'c2',
    customerName: 'Sarah Johnson',
    customerPhone: '+971 55 XXX 7788',
    services: ['Blankets & Duvets'],
    items: [
      { name: 'Duvet (King)', qty: 2 },
      { name: 'Pillows', qty: 4 },
    ],
    pickupAddress: 'Villa 23, Al Reem Street, Abu Dhabi',
    deliveryAddress: 'Villa 23, Al Reem Street, Abu Dhabi',
    emirate: 'Abu Dhabi',
    pickupSlot: 'Today, 10:00 AM – 12:00 PM',
    deliveryEta: 'Tomorrow by 6:00 PM',
    status: 'cleaning',
    driverId: 'd2',
    driverName: 'Fatima Noor',
    amount: 90,
    paymentMethod: 'Pay on Delivery',
    paymentStatus: 'pending',
    notes: 'Hypoallergenic detergent required',
    createdAt: '2024-01-15T09:00:00',
    updatedAt: '2024-01-15T12:30:00',
    facilityAssigned: 'Abu Dhabi Central Facility',
    isB2B: false,
  },
  {
    id: 'LK-AE-1026',
    customerId: 'b1',
    customerName: 'Jumeirah Grand Hotel',
    customerPhone: '+971 4 XXX 5500',
    services: ['Business Laundry'],
    items: [
      { name: 'Bed Linen Sets', qty: 120 },
      { name: 'Bath Towels', qty: 200 },
      { name: 'Table Cloths', qty: 80 },
    ],
    pickupAddress: 'Jumeirah Grand Hotel, Jumeirah Beach Road, Dubai',
    deliveryAddress: 'Jumeirah Grand Hotel, Jumeirah Beach Road, Dubai',
    emirate: 'Dubai',
    pickupSlot: 'Today, 7:00 AM – 9:00 AM',
    deliveryEta: 'Tomorrow by 6:00 AM',
    status: 'picked_up',
    driverId: 'd3',
    driverName: 'Team Driver 03',
    amount: 2800,
    paymentMethod: 'Monthly Invoice',
    paymentStatus: 'pending',
    notes: 'Priority client — use premium fragrance',
    createdAt: '2024-01-15T06:00:00',
    updatedAt: '2024-01-15T09:15:00',
    facilityAssigned: 'Jebel Ali Commercial Facility',
    isB2B: true,
  },
  {
    id: 'LK-AE-1023',
    customerId: 'c3',
    customerName: 'Omar Al Mansouri',
    customerPhone: '+971 52 XXX 1122',
    services: ['Dry Cleaning', 'Ironing & Pressing'],
    items: [
      { name: 'Suit', qty: 2 },
      { name: 'Dress Shirts', qty: 5 },
      { name: 'Kandura', qty: 3 },
    ],
    pickupAddress: 'Office 801, The Exchange, Business Bay, Dubai',
    deliveryAddress: 'Apt 3302, Burj Vista, Downtown Dubai',
    emirate: 'Dubai',
    pickupSlot: 'Yesterday, 2:00 PM – 4:00 PM',
    deliveryEta: 'Today by 2:00 PM',
    status: 'out_for_delivery',
    driverId: 'd2',
    driverName: 'Fatima Noor',
    amount: 210,
    paymentMethod: 'Card',
    paymentStatus: 'paid',
    notes: '',
    createdAt: '2024-01-14T13:00:00',
    updatedAt: '2024-01-15T13:45:00',
    facilityAssigned: 'Dubai Marina Facility',
    isB2B: false,
  },
  {
    id: 'LK-AE-1022',
    customerId: 'c4',
    customerName: 'Priya Nair',
    customerPhone: '+971 56 XXX 9900',
    services: ['Wash & Fold'],
    items: [
      { name: 'Mixed Clothing', qty: 8 },
      { name: 'Bedsheets', qty: 3 },
    ],
    pickupAddress: 'Apt 506, JVC District 15, JVC, Dubai',
    deliveryAddress: 'Apt 506, JVC District 15, JVC, Dubai',
    emirate: 'Dubai',
    pickupSlot: 'Yesterday, 4:00 PM – 6:00 PM',
    deliveryEta: 'Today by 4:00 PM',
    status: 'delivered',
    driverId: 'd6',
    driverName: 'Rania Malik',
    amount: 75,
    paymentMethod: 'Pay on Delivery',
    paymentStatus: 'paid',
    notes: '',
    createdAt: '2024-01-14T15:00:00',
    updatedAt: '2024-01-15T15:30:00',
    facilityAssigned: 'JVC Facility',
    isB2B: false,
  },
  {
    id: 'LK-AE-1021',
    customerId: 'c5',
    customerName: 'David Chen',
    customerPhone: '+971 50 XXX 4455',
    services: ['Curtains & Upholstery'],
    items: [
      { name: 'Curtain Panels', qty: 6 },
      { name: 'Sofa Cover', qty: 1 },
    ],
    pickupAddress: 'Villa 12, Al Barsha 2, Dubai',
    deliveryAddress: 'Villa 12, Al Barsha 2, Dubai',
    emirate: 'Dubai',
    pickupSlot: '2 days ago, 10:00 AM – 12:00 PM',
    deliveryEta: 'Yesterday by 8:00 PM',
    status: 'delivered',
    driverId: 'd1',
    driverName: 'Ahmed Khan',
    amount: 320,
    paymentMethod: 'Card',
    paymentStatus: 'paid',
    notes: '',
    createdAt: '2024-01-13T09:00:00',
    updatedAt: '2024-01-14T19:00:00',
    facilityAssigned: 'Al Barsha Facility',
    isB2B: false,
  },
];

export const CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Humaid Al Mansoori',
    phone: '+971 50 XXX 5566',
    email: 'humaid@email.com',
    emirate: 'Dubai',
    savedAddresses: ['Apt 1204, Marina Heights, Dubai Marina', 'Office 22, DIFC, Dubai'],
    ordersCount: 12,
    lastOrder: 'LK-AE-1024',
    status: 'vip',
    joinedAt: '2023-06-15',
    totalSpent: 1890,
  },
  {
    id: 'c2',
    name: 'Sarah Johnson',
    phone: '+971 55 XXX 7788',
    email: 'sarah.j@email.com',
    emirate: 'Abu Dhabi',
    savedAddresses: ['Villa 23, Al Reem Street, Abu Dhabi'],
    ordersCount: 5,
    lastOrder: 'LK-AE-1025',
    status: 'active',
    joinedAt: '2023-10-20',
    totalSpent: 540,
  },
  {
    id: 'c3',
    name: 'Omar Al Mansouri',
    phone: '+971 52 XXX 1122',
    email: 'omar.m@email.com',
    emirate: 'Dubai',
    savedAddresses: ['Office 801, Business Bay', 'Apt 3302, Downtown Dubai'],
    ordersCount: 28,
    lastOrder: 'LK-AE-1023',
    status: 'vip',
    joinedAt: '2023-02-10',
    totalSpent: 4200,
  },
  {
    id: 'c4',
    name: 'Priya Nair',
    phone: '+971 56 XXX 9900',
    email: 'priya.n@email.com',
    emirate: 'Dubai',
    savedAddresses: ['Apt 506, JVC District 15, Dubai'],
    ordersCount: 8,
    lastOrder: 'LK-AE-1022',
    status: 'active',
    joinedAt: '2023-08-05',
    totalSpent: 620,
  },
  {
    id: 'c5',
    name: 'David Chen',
    phone: '+971 50 XXX 4455',
    email: 'david.c@email.com',
    emirate: 'Dubai',
    savedAddresses: ['Villa 12, Al Barsha 2, Dubai'],
    ordersCount: 3,
    lastOrder: 'LK-AE-1021',
    status: 'active',
    joinedAt: '2023-12-01',
    totalSpent: 960,
  },
  {
    id: 'c6',
    name: 'Fatima Al Zaabi',
    phone: '+971 54 XXX 6677',
    email: 'fatima.z@email.com',
    emirate: 'Sharjah',
    savedAddresses: ['Apt 404, Al Mamzar, Sharjah'],
    ordersCount: 15,
    lastOrder: 'LK-AE-1018',
    status: 'vip',
    joinedAt: '2023-04-22',
    totalSpent: 2100,
  },
];

export const BUSINESS_CLIENTS: BusinessClient[] = [
  {
    id: 'b1',
    name: 'Jumeirah Grand Hotel',
    type: 'Hotel',
    emirate: 'Dubai',
    contactName: 'Mohammed Al Suwaidi',
    phone: '+971 4 XXX 5500',
    weeklyVolume: '2,400 kg',
    contractStatus: 'active',
    lastPickup: 'Today, 7:00 AM',
    outstandingInvoice: 8400,
    accountHealth: 'excellent',
    logo: 'JH',
  },
  {
    id: 'b2',
    name: 'Marina Restaurant Group',
    type: 'Restaurant',
    emirate: 'Dubai',
    contactName: 'Chef Rashid Karim',
    phone: '+971 4 XXX 8833',
    weeklyVolume: '180 kg',
    contractStatus: 'active',
    lastPickup: 'Yesterday, 9:00 AM',
    outstandingInvoice: 1200,
    accountHealth: 'good',
    logo: 'MR',
  },
  {
    id: 'b3',
    name: 'Al Barsha Medical Clinic',
    type: 'Clinic',
    emirate: 'Dubai',
    contactName: 'Dr. Nour Al Hassan',
    phone: '+971 4 XXX 2211',
    weeklyVolume: '120 kg',
    contractStatus: 'active',
    lastPickup: 'Today, 8:00 AM',
    outstandingInvoice: 0,
    accountHealth: 'excellent',
    logo: 'AM',
  },
  {
    id: 'b4',
    name: 'Fit Zone Gym & Spa',
    type: 'Gym & Spa',
    emirate: 'Dubai',
    contactName: 'Tariq Hussain',
    phone: '+971 4 XXX 7744',
    weeklyVolume: '240 kg',
    contractStatus: 'active',
    lastPickup: '2 days ago',
    outstandingInvoice: 960,
    accountHealth: 'good',
    logo: 'FZ',
  },
  {
    id: 'b5',
    name: 'Airbnb Hosts Network UAE',
    type: 'Hospitality',
    emirate: 'Multiple',
    contactName: 'Layla Ahmad',
    phone: '+971 55 XXX 3366',
    weeklyVolume: '350 kg',
    contractStatus: 'active',
    lastPickup: 'Today, 10:00 AM',
    outstandingInvoice: 2100,
    accountHealth: 'excellent',
    logo: 'AH',
  },
  {
    id: 'b6',
    name: 'Sharjah Corporate Towers',
    type: 'Corporate',
    emirate: 'Sharjah',
    contactName: 'Khalid Al Zarouni',
    phone: '+971 6 XXX 4400',
    weeklyVolume: '90 kg',
    contractStatus: 'pending',
    lastPickup: 'Last week',
    outstandingInvoice: 0,
    accountHealth: 'attention',
    logo: 'SC',
  },
];

export const SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Wash & Fold',
    description: 'Everyday clothing, linens, daily wear. Machine washed with premium detergents, dried and neatly folded.',
    turnaround: '24 hours',
    startingPrice: 'AED 8',
    priceUnit: 'per kg',
    icon: 'Shirt',
    type: 'wash_fold',
    popular: true,
  },
  {
    id: 's2',
    name: 'Dry Cleaning',
    description: 'Suits, gowns, delicate garments, woolen items. Expert dry cleaning with European-grade solvents.',
    turnaround: '24–48 hours',
    startingPrice: 'AED 15',
    priceUnit: 'per item',
    icon: 'Sparkles',
    type: 'dry_cleaning',
    popular: true,
  },
  {
    id: 's3',
    name: 'Ironing & Pressing',
    description: 'Crisp, professional finish for shirts, trousers, uniforms, and formal wear.',
    turnaround: '24 hours',
    startingPrice: 'AED 7',
    priceUnit: 'per item',
    icon: 'Zap',
    type: 'ironing',
    popular: false,
  },
  {
    id: 's4',
    name: 'Blankets & Duvets',
    description: 'Deep cleaning for comforters, duvets, blankets, and pillows. Fresh, hygienic, and fluffy results.',
    turnaround: '24–48 hours',
    startingPrice: 'AED 45',
    priceUnit: 'per item',
    icon: 'Wind',
    type: 'blankets_duvets',
    popular: false,
  },
  {
    id: 's5',
    name: 'Curtains & Upholstery',
    description: 'Home textile care for curtains, blinds, sofa covers, and cushion covers.',
    turnaround: '48–72 hours',
    startingPrice: 'AED 30',
    priceUnit: 'per panel',
    icon: 'Home',
    type: 'curtains_upholstery',
    popular: false,
  },
  {
    id: 's6',
    name: 'Business Laundry',
    description: 'Bulk laundry for hotels, restaurants, clinics, gyms, spas, and corporate clients. Custom pricing and SLA.',
    turnaround: 'Custom SLA',
    startingPrice: 'Custom',
    priceUnit: 'quote',
    icon: 'Building2',
    type: 'business_laundry',
    popular: false,
  },
];

export const AGENT_CONVERSATION: AgentMessage[] = [
  {
    id: 'm1',
    role: 'user',
    content: 'Hi, I need laundry pickup today.',
    timestamp: '2:28 PM',
    type: 'text',
  },
  {
    id: 'm2',
    role: 'agent',
    content: "Hi Humaid! Welcome to LaundryKhalas. I'm your AI booking assistant. Which service do you need today?",
    timestamp: '2:28 PM',
    type: 'options',
    options: ['Wash & Fold', 'Dry Cleaning', 'Ironing', 'Blankets / Duvets', 'Business Laundry'],
  },
  {
    id: 'm3',
    role: 'user',
    content: 'Wash and fold plus dry cleaning.',
    timestamp: '2:29 PM',
    type: 'text',
  },
  {
    id: 'm4',
    role: 'agent',
    content: 'Great choice! Please share the item details — what would you like us to collect?',
    timestamp: '2:29 PM',
    type: 'text',
  },
  {
    id: 'm5',
    role: 'user',
    content: '6 shirts, 3 trousers, 1 suit, and 1 duvet.',
    timestamp: '2:30 PM',
    type: 'text',
  },
  {
    id: 'm6',
    role: 'agent',
    content: 'Got it! Please confirm your pickup address.',
    timestamp: '2:30 PM',
    type: 'text',
  },
  {
    id: 'm7',
    role: 'user',
    content: 'Marina Heights, Dubai Marina.',
    timestamp: '2:31 PM',
    type: 'text',
  },
  {
    id: 'm8',
    role: 'agent',
    content: 'Perfect. I found your saved address:\n\nApartment 1204, Marina Heights, Dubai Marina, Dubai.\n\nWould you like pickup today between 6:00 PM and 8:00 PM?',
    timestamp: '2:31 PM',
    type: 'options',
    options: ['Yes, confirm pickup', 'Choose a different time', 'Change address'],
  },
  {
    id: 'm9',
    role: 'user',
    content: 'Yes.',
    timestamp: '2:32 PM',
    type: 'text',
  },
  {
    id: 'm10',
    role: 'agent',
    content: 'Your order has been created successfully! Here is your order summary:',
    timestamp: '2:32 PM',
    type: 'order_summary',
    orderData: {
      id: 'LK-AE-1024',
      services: ['Wash & Fold', 'Dry Cleaning'],
      items: [
        { name: 'Shirts', qty: 6 },
        { name: 'Trousers', qty: 3 },
        { name: 'Suit', qty: 1 },
        { name: 'Duvet', qty: 1 },
      ],
      pickupSlot: 'Today, 6:00 PM – 8:00 PM',
      deliveryEta: 'Tomorrow by 8:00 PM',
      paymentMethod: 'Pay on Delivery',
      status: 'created',
      amount: 145,
    },
  },
  {
    id: 'm11',
    role: 'agent',
    content: 'A driver has now been assigned to your order.',
    timestamp: '2:33 PM',
    type: 'driver_card',
    driverData: {
      name: 'Ahmed Khan',
      vehicle: 'Toyota Hiace Van',
      phone: '+971 50 XXX 1660',
      rating: 4.8,
      status: 'on_pickup',
      location: 'Dubai Marina',
    },
  },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Order Created',
  confirmed: 'Confirmed',
  pickup_assigned: 'Pickup Assigned',
  picked_up: 'Picked Up',
  cleaning: 'Cleaning in Progress',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const STATUS_CLASSES: Record<OrderStatus, string> = {
  created: 'status-pending',
  confirmed: 'status-assigned',
  pickup_assigned: 'status-assigned',
  picked_up: 'status-cleaning',
  cleaning: 'status-cleaning',
  ready_for_delivery: 'status-cleaning',
  out_for_delivery: 'status-delivery',
  delivered: 'status-delivered',
  cancelled: 'status-escalated',
};

export const UAE_EMIRATES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain',
];
