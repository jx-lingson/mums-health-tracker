import { VitalType } from "./types";

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
  { id: "upper-back", label: "Upper Back" },
  { id: "lower-back", label: "Lower Back" },
];

export interface VitalTypeDef {
  id: VitalType;
  label: string;
  unit: string;
  placeholder: string;
}

export const VITAL_TYPES: VitalTypeDef[] = [
  { id: "blood-pressure", label: "Blood Pressure", unit: "mmHg", placeholder: "120/80" },
  { id: "heart-rate", label: "Heart Rate", unit: "bpm", placeholder: "72" },
  { id: "weight", label: "Weight", unit: "kg", placeholder: "65" },
  { id: "temperature", label: "Temperature", unit: "°C", placeholder: "36.6" },
  { id: "blood-cell-count", label: "Blood Cell Count", unit: "cells/mcL", placeholder: "5000" },
  { id: "oxygen-saturation", label: "Oxygen Saturation", unit: "%", placeholder: "98" },
];
