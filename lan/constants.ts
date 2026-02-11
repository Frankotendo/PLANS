import { UserProfile } from './types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Future Geo-Tycoon",
  major: "Geomatics",
  hobbies: ["Trading", "Cybersecurity", "Programming (GIS & General)"],
  businessName: "MyNexRyde",
  sports: ["Volleyball", "Gym"],
  weekendSports: true,
  schoolSchedule: "Monday: 09:00-12:00 GIS Lab\nWednesday: 14:00-16:00 Remote Sensing Lecture",
  goals: [
    "Master Geospatial Data Science",
    "Automate Trading Strategies with Python",
    "Secure GIS Infrastructure",
    "Scale MyNexRyde Business"
  ]
};

export const MOCK_STRATEGY = `
## The Geo-Quant Cyber Strategy

**Core Concept:** You are not just a Geomatics student. You are building a "Spatial Intelligence Nexus".

### 1. The Golden Intersection (Fastest Level Up)
Instead of learning these separately, learn them together:
*   **GIS + Trading:** "Spatial Finance". Analyze satellite imagery (corn fields, oil tankers, parking lots) to predict market movements.
    *   *Action:* Build a Python script that counts cars in retail parking lots from satellite open data to predict earnings.
*   **GIS + Cybersecurity:** "Critical Infrastructure Protection". Maps are sensitive. Learn how to secure WFS/WMS services and prevent GPS spoofing.
    *   *Action:* Set up a secure GeoServer instance and try to penetrate it (White Hat).
*   **Programming:** The glue. Focus on Python (backend/analysis) and JavaScript/React (frontend visualization).

### 2. The Business Integration (MyNexRyde)
*   Use your coding skills to automate dispatch or logistics for MyNexRyde.
*   Use your GIS skills to optimize routes or analyze customer density.
`;