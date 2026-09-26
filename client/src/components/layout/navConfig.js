import {
  House, Compass, Map, Gem, TrendingUp, LocateFixed, Navigation, Route, Sparkles, Utensils, BedDouble, CalendarDays,
  ShoppingBag, Clapperboard, Trees, Heart, Luggage, User, Siren, Info, Leaf,
} from 'lucide-react';

/** Single source of truth for site navigation (drawer + footer). Admin is intentionally absent. */
export const NAV_SECTIONS = [
  {
    key: 'sectionExplore',
    items: [
      { to: '/', key: 'home', icon: House, end: true },
      { to: '/explore', key: 'discover', icon: Compass },
      { to: '/districts', key: 'districts', icon: Map },
      { to: '/hidden-gems', key: 'hiddenGems', icon: Gem },
      { to: '/trending', key: 'trending', icon: TrendingUp },
    ],
  },
  {
    key: 'sectionTravel',
    items: [
      { to: '/near-me', key: 'nearMe', icon: LocateFixed },
      { to: '/directions', key: 'directions', icon: Navigation, end: true },
      { to: '/directions?mode=plan', key: 'routePlanner', icon: Route },
      { to: '/trip-builder', key: 'aiPlanner', icon: Sparkles },
    ],
  },
  {
    key: 'sectionMore',
    items: [
      { to: '/food', key: 'food', icon: Utensils },
      { to: '/stays', key: 'stays', icon: BedDouble },
      { to: '/events', key: 'events', icon: CalendarDays },
      { to: '/shopping', key: 'shopping', icon: ShoppingBag },
      { to: '/theatres', key: 'theatres', icon: Clapperboard },
      { to: '/activities', key: 'activities', icon: Trees },
    ],
  },
  {
    key: 'sectionPersonal',
    items: [
      { to: '/saved', key: 'savedPlaces', icon: Heart, end: true },
      { to: '/saved?tab=trips', key: 'savedTrips', icon: Luggage },
      { to: '/account', key: 'myAccount', icon: User },
    ],
  },
  {
    key: 'sectionHelp',
    items: [
      { to: '/help', key: 'emergencyAssistance', icon: Siren, tone: 'alert' },
      { to: '/travel-info', key: 'travelInfo', icon: Info },
      { to: '/about', key: 'about', icon: Leaf },
    ],
  },
];
