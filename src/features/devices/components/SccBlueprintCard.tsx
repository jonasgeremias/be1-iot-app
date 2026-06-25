import { useMemo, useState } from 'react';
import { SvgCss } from 'react-native-svg/css';
import { View } from 'tamagui';

import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import { BLUEPRINT_SVG } from '../assets/blueprintSvg';
import type { ChamberSnapshot } from '../schemas/device.schema';
import { chamberPalette, type TempScale } from '../utils/chamberPalette';

/**
 * Planta do SCC — o `blueprint.svg` do firmware (`be1-bananapi`) renderizado com
 * `react-native-svg`, com as 8 câmaras recoloridas por temperatura. Reproduz o
 * `gui::components::blueprint`: injeta um `<style>` antes de `</defs>` com
 * `#chamberN .cf-fill/.cf-border/.cf-circle` por câmara (1..8). O retorno
 * (idx 9) fica na cor neutra do SVG, igual ao firmware.
 */

// viewBox do blueprint.svg.
const BP_W = 20271.81;
const BP_H = 21891.24;
const BP_ASPECT = BP_W / BP_H;

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

type Props = {
  chambers: Chambers;
  scale: TempScale;
};

export function SccBlueprintCard({ chambers, scale }: Props) {
  const [width, setWidth] = useState(0);

  // Injeta o <style> dinâmico antes de </defs> (depois do style autoral, p/ vencer
  // por igualdade de especificidade) — igual ao `inject_style` do firmware.
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
      </View>
    </Card>
  );
}
