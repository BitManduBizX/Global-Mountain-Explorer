export interface Mountain {
  id: string;
  name: string;
  localName?: string;
  elevationM: number;
  elevationFt: number;
  prominenceM?: number;
  range: string;
  country: string[];
  continent: 'Asia' | 'South America' | 'North America' | 'Africa' | 'Europe' | 'Antarctica' | 'Oceania';
  coordinates: {
    lat: number;
    lng: number;
  };
  isEightThousander?: boolean;
  isSevenSummit?: boolean;
  isPopular?: boolean;
  difficulty: 'Walk-up / Trek' | 'Scramble' | 'Technical Alpine' | 'Extreme High-Altitude (Death Zone)';
  bestClimbingMonths: string[];
  firstAscent: {
    year: number;
    climbers: string;
  };
  permitRequirements: string;
  estimatedBudgetUSD: {
    low: number;
    high: number;
  };
  description: string;
  highlights: string[];
  standardRoute: string;
  imageUrl?: string;
}

export interface MountainRange {
  id: string;
  name: string;
  lengthKm: number;
  highestPeak: string;
  highestElevationM: number;
  continents: string[];
  countries: string[];
  majorRivers: string[];
  pathCoordinates: Array<{ lat: number; lng: number }>;
  description: string;
}

export interface MajorRiver {
  id: string;
  name: string;
  sourceRange: string;
  lengthKm: number;
  countries: string[];
  coordinates: Array<{ lat: number; lng: number }>;
}

export interface SatelliteTrack {
  id: string;
  name: string;
  type: 'Earth Observation' | 'Glacier / Snow Monitor' | 'Crewed Station' | 'Meteorological';
  altitudeKm: number;
  velocityKmh: number;
  inclinationDeg: number;
  periodMinutes: number;
  color: string;
}

export interface LiveTelemetry {
  satelliteId: string;
  name: string;
  lat: number;
  lng: number;
  altitudeKm: number;
  velocityKmh: number;
  subSatellitePoint: string;
  timestamp: number;
}

export interface TourGuideAgency {
  id: string;
  name: string;
  region: string;
  certifications: string[];
  websiteUrl: string;
  phone: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
}

export interface MountainAccommodation {
  id: string;
  name: string;
  type: 'Tea House' | 'Alpine Hut / Refugio' | 'Base Camp Lodge' | 'High-Altitude Tent Camp';
  mountainRange: string;
  nearestPeak: string;
  elevationM: number;
  capacity: string;
  amenities: string[];
  bookingInfo: string;
  websiteUrl: string;
}

export interface EmergencyHelpline {
  country: string;
  organization: string;
  phone: string;
  frequencyRadio?: string;
  helicopterRescueNotes: string;
}

export interface TrainingWeek {
  week: number;
  focus: string;
  mileageKm: number;
  elevationGainM: number;
  cardioDays: string;
  strengthWork: string;
  packWeightKg: number;
  tips: string;
}

export interface TeaRecipe {
  id: string;
  name: string;
  region: string;
  originMountain: string;
  traditionalIngredients: string[];
  preparationTimeMinutes: number;
  altitudeBenefits: string[];
  brewingInstructions: string;
}

export interface GlossaryItem {
  term: string;
  category: 'Technique' | 'Geology & Glaciology' | 'Physiology & Safety' | 'Equipment';
  definition: string;
  etymology?: string;
}

export interface MountaineeringEvent {
  id: string;
  title: string;
  location: string;
  mountainRange: string;
  dates: string;
  category: 'Climbing Season Window' | 'Film Festival' | 'Gear Expo' | 'Alpinism Workshop';
  description: string;
  optimalPeakWindow?: string;
}
