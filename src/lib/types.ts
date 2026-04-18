export interface HealthData {
  bodyParts: Record<string, BodyPartEntry>;
  markers: Marker[];
  vitals: VitalReading[];
  medications: Medication[];
  surgeries: Surgery[];
  allergies: Allergy[];
  links: SavedLink[];
  bloodMarkers: BloodMarkerReading[];
}

export interface BloodMarkerReading {
  id: string;
  type: string;
  value: string;
  unit: string;
  date: string;
  status?: "normal" | "low" | "high";
}

export interface SavedLink {
  id: string;
  title: string;
  url: string;
  category: "consult" | "referral" | "document";
  date: string;
  notes: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  takeaways?: string[];
}

export interface BodyPartEntry {
  notes: BodyNote[];
}

export interface BodyNote {
  id: string;
  text: string;
  date: string;
  source?: "manual" | "extracted";
}

export interface Marker {
  id: string;
  x: number;
  y: number;
  label: string;
  note: string;
  color: "red" | "orange" | "yellow";
  createdAt: string;
}

export interface VitalReading {
  id: string;
  type: VitalType;
  value: string;
  unit: string;
  date: string;
}

export type VitalType =
  | "blood-pressure"
  | "heart-rate"
  | "weight"
  | "temperature"
  | "blood-cell-count"
  | "oxygen-saturation";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  notes: string;
}

export interface Surgery {
  id: string;
  name: string;
  date: string;
  hospital: string;
  notes: string;
}

export interface Allergy {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  reaction: string;
  notes: string;
}

export const EMPTY_HEALTH_DATA: HealthData = {
  bodyParts: {},
  markers: [],
  vitals: [],
  medications: [],
  surgeries: [],
  allergies: [],
  links: [],
  bloodMarkers: [],
};
