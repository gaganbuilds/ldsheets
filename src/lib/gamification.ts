export const calculateLevel = (totalXP: number): number => {
  return Math.floor(totalXP / 500) + 1;
};

export interface LevelProgress {
  currentLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  remainingXP: number;
}

export const getLevelProgress = (totalXP: number): LevelProgress => {
  const currentLevel = calculateLevel(totalXP);
  
  // Total XP required to reach the NEXT level (currentLevel + 1)
  // E.g. level 1 (0-499), next is level 2 (500)
  // level 2 (500-999), next is level 3 (1000)
  const xpThresholdForNextLevel = currentLevel * 500;
  
  // Total XP required to HAVE reached the CURRENT level
  // E.g. level 2 required 500. level 1 required 0.
  const xpThresholdForCurrentLevel = (currentLevel - 1) * 500;
  
  // XP earned WITHIN the current level bounds
  const currentLevelXP = totalXP - xpThresholdForCurrentLevel;
  
  // XP remaining to next level
  const remainingXP = xpThresholdForNextLevel - totalXP;
  
  // Progress percentage (0 to 100)
  // The denominator is always 500 because each level is 500 XP wide in this linear system
  const progressPercent = Math.min(Math.max(Math.round((currentLevelXP / 500) * 100), 0), 100);
  
  return {
    currentLevel,
    currentLevelXP,
    nextLevelXP: xpThresholdForNextLevel,
    progressPercent,
    remainingXP
  };
};
