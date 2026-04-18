export interface HealthData {
  bodyParts: Record<string, BodyPartEntry>;
  markers: Marker[];
  vitals: VitalReading[];
  medications: Medication[];
  surgeries: Surgery[];
  allergies: Allergy[];
}

export interface BodyPartEntry {
  notes: BodyNote[];
}

export interface BodyNote {
  id: string;
  text: string;
  date: string;
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
};
