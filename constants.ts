import { Track } from './types';

// Drivers are now fetched dynamically from OpenF1 in App.tsx to ensure accuracy.
// const DRIVERS = [...] removed.

export const TRACKS: Track[] = [
  { id: 'melbourne', name: 'Albert Park', location: 'Australia', image: 'https://picsum.photos/seed/aus/400/200' },
  { id: 'shanghai', name: 'Shanghai Int. Circuit', location: 'China', image: 'https://picsum.photos/seed/china/400/200' },
  { id: 'suzuka', name: 'Suzuka', location: 'Japan', image: 'https://picsum.photos/seed/suzuka/400/200' },
  { id: 'bahrain', name: 'Bahrain Int. Circuit', location: 'Bahrain', image: 'https://picsum.photos/seed/bahrain/400/200' },
  { id: 'jeddah', name: 'Jeddah Corniche', location: 'Saudi Arabia', image: 'https://picsum.photos/seed/ksa/400/200' },
  { id: 'miami', name: 'Miami Int. Autodrome', location: 'USA', image: 'https://picsum.photos/seed/miami/400/200' },
  { id: 'imola', name: 'Imola', location: 'Italy', image: 'https://picsum.photos/seed/imola/400/200' },
  { id: 'monaco', name: 'Monaco', location: 'Monaco', image: 'https://picsum.photos/seed/monaco/400/200' },
  { id: 'barcelona', name: 'Catalunya', location: 'Spain', image: 'https://picsum.photos/seed/spain/400/200' },
  { id: 'montreal', name: 'Gilles Villeneuve', location: 'Canada', image: 'https://picsum.photos/seed/canada/400/200' },
  { id: 'austria', name: 'Red Bull Ring', location: 'Austria', image: 'https://picsum.photos/seed/austria/400/200' },
  { id: 'silverstone', name: 'Silverstone', location: 'UK', image: 'https://picsum.photos/seed/silver/400/200' },
  { id: 'spa', name: 'Spa-Francorchamps', location: 'Belgium', image: 'https://picsum.photos/seed/spa/400/200' },
  { id: 'hungary', name: 'Hungaroring', location: 'Hungary', image: 'https://picsum.photos/seed/hun/400/200' },
  { id: 'zandvoort', name: 'Zandvoort', location: 'Netherlands', image: 'https://picsum.photos/seed/dutch/400/200' },
  { id: 'monza', name: 'Monza', location: 'Italy', image: 'https://picsum.photos/seed/monza/400/200' },
  { id: 'baku', name: 'Baku City Circuit', location: 'Azerbaijan', image: 'https://picsum.photos/seed/baku/400/200' },
  { id: 'singapore', name: 'Marina Bay', location: 'Singapore', image: 'https://picsum.photos/seed/singapore/400/200' },
  { id: 'austin', name: 'COTA', location: 'USA', image: 'https://picsum.photos/seed/austin/400/200' },
  { id: 'mexico', name: 'Autodromo Hermanos Rodriguez', location: 'Mexico', image: 'https://picsum.photos/seed/mexico/400/200' },
  { id: 'brazil', name: 'Interlagos', location: 'Brazil', image: 'https://picsum.photos/seed/brazil/400/200' },
  { id: 'vegas', name: 'Las Vegas Strip', location: 'USA', image: 'https://picsum.photos/seed/vegas/400/200' },
  { id: 'qatar', name: 'Lusail', location: 'Qatar', image: 'https://picsum.photos/seed/qatar/400/200' },
  { id: 'abudhabi', name: 'Yas Marina', location: 'UAE', image: 'https://picsum.photos/seed/uae/400/200' },
];