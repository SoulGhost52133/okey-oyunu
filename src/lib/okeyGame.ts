import type { OkeyTile } from './supabase';

export const COLORS = ['red', 'blue', 'black', 'yellow'] as const;
export type Color = typeof COLORS[number];

export const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function createDeck(): OkeyTile[] {
  const deck: OkeyTile[] = [];
  let id = 0;

  for (const color of COLORS) {
    for (const value of VALUES) {
      for (let i = 0; i < 2; i++) {
        deck.push({
          id: `tile-${id++}`,
          color,
          value,
          is_okey: false,
          is_fake_okey: false,
        });
      }
    }
  }

  deck.push({
    id: `tile-${id++}`,
    color: 'red',
    value: 1,
    is_okey: false,
    is_fake_okey: true,
  });
  deck.push({
    id: `tile-${id++}`,
    color: 'blue',
    value: 1,
    is_okey: false,
    is_fake_okey: true,
  });

  return deck;
}

export function shuffleDeck(deck: OkeyTile[]): OkeyTile[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealTiles(deck: OkeyTile[], dealerIndex: number = 0): OkeyTile[][] {
  const hands: OkeyTile[][] = [[], [], [], []];
  let deckIndex = 0;

  for (let round = 0; round < 13; round++) {
    for (let player = 0; player < 4; player++) {
      hands[player].push(deck[deckIndex++]);
    }
  }

  hands[dealerIndex].push(deck[deckIndex++]);

  return hands;
}

export function determineOkeyTile(indicatorTile: OkeyTile): OkeyTile {
  if (indicatorTile.is_fake_okey) {
    return {
      id: 'okey-special',
      color: indicatorTile.color,
      value: indicatorTile.value,
      is_okey: true,
      is_fake_okey: false,
    };
  }

  let newValue = indicatorTile.value + 1;
  if (newValue > 13) newValue = 1;

  return {
    id: 'okey-determined',
    color: indicatorTile.color,
    value: newValue,
    is_okey: true,
    is_fake_okey: false,
  };
}

export function isOkey(tile: OkeyTile, okeyTile: OkeyTile): boolean {
  if (tile.is_fake_okey) return true;
  return tile.color === okeyTile.color && tile.value === okeyTile.value;
}

export function isValidSet(tiles: OkeyTile[]): boolean {
  if (tiles.length < 3 || tiles.length > 4) return false;
  
  const values = tiles.map(t => t.value);
  const firstValue = values[0];
  
  if (!values.every(v => v === firstValue)) return false;
  
  const colors = tiles.filter(t => !t.is_fake_okey).map(t => t.color);
  const uniqueColors = new Set(colors);
  
  return uniqueColors.size === tiles.length || tiles.some(t => t.is_fake_okey);
}

export function isValidRun(tiles: OkeyTile[]): boolean {
  if (tiles.length < 3) return false;
  
  const colors = tiles.filter(t => !t.is_fake_okey).map(t => t.color);
  if (colors.length > 0 && !colors.every(c => c === colors[0])) return false;
  
  const values = tiles
    .filter(t => !t.is_fake_okey)
    .map(t => t.value)
    .sort((a, b) => a - b);
  
  if (values.length < 2) return true;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) {
      if (!(values[i - 1] === 13 && values[i] === 1)) {
        return false;
      }
    }
  }
  
  return true;
}

export function calculateScore(tiles: OkeyTile[]): number {
  let score = 0;
  for (const tile of tiles) {
    if (!tile.is_fake_okey) {
      score += tile.value;
    }
  }
  return score;
}

export function getColorName(color: Color): string {
  const names: Record<Color, string> = {
    red: 'Kırmızı',
    blue: 'Mavi',
    black: 'Siyah',
    yellow: 'Sarı',
  };
  return names[color];
}

export function getColorEmoji(color: Color): string {
  const emojis: Record<Color, string> = {
    red: '🔴',
    blue: '🔵',
    black: '⚫',
    yellow: '🟡',
  };
  return emojis[color];
}
