import { UserStats } from "../types";
import { differenceInCalendarDays, format } from "date-fns";

const STORAGE_KEY = "geoLevelUp_stats";

const INITIAL_STATS: UserStats = {
  level: 1,
  currentXP: 0,
  nextLevelXP: 500,
  streakDays: 0,
  lastActiveDate: new Date().toISOString(),
  totalTasksCompleted: 0,
  totalFocusMinutes: 0,
};

export const getStats = (): UserStats => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_STATS;
  return JSON.parse(stored);
};

export const saveStats = (stats: UserStats) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  // Dispatch event so UI components can update immediately
  window.dispatchEvent(new Event("statsUpdated"));
};

export const addXP = (amount: number, minutesFocused: number = 0) => {
  const stats = getStats();
  
  // Update Streak Logic
  const today = new Date();
  const lastActive = new Date(stats.lastActiveDate);
  const diff = differenceInCalendarDays(today, lastActive);

  if (diff === 1) {
    stats.streakDays += 1;
  } else if (diff > 1) {
    stats.streakDays = 1; // Reset streak if missed a day
  }
  // If diff === 0, streak remains same (already active today)
  
  stats.lastActiveDate = today.toISOString();
  stats.currentXP += amount;
  stats.totalTasksCompleted += 1;
  stats.totalFocusMinutes += minutesFocused;

  // Level Up Logic
  // Formula: Level N requires N * 500 XP
  while (stats.currentXP >= stats.nextLevelXP) {
    stats.currentXP -= stats.nextLevelXP;
    stats.level += 1;
    stats.nextLevelXP = stats.level * 500;
    // Optional: Trigger a "Level Up" notification here if needed
  }

  saveStats(stats);
  return stats;
};

export const calculateProgress = (stats: UserStats) => {
  return Math.min(100, Math.round((stats.currentXP / stats.nextLevelXP) * 100));
};