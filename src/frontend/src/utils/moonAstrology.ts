/**
 * Moon Astrology Utilities
 * Calculates moon ecliptic longitude using Jean Meeus' simplified algorithm
 * ("Astronomical Algorithms", Chapter 47).
 * Accuracy: ~0.3 degrees — sufficient for aspects with 6–8 degree orbs.
 */

export interface AspectInfo {
  nameEn: string;
  nameJa: string;
  symbol: string;
  orb: number; // signed orb in degrees (positive = transit past exact)
  exactAngle: number; // the exact aspect angle (0, 60, 90, 120, 180)
}

export interface ZodiacInfo {
  signEn: string;
  signJa: string;
  degree: number; // degrees within sign (0–29.99)
}

const ZODIAC_EN = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const ZODIAC_JA = [
  "牡羊座",
  "牡牛座",
  "双子座",
  "蟹座",
  "獅子座",
  "乙女座",
  "天秤座",
  "蠍座",
  "射手座",
  "山羊座",
  "水瓶座",
  "魚座",
];

const ZODIAC_SYMBOLS = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
];

const MAJOR_ASPECTS = [
  {
    angle: 0,
    symbol: "☌",
    nameEn: "Conjunction",
    nameJa: "コンジャンクション",
    orb: 8,
  },
  { angle: 60, symbol: "⚹", nameEn: "Sextile", nameJa: "セクスタイル", orb: 6 },
  { angle: 90, symbol: "□", nameEn: "Square", nameJa: "スクエア", orb: 8 },
  { angle: 120, symbol: "△", nameEn: "Trine", nameJa: "トライン", orb: 8 },
  {
    angle: 180,
    symbol: "☍",
    nameEn: "Opposition",
    nameJa: "オポジション",
    orb: 8,
  },
];

/** Convert a Date to Julian Day Number */
export function getJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let Y = y;
  let M = m;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    d +
    B -
    1524.5
  );
}

/** Normalize angle to 0–360 range */
function norm360(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Calculate Moon's ecliptic longitude for a given UTC Date.
 * Returns degrees 0–360 (tropical zodiac).
 */
export function getMoonEclipticLongitude(date: Date): number {
  const JD = getJulianDay(date);
  const T = (JD - 2451545.0) / 36525;

  const toRad = Math.PI / 180;

  // Moon's mean longitude (degrees)
  const L0 = norm360(218.3164477 + 481267.88123421 * T);
  // Sun's mean anomaly
  const M = norm360(357.5291092 + 35999.0502909 * T) * toRad;
  // Moon's mean anomaly
  const Mp = norm360(134.9633964 + 477198.8675055 * T) * toRad;
  // Moon's mean elongation
  const D = norm360(297.8501921 + 445267.1114034 * T) * toRad;
  // Moon's argument of latitude
  const F = norm360(93.272095 + 483202.0175233 * T) * toRad;

  // Periodic terms for longitude (degrees)
  const dL =
    6.288774 * Math.sin(Mp) +
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) +
    -0.185116 * Math.sin(M) +
    -0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057066 * Math.sin(2 * D - M - Mp) +
    0.053322 * Math.sin(2 * D + Mp) +
    0.045758 * Math.sin(2 * D - M) +
    -0.040923 * Math.sin(M - Mp) +
    -0.03472 * Math.sin(D) +
    -0.030383 * Math.sin(M + Mp) +
    0.015327 * Math.sin(2 * D - 2 * F) +
    -0.012528 * Math.sin(Mp + 2 * F) +
    -0.01098 * Math.sin(Mp - 2 * F) +
    0.010675 * Math.sin(4 * D - Mp) +
    0.010034 * Math.sin(3 * Mp) +
    0.008548 * Math.sin(4 * D - 2 * Mp) +
    -0.007888 * Math.sin(2 * D + M - Mp) +
    -0.006766 * Math.sin(2 * D + M) +
    -0.005163 * Math.sin(D - Mp) +
    0.004987 * Math.sin(D + M) +
    0.004036 * Math.sin(2 * D - M + Mp) +
    0.003994 * Math.sin(2 * D + 2 * Mp) +
    0.003861 * Math.sin(4 * D) +
    0.003665 * Math.sin(2 * D - 3 * Mp);

  return norm360(L0 + dL);
}

/** Get zodiac sign info from ecliptic longitude */
export function getZodiacInfo(
  longitude: number,
): ZodiacInfo & { symbol: string } {
  const idx = Math.floor(longitude / 30) % 12;
  return {
    signEn: ZODIAC_EN[idx],
    signJa: ZODIAC_JA[idx],
    symbol: ZODIAC_SYMBOLS[idx],
    degree: longitude % 30,
  };
}

/**
 * Calculate the aspect between natal and transit moon longitudes.
 * Returns the closest major aspect within orb, or null if none.
 */
export function getMoonAspect(
  natalLon: number,
  transitLon: number,
): AspectInfo | null {
  // Absolute angular difference 0–180
  let diff = (((transitLon - natalLon) % 360) + 360) % 360;
  if (diff > 180) diff = 360 - diff;

  let closest: (AspectInfo & { absOrb: number }) | null = null;

  for (const asp of MAJOR_ASPECTS) {
    const orb = diff - asp.angle;
    const absOrb = Math.abs(orb);
    if (absOrb <= asp.orb) {
      if (!closest || absOrb < closest.absOrb) {
        closest = {
          nameEn: asp.nameEn,
          nameJa: asp.nameJa,
          symbol: asp.symbol,
          orb: Number.parseFloat(orb.toFixed(1)),
          exactAngle: asp.angle,
          absOrb,
        };
      }
    }
  }

  if (!closest) return null;
  const { absOrb: _absOrb, ...result } = closest;
  return result;
}

/**
 * Convert local birth datetime to a UTC Date using timezone offset in hours.
 */
export function birthToUTC(
  birthDate: string, // "YYYY-MM-DD"
  birthTime: string, // "HH:MM"
  timezoneOffsetHours: number,
): Date {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  // Local time in milliseconds
  const localMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  // Subtract timezone offset to get UTC
  return new Date(localMs - timezoneOffsetHours * 60 * 60 * 1000);
}
