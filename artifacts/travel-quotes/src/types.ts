export interface Hotel {
  name: string;
  stars: number;
  category: string;
  totalPrice: string;
  perPersonPrice?: string;
  refundableBy?: string;
  highlights: string[];
  vibe: string;
  pros: string[];
  advisorPick: boolean;
}

export interface ParsedQuotes {
  hotels: Hotel[];
  advisorNote?: string;
}

export interface AdvisorProfile {
  name: string;
  agency: string;
  phone: string;
  email: string;
}

export interface TripDetails {
  destination: string;
  dates: string;
  adults: string;
  nights: string;
  clients: string;
}
