export interface UserProfile {
  name: string;
  major: string;
  hobbies: string[];
  businessName: string;
  sports: string[];
  weekendSports: boolean;
  goals: string[];
  schoolSchedule: string; // New field for free-text timetable
}

export interface ScheduleItem {
  time: string;
  activity: string;
  category: 'learning' | 'business' | 'health' | 'hobby' | 'rest' | 'fixed';
  description: string;
}

export interface DailyPlan {
  date: string;
  dayOfWeek: string;
  focusOfTheDay: string;
  schedule: ScheduleItem[];
  tips: string[];
}

export interface StrategyPath {
  title: string;
  description: string;
  synergies: string[]; // e.g., ["GIS + Python", "Cyber + Maps"]
  actionItems: string[];
}

export interface UserStats {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streakDays: number;
  lastActiveDate: string; // ISO date string
  totalTasksCompleted: number;
  totalFocusMinutes: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  STRATEGY = 'STRATEGY',
  SCHEDULE = 'SCHEDULE',
  PROFILE = 'PROFILE'
}