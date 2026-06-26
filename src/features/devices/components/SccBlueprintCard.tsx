import { Droplet, Thermometer } from '@tamagui/lucide-icons';
import { Fragment, useMemo, useState } from 'react';
import { SvgCss } from 'react-native-svg/css';
import { View, XStack } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import { BLUEPRINT_SVG } from '../assets/blueprintSvg';
import type { ChamberSnapshot } from '../schemas/device.schema';
import {
  ARROW_Y_NORM,
  BP_ASPECT,
  CHAMBER_ANCHORS,
  chamberKeyForAnchor,
} from '../utils/blueprintGeometry';
import { chamberPalette, type TempScale } from '../utils/chamberPalette';
import { SccArrowsStrip } from './SccArrowsStrip';

/**
 * Planta do SCC — o `blueprint.svg` do firmware (`be1-bananapi`) renderizado com
 * `react-native-svg`, reproduzindo o `gui::components::blueprint`:
 * - 8 câmaras recoloridas por temperatura (via `<style>` injetado);
 * - rótulos de temperatura (acima do divisor) e umidade (abaixo) por câmara +
 *   retorno, sobrepostos nas âncoras do firmware;
 * - setas de fluxo de ar por câmara (1..8) na faixa interna.
 */

const DIM_COLOR = '#8A99AC';
const HUMID_COLOR = '#335E7B'; // CHAMBER_HUMID do firmware.

type Chambers = Record<string, ChamberSnapshot> | null | undefined;

function buildStyleBlock(chambers: Chambers, scale: TempScale): string {
  let s = '<style>';
  for (let i = 1; i <= 8; i++) {
    const t = chambers?.[String(i)]?.temperature;
    if (t != null && !Number.isNaN(t)) {
      const { bg, fg } = chamberPalette(t, scale);
      s += `#chamber${i} .cf-fill{fill:${bg}}#chamber${i} .cf-border{stroke:${fg}}#chamber${i} .cf-circle{fill:${fg}}`;
    }
  }
  return s + '</style>';
}

/** Linha [ícone | valor], centrada — usada para temperatura e umidade. */
function ValueRow({
  Icon,
  text,
  color,
  fontPx,
}: {
  Icon: typeof Thermometer;
  text: string;
  color: string;
  fontPx: number;
}) {
  return (
    <XStack ai="center" gap={Math.max(1, Math.round(fontPx * 0.18))}>
      <Icon size={fontPx} color={color} />
      <Text fontSize={fontPx} fontWeight="700" color={color} numberOfLines={1}>
        {text}
      </Text>
    </XStack>
  );
}

type Props = {
  chambers: Chambers;
  scale: TempScale;
};

export function SccBlueprintCard({ chambers, scale }: Props) {
  const [width, setWidth] = useState(0);
  const height = width / BP_ASPECT;

  // Injeta o <style> dinâmico antes de </defs> (depois do autoral) — igual ao firmware.
  const xml = useMemo(() => {
    const block = buildStyleBlock(chambers, scale);
    const i = BLUEPRINT_SVG.indexOf('</defs>');
    return i >= 0 ? BLUEPRINT_SVG.slice(0, i) + block + BLUEPRINT_SVG.slice(i) : BLUEPRINT_SVG;
  }, [chambers, scale]);

  // SvgCss faz inlining de CSS (caro); memoiza por xml + largura.
  const svg = useMemo(
    () => (width > 0 ? <SvgCss xml={xml} width={width} height={width / BP_ASPECT} /> : null),
    [xml, width],
  );

  const unit = scale === 'celsius' ? '°C' : '°F';
  // Câmaras 1..8 com fonte maior; retorno menor (como no firmware).
  const chamberFont = Math.max(11, Math.min(17, width * 0.042));
  const retornoFont = Math.max(8, Math.min(12, width * 0.028));

  return (
    <Card p="$14" gap="$10">
      <Text fontSize={13} fontWeight="800" color="$text2" letterSpacing={0.4}>
        PLANTA DAS CÂMARAS
      </Text>
      <View
        width="100%"
        aspectRatio={BP_ASPECT}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {svg}

        {width > 0
          ? CHAMBER_ANCHORS.map((a, i) => {
              const snap = chambers?.[chamberKeyForAnchor(i)];
              const isRetorno = i === 8;
              const font = isRetorno ? retornoFont : chamberFont;
              const rowH = font * 1.35;
              const gap = Math.max(2, width * 0.006);

              const divX = a.divX * width;
              const divY = a.divY * height;
              const divW = a.divW * width;
              const cx = divX + divW / 2;

              const temp = snap?.temperature;
              const humid = snap?.humidity;
              const tempColor = temp != null ? chamberPalette(temp, scale).fg : DIM_COLOR;
              const tempText = temp != null ? `${Math.round(temp)}${unit}` : '—';
              const humidColor = humid != null ? HUMID_COLOR : DIM_COLOR;
              const humidText = humid != null ? `${Math.round(humid)}%` : '—';

              const arrows = snap?.arrows;
              const showArrows = !isRetorno && arrows != null && arrows.length > 0;
              const arrowScale = Math.max(0.5, Math.min(0.9, divW / 44));
              const arrowH = 30 * arrowScale + 6;
              const arrowW = divW * 2;
              const arrowY = ARROW_Y_NORM[i]! * height;

              return (
                <Fragment key={chamberKeyForAnchor(i)}>
                  {/* temperatura — acima do divisor */}
                  <View
                    position="absolute"
                    left={divX}
                    top={divY - rowH - gap}
                    width={divW}
                    height={rowH}
                    ai="center"
                    jc="flex-end"
                  >
                    <ValueRow Icon={Thermometer} text={tempText} color={tempColor} fontPx={font} />
                  </View>

                  {/* umidade — abaixo do divisor */}
                  <View
                    position="absolute"
                    left={divX}
                    top={divY + gap}
                    width={divW}
                    height={rowH}
                    ai="center"
                    jc="flex-start"
                  >
                    <ValueRow Icon={Droplet} text={humidText} color={humidColor} fontPx={font} />
                  </View>

                  {/* setas de fluxo (câmaras 1..8) */}
                  {showArrows ? (
                    <View
                      style={{
                        position: 'absolute',
                        left: cx - arrowW / 2,
                        top: arrowY - arrowH / 2,
                        width: arrowW,
                        height: arrowH,
                      }}
                    >
                      <SccArrowsStrip
                        arrows={arrows}
                        scale={arrowScale}
                        row={i >= 4 ? 'top' : 'bottom'}
                      />
                    </View>
                  ) : null}
                </Fragment>
              );
            })
          : null}
      </View>
    </Card>
  );
}
