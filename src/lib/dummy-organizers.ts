// Dummy organizer data — replace with real Payload queries once EO accounts exist

export type DummyOrganizer = {
  id: string
  name: string
  username: string
  avatar: string | null
  avatarColor: string
  bio: string
  longBio: string
  followersCount: number
  upcomingEvents: number
  totalEvents: number
  city: string[]
  categories: string[]
  isVerified: boolean
  website: string | null
  instagram: string | null
  twitter: string | null
  founded: string
  coverImage: string | null
  gallery: string[]
  pastEvents: DummyEvent[]
  upcomingEventsList: DummyEvent[]
}

export type DummyEvent = {
  id: string
  title: string
  date: string
  location: string
  image: string
  price: string
  category: string
  attendees: number
}

export const DUMMY_ORGANIZERS: DummyOrganizer[] = [
  {
    id: 'eo-1',
    name: 'Soundwave Productions',
    username: 'soundwave.id',
    avatar:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=160&h=160&fit=crop&q=80',
    avatarColor: '#5151eb',
    bio: 'Concerts & music festivals across Indonesia',
    longBio:
      'Soundwave Productions is a leading music promoter that has delivered over 200 concerts and festivals since 2015. We partner with local and international artists to create unforgettable music experiences across Indonesia.',
    followersCount: 48200,
    upcomingEvents: 5,
    totalEvents: 87,
    city: ['jakarta', 'bandung', 'surabaya'],
    categories: ['Music', 'Nightlife'],
    isVerified: true,
    website: 'https://soundwave.id',
    instagram: '@soundwave.id',
    twitter: '@soundwaveid',
    founded: '2015',
    coverImage:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501386761578-eaa54b4e9f4e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-1',
        title: 'Jakarta Music Fest 2025',
        date: '2025-11-15',
        location: 'GBK, Jakarta',
        image: 'https://images.unsplash.com/photo-1501386761578-eaa54b4e9f4e?w=400&h=240&fit=crop',
        price: 'Rp 350.000',
        category: 'Music',
        attendees: 12000,
      },
      {
        id: 'pe-2',
        title: 'Soundwave Bandung Night',
        date: '2025-09-20',
        location: 'Sabuga, Bandung',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=240&fit=crop',
        price: 'Rp 200.000',
        category: 'Music',
        attendees: 5000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-1',
        title: 'Surabaya Sound Festival',
        date: '2026-07-12',
        location: 'Gelora Bung Tomo, Surabaya',
        image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=240&fit=crop',
        price: 'Rp 400.000',
        category: 'Music',
        attendees: 0,
      },
      {
        id: 'ue-2',
        title: 'Indie Night Jakarta',
        date: '2026-08-03',
        location: 'Istora Senayan, Jakarta',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=240&fit=crop',
        price: 'Rp 150.000',
        category: 'Nightlife',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-2',
    name: 'Bali Arts Collective',
    username: 'baliarts.id',
    avatar:
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=160&h=160&fit=crop&q=80',
    avatarColor: '#f59e0b',
    bio: 'Art exhibitions & cultural performances in Bali',
    longBio:
      'Bali Arts Collective is a community of artists and curators dedicated to preserving and promoting Balinese art and culture. From contemporary painting exhibitions to traditional dance performances, we deliver authentic artistic experiences.',
    followersCount: 31500,
    upcomingEvents: 3,
    totalEvents: 54,
    city: ['bali', 'denpasar', 'ubud'],
    categories: ['Arts', 'Holidays'],
    isVerified: true,
    website: 'https://baliarts.id',
    instagram: '@baliarts.id',
    twitter: null,
    founded: '2017',
    coverImage:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-3',
        title: 'Ubud Art Week 2025',
        date: '2025-10-05',
        location: 'Ubud Palace, Bali',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Arts',
        attendees: 3200,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-3',
        title: 'Bali Cultural Night 2026',
        date: '2026-09-14',
        location: 'Tanah Lot, Bali',
        image: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=240&fit=crop',
        price: 'Rp 100.000',
        category: 'Arts',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-3',
    name: 'TechHub Jakarta',
    username: 'techhub.jkt',
    avatar: null,
    avatarColor: '#10b981',
    bio: 'Tech conferences & startup events in Indonesia',
    longBio:
      'TechHub Jakarta is a tech community platform connecting developers, founders, and investors. We organise conferences, hackathons, and workshops that drive digital innovation across Indonesia.',
    followersCount: 27800,
    upcomingEvents: 4,
    totalEvents: 62,
    city: ['jakarta', 'tangerang', 'depok'],
    categories: ['Business', 'Hobbies'],
    isVerified: true,
    website: 'https://techhub.id',
    instagram: '@techhub.jkt',
    twitter: '@techhubjkt',
    founded: '2018',
    coverImage:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-4',
        title: 'Indonesia Tech Summit 2025',
        date: '2025-08-22',
        location: 'JCC, Jakarta',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=240&fit=crop',
        price: 'Rp 500.000',
        category: 'Business',
        attendees: 4500,
      },
      {
        id: 'pe-5',
        title: 'Startup Pitch Night',
        date: '2025-06-10',
        location: 'WeWork Sudirman, Jakarta',
        image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Business',
        attendees: 800,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-4',
        title: 'AI & Future of Work 2026',
        date: '2026-06-20',
        location: 'Pullman Jakarta, Jakarta',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=240&fit=crop',
        price: 'Rp 750.000',
        category: 'Business',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-4',
    name: 'Jogja Food Festival',
    username: 'jogjafoodfest',
    avatar: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=160&h=160&fit=crop&q=80',
    avatarColor: '#ef4444',
    bio: 'Culinary festivals & street food in Yogyakarta',
    longBio:
      'Jogja Food Festival brings the best culinary experiences from Yogyakarta and beyond. From legendary gudeg to modern street food, we celebrate the richness of Javanese flavours at every event.',
    followersCount: 19400,
    upcomingEvents: 2,
    totalEvents: 28,
    city: ['yogyakarta', 'jogja', 'solo'],
    categories: ['Food & Drink', 'Holidays'],
    isVerified: false,
    website: null,
    instagram: '@jogjafoodfest',
    twitter: null,
    founded: '2019',
    coverImage:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-6',
        title: 'Jogja Culinary Week 2025',
        date: '2025-12-01',
        location: 'Alun-Alun Kidul, Yogyakarta',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Food & Drink',
        attendees: 8000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-5',
        title: 'Street Food Jogja 2026',
        date: '2026-07-25',
        location: 'Malioboro, Yogyakarta',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Food & Drink',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-5',
    name: 'Surabaya Run Club',
    username: 'sby.runclub',
    avatar: null,
    avatarColor: '#8b5cf6',
    bio: 'Running & community sports events in Surabaya',
    longBio:
      'Surabaya Run Club is the largest running community in East Java with over 14,000 active members. We organise fun runs, half marathons, and community sports events every month.',
    followersCount: 14200,
    upcomingEvents: 6,
    totalEvents: 45,
    city: ['surabaya', 'sidoarjo', 'gresik'],
    categories: ['Hobbies', 'Dating'],
    isVerified: false,
    website: 'https://sbyrunclub.com',
    instagram: '@sby.runclub',
    twitter: '@sbyrunclub',
    founded: '2020',
    coverImage:
      'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-7',
        title: 'Surabaya Half Marathon 2025',
        date: '2025-10-12',
        location: 'Taman Bungkul, Surabaya',
        image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=240&fit=crop',
        price: 'Rp 150.000',
        category: 'Hobbies',
        attendees: 2500,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-6',
        title: 'Fun Run Surabaya 5K',
        date: '2026-06-07',
        location: 'Kenjeran Park, Surabaya',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=240&fit=crop',
        price: 'Rp 75.000',
        category: 'Hobbies',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-6',
    name: 'Medan Creative Hub',
    username: 'medancreative',
    avatar:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=160&h=160&fit=crop&q=80',
    avatarColor: '#f97316',
    bio: 'Creative workshops & art exhibitions in Medan',
    longBio:
      'Medan Creative Hub is a collaboration space for artists, designers, and content creators in North Sumatra. We run workshops, exhibitions, and networking events to grow the local creative ecosystem.',
    followersCount: 11600,
    upcomingEvents: 3,
    totalEvents: 31,
    city: ['medan', 'deli serdang'],
    categories: ['Arts', 'Business'],
    isVerified: false,
    website: 'https://medancreative.id',
    instagram: '@medancreative',
    twitter: null,
    founded: '2021',
    coverImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'],
    pastEvents: [
      {
        id: 'pe-8',
        title: 'Medan Design Week',
        date: '2025-09-08',
        location: 'Sun Plaza, Medan',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=240&fit=crop',
        price: 'Rp 50.000',
        category: 'Arts',
        attendees: 1200,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-7',
        title: 'Creative Workshop Medan',
        date: '2026-07-18',
        location: 'Gedung Johor, Medan',
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=240&fit=crop',
        price: 'Rp 100.000',
        category: 'Arts',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-7',
    name: 'Makassar Night Events',
    username: 'mksr.nights',
    avatar: null,
    avatarColor: '#ec4899',
    bio: 'Nightlife & concerts in Makassar',
    longBio:
      'Makassar Night Events specialises in bringing premium nightlife entertainment to South Sulawesi. From national artist concerts to international DJ nights, we make every evening a memory.',
    followersCount: 9800,
    upcomingEvents: 4,
    totalEvents: 38,
    city: ['makassar', 'gowa'],
    categories: ['Nightlife', 'Music'],
    isVerified: false,
    website: null,
    instagram: '@mksr.nights',
    twitter: '@mksrnights',
    founded: '2020',
    coverImage:
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-9',
        title: 'Makassar DJ Night',
        date: '2025-11-28',
        location: 'Fort Rotterdam, Makassar',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=240&fit=crop',
        price: 'Rp 200.000',
        category: 'Nightlife',
        attendees: 3000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-8',
        title: 'Makassar Music Night',
        date: '2026-08-22',
        location: 'Trans Studio, Makassar',
        image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400&h=240&fit=crop',
        price: 'Rp 250.000',
        category: 'Music',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-8',
    name: 'Bandung Indie Scene',
    username: 'bdg.indie',
    avatar:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=160&h=160&fit=crop&q=80',
    avatarColor: '#06b6d4',
    bio: 'Indie & underground music scene in Bandung',
    longBio:
      "Bandung Indie Scene is home to Bandung's indie and underground musicians. We host showcases, album launches, and festivals that support the growth of Indonesia's independent music scene.",
    followersCount: 22300,
    upcomingEvents: 7,
    totalEvents: 73,
    city: ['bandung', 'cimahi'],
    categories: ['Music', 'Arts'],
    isVerified: true,
    website: 'https://bdgindie.com',
    instagram: '@bdg.indie',
    twitter: '@bdgindie',
    founded: '2016',
    coverImage:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-10',
        title: 'Bandung Indie Fest 2025',
        date: '2025-10-25',
        location: 'Lapangan Gasibu, Bandung',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=240&fit=crop',
        price: 'Rp 100.000',
        category: 'Music',
        attendees: 6000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-9',
        title: 'Indie Showcase Bandung',
        date: '2026-06-14',
        location: 'Braga City Walk, Bandung',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=240&fit=crop',
        price: 'Rp 75.000',
        category: 'Music',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-9',
    name: 'Semarang Expo Center',
    username: 'smg.expo',
    avatar: null,
    avatarColor: '#0ea5e9',
    bio: 'Trade fairs & business expos in Semarang',
    longBio:
      'Semarang Expo Center is the largest trade fair and business expo organiser in Central Java. We connect local businesses with wider markets through high-quality events.',
    followersCount: 8400,
    upcomingEvents: 2,
    totalEvents: 22,
    city: ['semarang', 'demak'],
    categories: ['Business'],
    isVerified: false,
    website: 'https://smgexpo.id',
    instagram: '@smg.expo',
    twitter: null,
    founded: '2019',
    coverImage:
      'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&h=400&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=300&fit=crop'],
    pastEvents: [
      {
        id: 'pe-11',
        title: 'Semarang Business Expo 2025',
        date: '2025-07-15',
        location: 'PRPP, Semarang',
        image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=240&fit=crop',
        price: 'Rp 50.000',
        category: 'Business',
        attendees: 5000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-10',
        title: 'UMKM Expo Semarang 2026',
        date: '2026-09-05',
        location: 'Marina Convention, Semarang',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Business',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-10',
    name: 'Palembang Heritage',
    username: 'plmbg.heritage',
    avatar: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=160&h=160&fit=crop&q=80',
    avatarColor: '#d97706',
    bio: 'Cultural festivals & heritage events in Palembang',
    longBio:
      'Palembang Heritage brings the rich culture of South Sumatra to the national stage. From pempek festivals to traditional dance performances, we keep ancestral heritage alive and relevant.',
    followersCount: 7200,
    upcomingEvents: 1,
    totalEvents: 18,
    city: ['palembang', 'banyuasin'],
    categories: ['Holidays', 'Arts'],
    isVerified: false,
    website: null,
    instagram: '@plmbg.heritage',
    twitter: null,
    founded: '2021',
    coverImage:
      'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=1200&h=400&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=400&h=300&fit=crop'],
    pastEvents: [
      {
        id: 'pe-12',
        title: 'Festival Pempek 2025',
        date: '2025-08-17',
        location: 'Benteng Kuto Besak, Palembang',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Holidays',
        attendees: 10000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-11',
        title: 'Sriwijaya Cultural Fest',
        date: '2026-08-17',
        location: 'Jakabaring, Palembang',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Arts',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-11',
    name: 'Lombok Surf & Sport',
    username: 'lombok.surf',
    avatar: null,
    avatarColor: '#14b8a6',
    bio: 'Surfing competitions & beach sports in Lombok',
    longBio:
      "Lombok Surf & Sport organises surfing competitions, beach volleyball, and water sports on Lombok's finest beaches. We support local athletes and attract visitors through world-class sporting events.",
    followersCount: 13500,
    upcomingEvents: 3,
    totalEvents: 29,
    city: ['lombok', 'mataram', 'senggigi'],
    categories: ['Hobbies'],
    isVerified: false,
    website: 'https://lomboksurf.id',
    instagram: '@lombok.surf',
    twitter: '@lomboksurf',
    founded: '2018',
    coverImage:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-13',
        title: 'Lombok Surf Championship 2025',
        date: '2025-09-01',
        location: 'Pantai Kuta, Lombok',
        image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=240&fit=crop',
        price: 'Rp 50.000',
        category: 'Hobbies',
        attendees: 2000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-12',
        title: 'Beach Games Lombok 2026',
        date: '2026-07-04',
        location: 'Pantai Senggigi, Lombok',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=240&fit=crop',
        price: 'Rp 100.000',
        category: 'Hobbies',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-12',
    name: 'Kalimantan Green Fest',
    username: 'kaltim.green',
    avatar:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=160&h=160&fit=crop&q=80',
    avatarColor: '#22c55e',
    bio: 'Environmental & nature festivals in Kalimantan',
    longBio:
      'Kalimantan Green Fest raises environmental and forest conservation awareness through festivals, seminars, and real action. We believe environmental consciousness can be built through fun and educational events.',
    followersCount: 6800,
    upcomingEvents: 2,
    totalEvents: 15,
    city: ['balikpapan', 'samarinda', 'banjarmasin'],
    categories: ['Hobbies', 'Holidays'],
    isVerified: false,
    website: 'https://kaltimgreen.id',
    instagram: '@kaltim.green',
    twitter: null,
    founded: '2022',
    coverImage:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'],
    pastEvents: [
      {
        id: 'pe-14',
        title: 'Green Earth Fest Balikpapan',
        date: '2025-06-05',
        location: 'Pantai Melawai, Balikpapan',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Hobbies',
        attendees: 3500,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-13',
        title: 'Borneo Nature Festival 2026',
        date: '2026-06-05',
        location: 'Taman Hutan Raya, Balikpapan',
        image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=240&fit=crop',
        price: 'Rp 25.000',
        category: 'Holidays',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-13',
    name: 'Manado Dive & Sea',
    username: 'manado.dive',
    avatar: null,
    avatarColor: '#0284c7',
    bio: 'Diving & marine tourism events in Manado',
    longBio:
      'Manado Dive & Sea organises diving, snorkelling, and marine tourism events in the waters of North Sulawesi, renowned for their extraordinary marine biodiversity. We partner with local dive centres for the best experience.',
    followersCount: 5600,
    upcomingEvents: 2,
    totalEvents: 20,
    city: ['manado', 'bitung', 'bunaken'],
    categories: ['Hobbies'],
    isVerified: false,
    website: 'https://manadodive.id',
    instagram: '@manado.dive',
    twitter: null,
    founded: '2020',
    coverImage:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=400&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'],
    pastEvents: [
      {
        id: 'pe-15',
        title: 'Bunaken Dive Fest 2025',
        date: '2025-07-20',
        location: 'Bunaken, Manado',
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=240&fit=crop',
        price: 'Rp 300.000',
        category: 'Hobbies',
        attendees: 500,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-14',
        title: 'Coral Reef Dive Trip 2026',
        date: '2026-08-10',
        location: 'Bunaken Marine Park, Manado',
        image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=400&h=240&fit=crop',
        price: 'Rp 450.000',
        category: 'Hobbies',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-14',
    name: 'Yogya Comedy Club',
    username: 'yogya.comedy',
    avatar:
      'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=160&h=160&fit=crop&q=80',
    avatarColor: '#eab308',
    bio: 'Stand-up comedy & entertainment in Yogyakarta',
    longBio:
      'Yogya Comedy Club is the home of stand-up comedy in Yogyakarta. We bring local and national comedians to weekly shows, open mics, and comedy festivals that entertain all ages.',
    followersCount: 16700,
    upcomingEvents: 8,
    totalEvents: 95,
    city: ['yogyakarta', 'jogja'],
    categories: ['Nightlife', 'Hobbies'],
    isVerified: true,
    website: 'https://yogyacomedy.id',
    instagram: '@yogya.comedy',
    twitter: '@yogyacomedy',
    founded: '2017',
    coverImage:
      'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1200&h=400&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400&h=300&fit=crop',
    ],
    pastEvents: [
      {
        id: 'pe-16',
        title: 'Jogja Comedy Fest 2025',
        date: '2025-11-01',
        location: 'Societet Militair, Yogyakarta',
        image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=240&fit=crop',
        price: 'Rp 125.000',
        category: 'Nightlife',
        attendees: 1500,
      },
      {
        id: 'pe-17',
        title: 'Open Mic Night #48',
        date: '2025-10-15',
        location: 'Kedai Kebun, Yogyakarta',
        image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400&h=240&fit=crop',
        price: 'Rp 50.000',
        category: 'Hobbies',
        attendees: 200,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-15',
        title: 'Stand-Up Special: Raditya Dika',
        date: '2026-06-28',
        location: 'Taman Budaya, Yogyakarta',
        image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=400&h=240&fit=crop',
        price: 'Rp 200.000',
        category: 'Nightlife',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-15',
    name: 'Pekanbaru Wedding Expo',
    username: 'pkb.wedding',
    avatar: null,
    avatarColor: '#f43f5e',
    bio: 'Wedding expos & bridal fairs in Pekanbaru',
    longBio:
      'Pekanbaru Wedding Expo connects couples-to-be with the best wedding vendors in Riau. From décor to catering, we bring everything you need for your special day under one roof.',
    followersCount: 4900,
    upcomingEvents: 1,
    totalEvents: 12,
    city: ['pekanbaru', 'riau'],
    categories: ['Dating', 'Holidays'],
    isVerified: false,
    website: null,
    instagram: '@pkb.wedding',
    twitter: null,
    founded: '2022',
    coverImage:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop'],
    pastEvents: [
      {
        id: 'pe-18',
        title: 'Pekanbaru Wedding Fair 2025',
        date: '2025-05-10',
        location: 'SKA Mall, Pekanbaru',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Dating',
        attendees: 4000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-16',
        title: 'Bridal Expo Pekanbaru 2026',
        date: '2026-05-09',
        location: 'Mal Pekanbaru, Pekanbaru',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Dating',
        attendees: 0,
      },
    ],
  },
  {
    id: 'eo-16',
    name: 'Aceh Cultural Society',
    username: 'aceh.culture',
    avatar:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=160&h=160&fit=crop&q=80',
    avatarColor: '#16a34a',
    bio: 'Cultural festivals & Acehnese traditions',
    longBio:
      'Aceh Cultural Society preserves and promotes the rich culture of Aceh through festivals, art performances, and exhibitions. We are proud to bring the traditions of the Veranda of Mecca to national and international stages.',
    followersCount: 8100,
    upcomingEvents: 2,
    totalEvents: 24,
    city: ['banda aceh', 'aceh besar'],
    categories: ['Holidays', 'Arts'],
    isVerified: false,
    website: 'https://acehculture.id',
    instagram: '@aceh.culture',
    twitter: null,
    founded: '2019',
    coverImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop&q=80',
    gallery: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'],
    pastEvents: [
      {
        id: 'pe-19',
        title: 'Pekan Kebudayaan Aceh 2025',
        date: '2025-08-05',
        location: 'Taman Sari, Banda Aceh',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Holidays',
        attendees: 7000,
      },
    ],
    upcomingEventsList: [
      {
        id: 'ue-17',
        title: 'Festival Saman 2026',
        date: '2026-08-17',
        location: 'Lapangan Blang Padang, Banda Aceh',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=240&fit=crop',
        price: 'Free',
        category: 'Arts',
        attendees: 0,
      },
    ],
  },
]

/**
 * Get organizers relevant to a city slug.
 * Falls back to top organizers by followers if no city match.
 */
export function getOrganizersByCity(citySlug: string, limit = 5): DummyOrganizer[] {
  const normalized = citySlug.toLowerCase().replace(/-/g, ' ')
  const matched = DUMMY_ORGANIZERS.filter((o) =>
    o.city.some((c) => c.includes(normalized) || normalized.includes(c)),
  )
  if (matched.length >= 2) {
    return matched.slice(0, limit)
  }
  return [...DUMMY_ORGANIZERS].sort((a, b) => b.followersCount - a.followersCount).slice(0, limit)
}

export function getDummyOrganizerById(id: string): DummyOrganizer | undefined {
  return DUMMY_ORGANIZERS.find((o) => o.id === id)
}

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}rb`
  return String(n)
}
