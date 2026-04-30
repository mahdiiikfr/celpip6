import { DailyActivity, getAllDailyActivities } from './db';

export interface DayStats {
  date: string; // YYYY-MM-DD
  totalCorrect: number;
  totalWrong: number;
  totalAnswers: number;
  accuracy: number; // 0-100
  uniqueBooks: number;

  // Score Components
  baseScore: number;
  accuracyBonus: number;
  activityBonus: number;
  bookBonus: number;
  progressBonus: number;
  finalScore: number;

  level: 0 | 1 | 2 | 3 | 4 | 5;
}

export interface ActivityChainStats {
  currentChain: number;
  bestChain: number;
  totalScore: number;
}

export const MIN_SCORE_FOR_CHAIN = 20;

/**
 * Calculates detailed stats and score for a single day based on a list of activities (one per book).
 */
export const calculateDayStats = (date: string, activities: DailyActivity[]): DayStats => {
  let totalCorrect = 0;
  let totalWrong = 0;
  const booksSet = new Set<string>();

  activities.forEach(act => {
    totalCorrect += act.correctAnswer;
    totalWrong += act.wrongAnswer;
    booksSet.add(act.bookId);
  });

  const totalAnswers = totalCorrect + totalWrong;
  const accuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) : 0;
  const accuracyPercent = Math.round(accuracy * 100);

  // 1. Base Score: Correct * 1.5 - Wrong * 0.3
  const scoreFromCorrect = totalCorrect * 1.5;
  const penaltyFromWrong = totalWrong * 0.3;
  let baseScore = scoreFromCorrect - penaltyFromWrong;
  if (baseScore < 0) baseScore = 0; // Prevent negative base score? Or allow it? Assuming non-negative for display.

  // 2. Accuracy Bonus: If Acc >= 80% -> Correct * 0.5 * Accuracy
  let accuracyBonus = 0;
  if (accuracy >= 0.8) {
    accuracyBonus = totalCorrect * 0.5 * accuracy;
  }

  // 3. Activity Bonus: sqrt(Total) * 0.1
  const activityBonus = Math.sqrt(totalAnswers) * 0.1;

  // 4. Book Bonus: 2 points per book
  const uniqueBooks = booksSet.size;
  const bookBonus = uniqueBooks * 2;

  // 5. Progress Bonus (Approximation): Correct * 0.1
  const progressBonus = totalCorrect * 0.1;

  // Final Score
  const rawFinalScore = baseScore + accuracyBonus + activityBonus + bookBonus + progressBonus;
  const finalScore = Math.round(rawFinalScore * 10) / 10; // Round to 1 decimal

  // Determine Level
  let level: 0 | 1 | 2 | 3 | 4 | 5 = 0;
  if (finalScore >= 140) level = 5;
  else if (finalScore >= 100) level = 4;
  else if (finalScore >= 70) level = 3;
  else if (finalScore >= 40) level = 2;
  else if (finalScore >= 20) level = 1;

  return {
    date,
    totalCorrect,
    totalWrong,
    totalAnswers,
    accuracy: accuracyPercent,
    uniqueBooks,
    baseScore,
    accuracyBonus,
    activityBonus,
    bookBonus,
    progressBonus,
    finalScore,
    level
  };
};

/**
 * Fetches all activities and aggregates them by date.
 */
export const getAggregatedActivityStats = async (): Promise<Record<string, DayStats>> => {
  const allActivities = await getAllDailyActivities();
  const groupedByDate: Record<string, DailyActivity[]> = {};

  allActivities.forEach(act => {
    if (!groupedByDate[act.date]) {
      groupedByDate[act.date] = [];
    }
    groupedByDate[act.date].push(act);
  });

  const statsByDate: Record<string, DayStats> = {};
  Object.keys(groupedByDate).forEach(date => {
    statsByDate[date] = calculateDayStats(date, groupedByDate[date]);
  });

  return statsByDate;
};

/**
 * Calculates chain statistics based on aggregated daily stats.
 */
