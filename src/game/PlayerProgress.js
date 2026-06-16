// Lightweight player progression helper (localStorage persistence)
// Used by LobbyScene, GameScene, ResultsScene for XP, level, unlocks

const DEFAULTS = {
  level: 1,
  xp: 0,
  skins: ['⚡'],
  name: 'Player'
};

export function getProgress() {
  return {
    level: parseInt(localStorage.getItem('playerLevel') || DEFAULTS.level),
    xp: parseInt(localStorage.getItem('playerXP') || DEFAULTS.xp),
    skins: JSON.parse(localStorage.getItem('unlockedSkins') || JSON.stringify(DEFAULTS.skins)),
    name: localStorage.getItem('playerName') || DEFAULTS.name
  };
}

export function saveProgress({ level, xp, skins, name }) {
  if (level !== undefined) localStorage.setItem('playerLevel', level);
  if (xp !== undefined) localStorage.setItem('playerXP', xp);
  if (skins !== undefined) localStorage.setItem('unlockedSkins', JSON.stringify(skins));
  if (name !== undefined) localStorage.setItem('playerName', name);
}

export function awardXP(xpGained, arenaLevel = 1) {
  const prog = getProgress();
  let { level, xp, skins } = prog;

  xp += xpGained + (arenaLevel * 10);

  const leveledUp = [];
  while (xp >= level * 100 && level < 10) {
    xp -= level * 100;
    level++;
    leveledUp.push(level);
  }

  // unlock skins at milestones
  if (level >= 3 && !skins.includes('🔥')) skins.push('🔥');
  if (level >= 6 && !skins.includes('🌟')) skins.push('🌟');
  if (level >= 9 && !skins.includes('💎')) skins.push('💎');

  saveProgress({ level, xp, skins });
  return { level, xp, skins, leveledUp: leveledUp.length > 0 };
}

export function getDashCooldown(level) {
  return level >= 5 ? 1200 : 1500;
}

export function getCurrentSkin(skins) {
  return skins[skins.length - 1] || '⚡';
}