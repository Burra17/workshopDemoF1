import { Driver, Track } from './types';

export const DRIVERS: Driver[] = [
  // Red Bull Racing
  { id: 'verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', image: 'https://picsum.photos/seed/max/200/200' },
  { id: 'perez', name: 'Sergio Perez', team: 'Red Bull Racing', image: 'https://picsum.photos/seed/checo/200/200' },
  // Ferrari
  { id: 'leclerc', name: 'Charles Leclerc', team: 'Ferrari', image: 'https://picsum.photos/seed/charles/200/200' },
  { id: 'hamilton', name: 'Lewis Hamilton', team: 'Ferrari', image: 'https://picsum.photos/seed/lewis/200/200' },
  // McLaren
  { id: 'norris', name: 'Lando Norris', team: 'McLaren', image: 'https://picsum.photos/seed/lando/200/200' },
  { id: 'piastri', name: 'Oscar Piastri', team: 'McLaren', image: 'https://picsum.photos/seed/oscar/200/200' },
  // Mercedes
  { id: 'russell', name: 'George Russell', team: 'Mercedes', image: 'https://picsum.photos/seed/george/200/200' },
  { id: 'antonelli', name: 'Kimi Antonelli', team: 'Mercedes', image: 'https://picsum.photos/seed/kimi/200/200' },
  // Aston Martin
  { id: 'alonso', name: 'Fernando Alonso', team: 'Aston Martin', image: 'https://picsum.photos/seed/nando/200/200' },
  { id: 'stroll', name: 'Lance Stroll', team: 'Aston Martin', image: 'https://picsum.photos/seed/lance/200/200' },
  // Williams
  { id: 'albon', name: 'Alex Albon', team: 'Williams', image: 'https://picsum.photos/seed/alex/200/200' },
  { id: 'sainz', name: 'Carlos Sainz', team: 'Williams', image: 'https://picsum.photos/seed/carlos/200/200' },
  // Alpine
  { id: 'gasly', name: 'Pierre Gasly', team: 'Alpine', image: 'https://picsum.photos/seed/pierre/200/200' },
  { id: 'doohan', name: 'Jack Doohan', team: 'Alpine', image: 'https://picsum.photos/seed/jack/200/200' },
  // RB
  { id: 'tsunoda', name: 'Yuki Tsunoda', team: 'RB', image: 'https://picsum.photos/seed/yuki/200/200' },
  { id: 'lawson', name: 'Liam Lawson', team: 'RB', image: 'https://picsum.photos/seed/liam/200/200' },
  // Haas
  { id: 'ocon', name: 'Esteban Ocon', team: 'Haas', image: 'https://picsum.photos/seed/esteban/200/200' },
  { id: 'bearman', name: 'Oliver Bearman', team: 'Haas', image: 'https://picsum.photos/seed/ollie/200/200' },
  // Sauber
  { id: 'hulkenberg', name: 'Nico Hulkenberg', team: 'Sauber', image: 'https://picsum.photos/seed/nico/200/200' },
  { id: 'bortoleto', name: 'Gabriel Bortoleto', team: 'Sauber', image: 'https://picsum.photos/seed/gabriel/200/200' },
];

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