export const calculateChainStats = (statsByDate: Record<string, DayStats>): ActivityChainStats => {
  const dates = Object.keys(statsByDate).sort(); // Sort chronologically
  if (dates.length === 0) return { currentChain: 0, bestChain: 0, totalScore: 0 };

  let currentChain = 0;
  let bestChain = 0;
  let tempChain = 0;
  let totalScore = 0;

  // Helper to check if dates are consecutive
  const isConsecutive = (d1: string, d2: string) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  // We need to iterate through all days in range to properly break chains on missing days
  // However, statsByDate only has days WITH activity.
  // We must reconstruct the timeline if we want strict "missing day breaks chain".
  // But strictly speaking, if a day is missing from stats, its score is 0, so it breaks the chain (unless score 0 is valid, which it isn't for >20).

  // Simple iteration over sorted existing keys is insufficient if gaps exist.
  // We need to check gaps.

  const sortedDates = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // Calculate Best Chain
  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const stat = statsByDate[date];
    totalScore += stat.finalScore;

    if (stat.finalScore >= MIN_SCORE_FOR_CHAIN) {
        // Check if consecutive with previous
        if (i > 0 && isConsecutive(sortedDates[i-1], date)) {
            tempChain++;
        } else {
             // If not consecutive, but meets criteria, reset to 1
             // UNLESS the gap was just one day? No, any gap breaks it.
             // Wait, if I skipped a day, date[i-1] and date[i] are not consecutive.
             tempChain = 1;
        }
    } else {
        tempChain = 0;
    }

    if (tempChain > bestChain) bestChain = tempChain;
  }

  // Calculate Current Chain
  // Current chain counts backwards from Today (or Yesterday if Today is not finished/started).
  // If Today has score >= 20, include it.
  // If Today < 20, and Yesterday >= 20, chain is alive?
  // Usually "Current Chain" means "Streak ending today or yesterday".
  // If I haven't played today yet, my streak from yesterday is still valid.

  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  const todayScore = statsByDate[today]?.finalScore || 0;
  const yesterdayScore = statsByDate[yesterday]?.finalScore || 0;

  // Start counting backwards
  let checkDate = new Date();
  let streak = 0;

  // If today is valid, start from today
  if (todayScore >= MIN_SCORE_FOR_CHAIN) {
      // iterate back
  } else if (yesterdayScore >= MIN_SCORE_FOR_CHAIN) {
      // start from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
  } else {
      // Streak broken
      currentChain = 0;
      return { currentChain, bestChain, totalScore: Math.round(totalScore) };
  }

  // Walk backwards to count streak
  while (true) {
      const dString = checkDate.toISOString().split('T')[0];
      const s = statsByDate[dString]?.finalScore || 0;

      if (s >= MIN_SCORE_FOR_CHAIN) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
      } else {
          break;
      }
  }
  currentChain = streak;

  return {
    currentChain,
    bestChain,
    totalScore: Math.round(totalScore)
  };
};

/**
 * Generates the grid data for the last N weeks ending today.
 */
export const generateCalendarGrid = (weeks = 31) => {
  const end = new Date();
  // Align to end of week? Or just today?
  // Usually contribution graphs end on Today.
  // We want 31 columns (weeks).

  const days: string[] = [];
  const today = new Date();

  // Calculate start date: (31 * 7) - 1 days ago?
  // Let's build it column by column (Week by week) or just a flat list of days.
  // ActivityScreen renders: 31 columns. Each column is a week (7 days).
  // We need to know which date corresponds to (weekIndex, dayIndex).

  // Let's assume the rightmost column is "Current Week" containing Today.
  // But standard graphs usually fill from left to right.
  // The screenshot shows "Dec Jan Feb ...". It looks like a standard year view.
  // Actually, the screenshot `photo_7` shows "2025/11/28 to 2025/11/19" (Reverse?? No, RTL).
  // RTL: The rightmost might be the start or end?
  // In `ActivityScreen.tsx`, it says `dir="ltr"` for the calendar container.
  // `months` labels are Left to Right: Nov, Dec, Jan...
  // So it starts from Past (Left) -> Future/Today (Right).

  // To fill 31 weeks ending today:
  // Start Date = Today - (31 * 7 days) + (days until end of week?)

  // Let's generate a matrix [weekIndex][dayIndex] -> dateString

  const grid: string[][] = [];

  // Find the most recent Saturday (or end of week).
  // In Iran/RTL context, week usually starts Saturday or Sunday?
  // `ActivityScreen` lists days: Sun, Mon, Tue... (Standard western).
  // So let's assume standard Sunday-Saturday week for layout, or adhere to the labels.
  // Labels in code: Sun, Mon... Sat.

  // We want the last column to include Today.
  // Let's start from Today and go backwards filling the grid.

  // Actually, to make it easier for the frontend loop:
  // We need 31 weeks.
  // Let's define the start date.

  const gridData: { date: string; weekIndex: number; dayIndex: number }[] = [];

  // Current logic in ActivityScreen loops 31 weeks, then 7 days.
  // We need to map that structure to dates.

  // Let's simply return a helper that converts (weekIndex, dayIndex) to Date.
  // But simpler: Return the start date of the grid.

  // If we want the grid to END today (or end of this week).
  // Let's assume the last column (week 30) contains today.

  return {
     // Helper logic to be used in component
  };
};
