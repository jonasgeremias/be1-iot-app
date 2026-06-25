import { Lock } from '@tamagui/lucide-icons';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { SvgXml } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { View } from 'tamagui';

import { CA_SVG } from '../assets/caSvg';
import { ACTUATOR_COLORS, type ActuatorCell, type LedMode } from '../utils/actuatorState';

/**
 * Painel COMANDO renderizado a partir do `ca.svg` do firmware (`be1-bananapi`),
 * com os 16×2 LEDs, o anel de seleção, as áreas de toque dos botões e o cadeado
 * sobrepostos nas âncoras normalizadas do `comando.rs`. O SVG traz o chrome
 * (moldura, chips, numeração, pill "BLOQUEIO").
 */

// ── geometria (copiada de comando.rs; viewBox do ca.svg) ──────────────────────
const SVG_W = 343.65143;
const SVG_H = 261.39593;
const ASPECT = SVG_W / SVG_H;
/** Raios normalizados pela largura do viewBox. */
const LED_R = 0.0098;
const BTN_R = 0.02903;
/** Pill de bloqueio (x0,y0,x1,y1) e centro do cadeado, normalizados. */
const LOCK_PILL = { x0: 0.08546, y0: 0.79905, x1: 0.47329, y1: 0.90452 };
const LOCK = { x: 0.14452, y: 0.85217 };

/** Cores "apagadas" (dim) sólidas, para cobrir os LEDs autorais do SVG. */
const DIM = { green: '#1D322A', red: '#321D1D' } as const;

type Anchor = { bx: number; by: number; gx: number; gy: number; rx: number; ry: number };

// AR QUENTE (1..8): verde em cima (gy), vermelho embaixo (ry).
const QUENTE_X = [0.1552, 0.23274, 0.31027, 0.3878, 0.46533, 0.54287, 0.6204, 0.69793];
// AR RETORNO (9..16): vermelho em cima (ry), verde embaixo (gy).
const RETORNO_X = [0.15692, 0.23445, 0.31198, 0.38951, 0.46705, 0.54458, 0.62211, 0.69964];

/** Âncoras por índice 1..16 (botão + LED verde + LED vermelho). */
const ANCHORS: Anchor[] = [
  ...QUENTE_X.map((x) => ({ bx: x, by: 0.40021, gx: x, gy: 0.33478, rx: x, ry: 0.46563 })),
  ...RETORNO_X.map((x) => ({ bx: x, by: 0.66953, gx: x, gy: 0.73496, rx: x, ry: 0.6041 })),
];

// ── timings do piscar (referência: comando.rs) ────────────────────────────────
const BLINK_MS = 300;
const SLOW_ON_MS = 300;
const SLOW_OFF_MS = 1700;
const SLOW_EDGE_MS = 150;

/** LED sobreposto: base dim sólida + camada acesa com opacidade animada (0..1). */
function OverlayLed({
  cx,
  cy,
  r,
  color,
  mode,
}: {
  cx: number;
  cy: number;
  r: number;
  color: 'green' | 'red';
  mode: LedMode;
}) {
  const opacity = useSharedValue(mode === 'on' ? 1 : 0);

  useEffect(() => {
    cancelAnimation(opacity);
    switch (mode) {
      case 'on':
        opacity.value = 1;
        break;
      case 'blink':
        opacity.value = 0;
        opacity.value = withRepeat(withTiming(1, { duration: BLINK_MS }), -1, true);
        break;
      case 'slow':
        opacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: SLOW_EDGE_MS }),
            withTiming(1, { duration: SLOW_ON_MS }),
            withTiming(0, { duration: SLOW_EDGE_MS }),
            withTiming(0, { duration: SLOW_OFF_MS }),
          ),
          -1,
          false,
        );
        break;
      default:
        opacity.value = 0;
    }
    return () => cancelAnimation(opacity);
  }, [mode, opacity]);

  const litStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const d = r * 2;
  const lit = color === 'green' ? ACTUATOR_COLORS.green : ACTUATOR_COLORS.red;
  const dim = color === 'green' ? DIM.green : DIM.red;

  return (
    <View position="absolute" left={cx - r} top={cy - r} width={d} height={d} br={r} bg={dim}>
      <Animated.View
        style={[{ width: d, height: d, borderRadius: r, backgroundColor: lit }, litStyle]}
      />
    </View>
  );
}

