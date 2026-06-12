// Thermal scale cold→warm→hot, ported from be1-app's getTemperatureColor
// (Rust thermal_rgb). cold #4f813e · warm #caa12c · hot #e6560f.
const TEMP_COLD_RGB: [number, number, number] = [0.31, 0.506, 0.243];
const TEMP_WARM_RGB: [number, number, number] = [0.792, 0.631, 0.173];
const TEMP_HOT_RGB: [number, number, number] = [0.902, 0.337, 0.059];

const TEMP_COLD = 80;
const TEMP_WARM = 105;
const TEMP_HOT = 130;

type Rgb = [number, number, number];

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function thermalRgb(v: number, cold: number, warm: number, hot: number): Rgb {
  if (v <= cold) return TEMP_COLD_RGB;
  if (v >= hot) return TEMP_HOT_RGB;
  if (v <= warm) {
    return lerpRgb(TEMP_COLD_RGB, TEMP_WARM_RGB, (v - cold) / (warm - cold));
  }
  return lerpRgb(TEMP_WARM_RGB, TEMP_HOT_RGB, (v - warm) / (hot - warm));
}

function rgbToHex([r, g, b]: Rgb): string {
  const toHex = (x: number) =>
    Math.round(Math.max(0, Math.min(1, x)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Thermal color for a temperature value (saturating at the extremes). */
export function getTemperatureColor(temp: number | null | undefined): string {
  if (temp == null || isNaN(temp)) return '#9CA3AF';
  return rgbToHex(thermalRgb(temp, TEMP_COLD, TEMP_WARM, TEMP_HOT));
}

/** Append an opacity (0-1) to a #rrggbb hex as #rrggbbaa. */
export function withAlpha(hex: string, opacity: number): string {
  const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  return hex + a;
}
