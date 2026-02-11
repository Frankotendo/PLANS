import { UserProfile, DailyPlan, StrategyPath } from './types';

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

export const FALLBACK_STRATEGIES: StrategyPath[] = [
  {
    title: "The Spatial-Algo Trader",
    description: "Combine Geomatics with Trading. Use satellite data to predict supply chain movements (e.g., counting cars in retail parking lots or tracking oil tankers) to inform algorithmic trading positions.",
    synergies: ["GIS + Python", "Remote Sensing + Finance"],
    actionItems: [
      "Learn 'yfinance' and 'geopandas' Python libraries.",
      "Build a heatmap of local business activity using open street map data.",
      "Backtest a trading strategy based on weather data overlays."
    ]
  },
  {
    title: "Geo-Cyber Defender",
    description: "Critical infrastructure is location-based. Master the security of GIS servers (GeoServer, ArcGIS Enterprise). This is a massive, high-paying niche.",
    synergies: ["Cybersecurity + GIS", "Network Security + IoT"],
    actionItems: [
      "Set up a local GeoServer and secure it with SSL/Auth.",
      "Learn about 'Location Spoofing' and how to detect it.",
      "Audit the MyNexRyde app for location data privacy leaks."
    ]
  },
  {
    title: "MyNexRyde Operator",
    description: "Treat your business as your primary case study. automated logistics, route optimization, and customer density analysis using your Geomatics skills.",
    synergies: ["Business + Optimization", "App Dev + Routing"],
    actionItems: [
      "Visualize your current customer database on a map.",
      "Automate one manual business process using Python scripts.",
      " dedicate 1 hour daily to 'Deep Work' on business operations."
    ]
  }
];

export const FALLBACK_DAILY_PLAN: DailyPlan = {
  date: new Date().toISOString(),
  dayOfWeek: "Today",
  focusOfTheDay: "System Recovery & Foundation Building",
  tips: [
    "The AI service is currently unreachable, but discipline remains.",
    "Early rising (4 AM) gives you a head start on the market and competition.",
    "Focus on your core competencies: Code, Trade, Study."
  ],
  schedule: [
    { time: "04:00", activity: "Wake Up & Hydrate", category: "health", description: "Jumpstart the metabolism. 4 AM Club." },
    { time: "04:30", activity: "Market Analysis / Trading", category: "business", description: "Review Asian/London session data before US open." },
    { time: "06:00", activity: "Gym / Physical Training", category: "health", description: "Maintain physical peak performance." },
    { time: "07:30", activity: "Commute / Audiobooks", category: "learning", description: "Listen to trading or tech podcasts." },
    { time: "08:30", activity: "Deep Work: Geomatics/GIS", category: "learning", description: "Review class notes or work on lab assignments." },
    { time: "11:00", activity: "MyNexRyde Operations", category: "business", description: "Check emails, dispatch status, and logistics." },
    { time: "13:00", activity: "Lunch & Market Check", category: "rest", description: "Refuel and check positions." },
    { time: "14:00", activity: "Skill Stack: Python for Finance", category: "learning", description: "Coding practice combining GIS and Trading concepts." },
    { time: "17:00", activity: "Volleyball / Active Recovery", category: "health", description: "Sports or stretching." },
    { time: "19:00", activity: "Cybersecurity Lab", category: "hobby", description: "Hack The Box or study network security protocols." },
    { time: "21:00", activity: "Wind Down & Read", category: "rest", description: "No screens. Prepare for sleep." }
  ]
};
