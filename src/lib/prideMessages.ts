export const PRIDE_MESSAGES = [
  "Bravo Justine, tu cours super vite aujourd'hui !",
  "Justine, tes jambes sont en feu, quelle fierté !",
  "Bravo Justine, tu viens de faire quelque chose de génial !",
  "Justine, chaque pas te rend plus forte. Bien joué !",
  "Fière de toi Justine, tu viens de te dépasser !",
  "Bravo, cette sortie était pleine d'énergie !",
  "Quel run magnifique, tu peux être fier·ère de toi !",
  "Tu l'as fait ! Ton courage mérite une grande ovation !",
  "Tes baskets peuvent être fières : quelle belle course !",
  "Encore une victoire pour toi, bravo champion·ne !",
  "Tu avances à ton rythme et c'est déjà formidable !",
  "Quelle énergie ! Tu viens de faire un super boulot !",
  "La grenouille est impressionnée : quelle course !",
  "Tu peux sourire, cette sortie était vraiment chouette !",
  "Félicitations, ton toi d'hier te dit merci !",
] as const;

export type PrideMessage = (typeof PRIDE_MESSAGES)[number];

export function getRandomPrideMessage(): PrideMessage {
  return PRIDE_MESSAGES[Math.floor(Math.random() * PRIDE_MESSAGES.length)];
}
