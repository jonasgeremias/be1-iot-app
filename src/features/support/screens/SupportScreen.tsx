import { ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { View, XStack, YStack } from 'tamagui';

import { AppHeader } from '@/shared/components/AppHeader';
import { ErrorState } from '@/shared/components/ErrorState';
import { ListRow } from '@/shared/components/ListRow';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Separator } from '@/shared/ui/Separator';
import { MonoText, Text } from '@/shared/ui/Text';

import { SupportHero } from '../components/SupportHero';
import { useSupportInfo } from '../hooks/useSupportInfo';

/** Assistências · Contato (screen 08). */
export function SupportScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useSupportInfo();

  if (isError) {
    return (
      <Screen tabBarSpacing>
        <AppHeader title="Assistências" onBack={() => router.back()} />
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }
  if (isLoading || !data) {
    return (
      <Screen tabBarSpacing>
        <AppHeader title="Assistências" onBack={() => router.back()} />
        <LoadingState />
      </Screen>
    );
  }

  const digits = data.whatsapp.replace(/\D/g, '');
  const openWhatsApp = () => Linking.openURL(`https://wa.me/55${digits}`);
  const openPhone = () => Linking.openURL(`tel:+55${digits}`);
  const openEmail = () => Linking.openURL(`mailto:${data.email}`);

  return (
    <Screen scroll tabBarSpacing>
      <AppHeader
        title="Assistências"
        subtitle="Fale com o suporte BE1"
        onBack={() => router.back()}
      />

      <YStack px="$16" gap="$13" pt="$2">
        <SupportHero online={data.online} />

        <Card radius={18} elevated>
          {/* WhatsApp row */}
          <XStack ai="center" gap="$13" px="$15" py="$14" bg="$onlineSoft">
            <XStack
              width={38}
              height={38}
              br={11}
              ai="center"
              jc="center"
              bg="$whatsapp"
              flexShrink={0}
            >
              <MessageCircle size={20} color="$white" />
            </XStack>
            <YStack flex={1} minWidth={0}>
              <Text fontSize="$10.5" fontWeight="700" color="$whatsappInk">
                WhatsApp · toque para chamar
              </Text>
              <MonoText fontSize="$14" fontWeight="800" color="$text">
                {data.whatsapp}
              </MonoText>
            </YStack>
            <XStack
              ai="center"
              gap="$5"
              bg="$whatsapp"
              px="$12"
              py="$8"
              br={10}
              onPress={openWhatsApp}
              accessibilityRole="button"
              accessibilityLabel="Chamar no WhatsApp"
              cursor="pointer"
              pressStyle={{ opacity: 0.9 }}
            >
              <Text fontSize="$12" fontWeight="800" color="$white">
                Chamar
              </Text>
              <ChevronRight size={14} color="$white" />
            </XStack>
          </XStack>
          <Separator mx="$15" />
          <ListRow
            icon={<Mail size={19} color="$brand" />}
            iconBg="$brandSoft"
            iconSize={36}
            label="E-mail"
            title={data.email}
          />
          <Separator mx="$15" />
          <ListRow
            icon={<MapPin size={19} color="$brand" />}
            iconBg="$brandSoft"
            iconSize={36}
            label="Endereço"
            title={data.address}
          />
          <Separator mx="$15" />
          <ListRow
            icon={<Clock size={19} color="$brand" />}
            iconBg="$brandSoft"
            iconSize={36}
            label="Horário de atendimento"
            title={data.hours}
          />
        </Card>

        <XStack gap="$11">
          <View flex={1}>
            <Button variant="outline" onPress={openPhone} icon={<Phone size={17} color="$brand" />}>
              Ligar
            </Button>
          </View>
          <View flex={1}>
            <Button variant="outline" onPress={openEmail} icon={<Mail size={17} color="$brand" />}>
              E-mail
            </Button>
          </View>
        </XStack>
      </YStack>
    </Screen>
  );
}
