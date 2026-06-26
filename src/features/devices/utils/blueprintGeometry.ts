/**
 * Geometria da planta do SCC — portada de `be1-bananapi/src/gui/components/blueprint/mod.rs`
 * (`ANCHORS`, `ARROW_Y_NORM`, `SVG_W/H`). Todas as coordenadas são normalizadas
 * pelo viewBox do `blueprint.svg`, para posicionar os rótulos (temp/umidade) e as
 * setas de fluxo sobre o SVG, independente do tamanho renderizado.
 */

export const BP_W = 20271.81;
export const BP_H = 21891.24;
export const BP_ASPECT = BP_W / BP_H;

export interface ChamberAnchor {
  /** Canto esquerdo do divisor tracejado da câmara (normalizado por largura). */
  divX: number;
  /** Linha do divisor (normalizado por altura) — temp acima, umidade abaixo. */
  divY: number;
  /** Largura do divisor (normalizado por largura). */
  divW: number;
}

const DIV_W = 2729.94 / BP_W;
const Y_BOTTOM = 15283.71 / BP_H; // câmaras 1..4 (metade inferior)
const Y_TOP = 6607.53 / BP_H; // câmaras 5..8 (metade superior)
const Y_RETORNO = 10945.62 / BP_H;

/**
 * Índice 0..8 = sensores do firmware: 0..7 → câmaras 1..8 (chave '1'..'8' no
 * latest data), 8 → retorno (chave '9'). Mesma ordem do `ANCHORS` do firmware.
 */
export const CHAMBER_ANCHORS: ChamberAnchor[] = [
  { divX: 17022.89 / BP_W, divY: Y_BOTTOM, divW: DIV_W }, // câmara 1
  { divX: 13349.9 / BP_W, divY: Y_BOTTOM, divW: DIV_W }, // câmara 2
  { divX: 9676.92 / BP_W, divY: Y_BOTTOM, divW: DIV_W }, // câmara 3
  { divX: 6003.93 / BP_W, divY: Y_BOTTOM, divW: DIV_W }, // câmara 4
  { divX: 6003.93 / BP_W, divY: Y_TOP, divW: DIV_W }, // câmara 5
  { divX: 9676.92 / BP_W, divY: Y_TOP, divW: DIV_W }, // câmara 6
  { divX: 13349.9 / BP_W, divY: Y_TOP, divW: DIV_W }, // câmara 7
  { divX: 17022.89 / BP_W, divY: Y_TOP, divW: DIV_W }, // câmara 8
  { divX: 2055.49 / BP_W, divY: Y_RETORNO, divW: DIV_W }, // retorno
];

/** Y do centro da faixa de setas por câmara (1..8); retorno (idx 8) não tem setas. */
export const ARROW_Y_NORM: number[] = [
  12622.0 / BP_H,
  12622.0 / BP_H,
  12622.0 / BP_H,
  12622.0 / BP_H,
  9269.0 / BP_H,
  9269.0 / BP_H,
  9269.0 / BP_H,
  9269.0 / BP_H,
  0,
];

/** Chave da câmara no latest data para a âncora `i` (0..8). 8 = retorno ('9'). */
export function chamberKeyForAnchor(i: number): string {
  return i < 8 ? String(i + 1) : '9';
}
