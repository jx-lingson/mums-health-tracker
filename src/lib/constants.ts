import { VitalType } from "./types";

export const MUM_DOB = new Date(1972, 8, 2); // September 2, 1972

export function calculateAge(dob: Date): { years: number; months: number } {
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
    years--;
    months += 12;
  }
  if (now.getDate() < dob.getDate()) {
    months--;
    if (months < 0) months += 12;
  }
  return { years, months };
}

export interface BodyPartDef {
  id: string;
  label: string;
}

export const BODY_PARTS: BodyPartDef[] = [
  { id: "head", label: "Head" },
  { id: "neck", label: "Neck" },
  { id: "chest", label: "Chest" },
  { id: "abdomen", label: "Abdomen" },
  { id: "left-shoulder", label: "Left Shoulder" },
  { id: "right-shoulder", label: "Right Shoulder" },
  { id: "left-upper-arm", label: "Left Upper Arm" },
  { id: "right-upper-arm", label: "Right Upper Arm" },
  { id: "left-forearm", label: "Left Forearm" },
  { id: "right-forearm", label: "Right Forearm" },
  { id: "left-hand", label: "Left Hand" },
  { id: "right-hand", label: "Right Hand" },
  { id: "left-upper-leg", label: "Left Upper Leg" },
  { id: "right-upper-leg", label: "Right Upper Leg" },
  { id: "left-lower-leg", label: "Left Lower Leg" },
  { id: "right-lower-leg", label: "Right Lower Leg" },
  { id: "left-foot", label: "Left Foot" },
  { id: "right-foot", label: "Right Foot" },
];

export interface VitalTypeDef {
  id: VitalType;
  label: string;
  unit: string;
  placeholder: string;
}

export const VITAL_TYPES: VitalTypeDef[] = [
  { id: "blood-pressure", label: "Blood Pressure", unit: "mmHg", placeholder: "120/80" },
  { id: "weight", label: "Weight", unit: "kg", placeholder: "65" },
  { id: "blood-cell-count", label: "Blood Cell Count", unit: "cells/mcL", placeholder: "5000" },
];
