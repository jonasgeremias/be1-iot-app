/**
 * Paleta térmica das câmaras — portada 1:1 de `be1-bananapi/src/gui/theme.rs`
 * (`thermal_rgb` / `chamber_palette`), para a planta do SCC ficar idêntica.
 *
 * Limiares absolutos em °F (verde 70 · amarelo 100 · vermelho 140); convertidos
 * para a escala ativa antes de amostrar. `chamberPalette` devolve a cor de fundo
 * (face da câmara) e a de frente (borda/círculo): fg = `thermalRgb`; bg = fg
 * interpolado 85% em direção ao branco (mantém o tom legível sob rótulos).
 */

export type TempScale = 'celsius' | 'fahrenheit';

type Rgb = [number, number, number];

const TEMP_GREEN_F = 70;
const TEMP_YELLOW_F = 100;
const TEMP_RED_F = 140;

const TEMP_COLD_RGB: Rgb = [0.31, 0.506, 0.243]; // #4f813e
const TEMP_WARM_RGB: Rgb = [0.792, 0.631, 0.173]; // #caa12c
const TEMP_HOT_RGB: Rgb = [0.902, 0.337, 0.059]; // #e6560f

function thermalThresholds(scale: TempScale): [number, number, number] {
  if (scale === 'fahrenheit') return [TEMP_GREEN_F, TEMP_YELLOW_F, TEMP_RED_F];
  const toC = (f: number) => ((f - 32) * 5) / 9;
  return [toC(TEMP_GREEN_F), toC(TEMP_YELLOW_F), toC(TEMP_RED_F)];
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function thermalRgb(v: number, cold: number, warm: number, hot: number): Rgb {
  if (v <= cold) return TEMP_COLD_RGB;
  if (v >= hot) return TEMP_HOT_RGB;
  if (v <= warm) return lerpRgb(TEMP_COLD_RGB, TEMP_WARM_RGB, (v - cold) / (warm - cold));
  return lerpRgb(TEMP_WARM_RGB, TEMP_HOT_RGB, (v - warm) / (hot - warm));
}

function rgbToHex([r, g, b]: Rgb): string {
  const toHex = (x: number) =>
    Math.round(Math.max(0, Math.min(1, x)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Cor de fundo (face) e de frente (borda/círculo) de uma câmara à temp `v`. */
export function chamberPalette(v: number, scale: TempScale): { bg: string; fg: string } {
  const [cold, warm, hot] = thermalThresholds(scale);
  const fg = thermalRgb(v, cold, warm, hot);
  const bg = lerpRgb(fg, [1, 1, 1], 0.85);
  return { bg: rgbToHex(bg), fg: rgbToHex(fg) };
}
