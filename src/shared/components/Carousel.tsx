import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import { View } from 'tamagui';

import { DotIndicator } from '@/shared/ui/DotIndicator';

/**
 * Auto-advancing horizontal carousel (dashboard highlights). Mirrors the
 * prototype's 4.2s auto-rotate with page dots overlaid bottom-right. Each child
 * is one full-width slide.
 */
type Props = {
  children: ReactNode[];
  /** Auto-advance interval (ms). Matches the prototype's 4200ms. */
  interval?: number;
  height: number;
};

export function Carousel({ children, interval = 4200, height }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const count = children.length;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const goTo = (i: number) => {
    const next = ((i % count) + count) % count;
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  };

  useEffect(() => {
    if (!width || count < 2) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % count;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, interval);
    return () => clearInterval(id);
  }, [width, count, interval]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View position="relative" br={20} overflow="hidden" onLayout={onLayout}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={{ height }}
      >
        {children.map((child, i) => (
          <View key={i} width={width} height={height}>
            {child}
          </View>
        ))}
      </ScrollView>
      <View position="absolute" bottom={13} right={18}>
        <DotIndicator count={count} active={index} onSelect={goTo} />
      </View>
    </View>
  );
}