type Props = {
  cells: ActuatorCell[];
  locked: boolean;
  selectedIndex: number | null;
  /** Botão `index` desabilitado para toque. */
  isDisabled: (index: number) => boolean;
  lockDisabled: boolean;
  onSelect: (index: number) => void;
  onToggleLock: () => void;
};

export function ActuatorSvgPanel({
  cells,
  locked,
  selectedIndex,
  isDisabled,
  lockDisabled,
  onSelect,
  onToggleLock,
}: Props) {
  const [width, setWidth] = useState(0);
  const height = width / ASPECT;

  // Memoiza o SVG (parse caro) entre re-renders de estado dos LEDs/seleção.
  const svg = useMemo(
    () => (width > 0 ? <SvgXml xml={CA_SVG} width={width} height={height} /> : null),
    [width, height],
  );

  const btnR = BTN_R * width;
  const btnD = btnR * 2;

  return (
    <View width="100%" aspectRatio={ASPECT} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <>
          {svg}

          {cells.map((cell) => {
            const a = ANCHORS[cell.index - 1];
            if (!a) return null;
            const disabled = isDisabled(cell.index);
            const selected = selectedIndex === cell.index;
            return (
              <Fragment key={cell.index}>
                <OverlayLed
                  cx={a.gx * width}
                  cy={a.gy * height}
                  r={LED_R * width}
                  color="green"
                  mode={cell.green}
                />
                <OverlayLed
                  cx={a.rx * width}
                  cy={a.ry * height}
                  r={LED_R * width}
                  color="red"
                  mode={cell.red}
                />

                {selected ? (
                  <View
                    position="absolute"
                    left={a.bx * width - btnR}
                    top={a.by * height - btnR}
                    width={btnD}
                    height={btnD}
                    br={btnR}
                    borderWidth={3}
                    borderColor="$brand"
                  />
                ) : null}

                <View
                  position="absolute"
                  left={a.bx * width - btnR}
                  top={a.by * height - btnR}
                  width={btnD}
                  height={btnD}
                  br={btnR}
                  onPress={disabled ? undefined : () => onSelect(cell.index)}
                  cursor={disabled ? 'default' : 'pointer'}
                  accessibilityRole="button"
                  accessibilityState={{ selected, disabled }}
                  accessibilityLabel={`Atuador ${cell.index}`}
                />
              </Fragment>
            );
          })}

          {/* Cadeado travado: chip vermelho + cadeado amarelo sobre o pill. */}
          {locked ? (
            <View
              position="absolute"
              left={LOCK.x * width - btnR}
              top={LOCK.y * height - btnR}
              width={btnD}
              height={btnD}
              br={btnR}
              bg={ACTUATOR_COLORS.lock}
              ai="center"
              jc="center"
            >
              <Lock size={Math.max(10, btnR)} color={ACTUATOR_COLORS.lockIcon} />
            </View>
          ) : null}

          {/* Área de toque do pill de bloqueio. */}
          <View
            position="absolute"
            left={LOCK_PILL.x0 * width}
            top={LOCK_PILL.y0 * height}
            width={(LOCK_PILL.x1 - LOCK_PILL.x0) * width}
            height={(LOCK_PILL.y1 - LOCK_PILL.y0) * height}
            onPress={lockDisabled ? undefined : onToggleLock}
            cursor={lockDisabled ? 'default' : 'pointer'}
            accessibilityRole="button"
            accessibilityLabel={locked ? 'Desbloquear acionamento' : 'Bloquear acionamento'}
          />
        </>
      ) : null}
    </View>
  );
}
