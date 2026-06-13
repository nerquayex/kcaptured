export interface Service {
  id: string;
  category: 'lifestyle' | 'studio' | 'event';
  name: string;
  duration: string;
  price: number;
  features: string[];
  sampleUrl?: string;
}

export const services: Service[] = [
  {
    id: '1',
    category: 'lifestyle',
    name: 'Basic KC Lifestyle',
    duration: '30 min',
    price: 100,
    sampleUrl: 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773807338/32-1Z7A1257__2_shyxak.jpg',
    features: [
      '30-minute shoot at one location',
      '3 retouched pictures',
      'All raws included',
    ],
  },
  {
    id: '2',
    category: 'lifestyle',
    name: 'Deluxe KC Lifestyle',
    duration: '1 hr',
    price: 180,
    sampleUrl: 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1781359745/deluxe-lifestyle_yfd1dm.jpg',
    features: [
      '1-hour shoot at one location',
      '7 retouched pictures',
      'All raws included',
    ],
  },
  {
    id: '3',
    category: 'lifestyle',
    name: 'Premium KC Lifestyle',
    duration: '1 hr 30 min',
    price: 200,
    sampleUrl: 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1781359745/premium-lifestyle_oqrz5y.jpg',
    features: [
      '1.5-hour shoot at 2 locations if opted',
      '12 retouched pictures',
      'All raws included',
    ],
  },
  {
    id: '4',
    category: 'studio',
    name: 'Basic KC Studio',
    duration: '1 hr',
    price: 200,
    sampleUrl: 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1781263118/IMG_5187_hdozar.jpg',
    features: [
      '1-hour shoot with one outfit',
      '5 retouched pictures',
      'All raws included',
    ],
  },
  {
    id: '5',
    category: 'studio',
    name: 'Deluxe KC Studio',
    duration: '1 hr 30 min',
    price: 270,
    sampleUrl: 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1781359746/deluxe-studio_itcu4h.jpg',
    features: [
      '1.5-hour shoot with 2 outfits if opted',
      '10 retouched pictures',
      'All raws included',
    ],
  },
  {
    id: '6',
    category: 'studio',
    name: 'Premium KC Studio',
    duration: '2 hr',
    price: 320,
    sampleUrl: 'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1781359746/premium-studio_xxzj00.jpg',
    features: [
      '2-hour shoot with 3 outfits if opted',
      '17 retouched pictures',
      'All raws included',
    ],
  },
  // EVENT SERVICES
  {
    id: '7',
    category: 'event',
    name: 'Basic KC Event',
    duration: '1 hr',
    price: 250,
    features: [
      'Applicable for events such as birthday parties, baby showers, private dinner and more.',
      'All images color grades (no heavy edits)',
      'All raws included',
      '4-6 day turnaround',
      'Custom link for client and guests',
    ],
    sampleUrl:
      'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773807338/32-1Z7A1257__2_shyxak.jpg',
  },
  {
    id: '8',
    category: 'event',
    name: 'Deluxe KC Event',
    duration: '3 hr',
    price: 500,
    features: [
      'Applicable for events such as birthday parties, baby showers, private dinner and more.',
      'All images color grades (special edits if selected)',
      'All raws included',
      '4-6 day turnaround',
      'Custom link for client and guests',
    ],
    sampleUrl:
      'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773807339/33-1Z7A1348__2_f8w7em.jpg',
  },
  {
    id: '9',
    category: 'event',
    name: 'Premium KC Event',
    duration: '5 hr',
    price: 700,
    features: [
      'Applicable for events such as birthday parties, baby showers, private dinner and more.',
      'All images color grades (special edits if selected)',
      'All raws included',
      '4-6 day turnaround',
      'Custom link for client and guests',
    ],
    sampleUrl:
      'https://res.cloudinary.com/dq4tkpuu4/image/upload/v1773807344/43-1Z7A1338__2_uyue1r.jpg',
  },
];
