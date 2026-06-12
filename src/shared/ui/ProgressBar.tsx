import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, View } from 'tamagui';

/**
 * Gauge / progress track — the temperature & humidity bars on the device
 * detail. Supports a solid fill or the online→amber gradient, plus the small
 * vertical "current value" marker the prototype draws over the track.
 */
type Props = {
  /** 0–100 percentage of the track to fill. */
  value: number;
  fill?: '$brand' | '$online' | '$amber';
  /** Use the online→amber gradient fill (temperature gauge). */
  gradient?: boolean;
  showMarker?: boolean;
  height?: number;
};

export function ProgressBar({
  value,
  fill = '$brand',
  gradient = false,
  showMarker = false,
  height = 8,
}: Props) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View height={height} br={5} bg="$track" position="relative" overflow="visible">
      <View
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        width={`${pct}%`}
        br={5}
        overflow="hidden"
      >
        {gradient ? (
          <LinearGradient
            colors={[theme.online.get(), theme.amber.get()]}
            start={[0, 0.5]}
            end={[1, 0.5]}
            style={{ flex: 1 }}
          />
        ) : (
          <View flex={1} bg={fill} />
        )}
      </View>
      {showMarker ? (
        <View
          position="absolute"
          left={`${pct}%`}
          top={-2}
          bottom={-2}
          width={3}
          br={2}
          bg="$text"
        />
      ) : null}
    </View>
  );
}
