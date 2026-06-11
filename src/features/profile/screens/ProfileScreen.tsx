import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings,
  ShieldCheck,
} from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { ErrorState } from '@/shared/components/ErrorState';
import { ListRow } from '@/shared/components/ListRow';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { Separator } from '@/shared/ui/Separator';
import { Switch } from '@/shared/ui/Switch';
import { Text } from '@/shared/ui/Text';

import { ProfileHeader } from '../components/ProfileHeader';
import { useProfile } from '../hooks/useProfile';

/** Client profile (screen 06). */
export function ProfileScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useProfile();
  const [twoFactor, setTwoFactor] = useState(true);

  if (isError) {
    return (
      <Screen tabBarSpacing>
        <ErrorState onRetry={() => void refetch()} />
      </Screen>
    );
  }
  if (isLoading || !data) {
    return (
      <Screen tabBarSpacing>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen scroll tabBarSpacing>
      {/* Header */}
      <XStack px="$16" pt="$4" pb="$6" ai="center" jc="space-between">
        <IconButton accessibilityLabel="Voltar" onPress={() => router.back()}>
          <ChevronLeft size={19} color="$text" />
        </IconButton>
        <Text fontSize="$17" fontWeight="800" color="$text">
          Meu Perfil
        </Text>
        <IconButton accessibilityLabel="Configurações">
          <Settings size={18} color="$text2" />
        </IconButton>
      </XStack>

      <YStack px="$16" gap="$13" pt="$6">
        <ProfileHeader profile={data} />

        {/* Personal info */}
        <Card radius={18} elevated>
          <ListRow
            icon={<Mail size={18} color="$brand" />}
            label="E-mail"
            title={data.email}
          />
          <Separator mx="$15" />
          <ListRow
            icon={<Phone size={18} color="$brand" />}
            label="Telefone celular"
            title={data.phone}
            mono
          />
          <Separator mx="$15" />
          <ListRow
            icon={<MapPin size={18} color="$brand" />}
            label="Estado"
            title={data.state}
          />
          <Separator mx="$15" />
          <ListRow
            icon={<CreditCard size={18} color="$brand" />}
            label="CPF"
            title={data.cpf}
            mono
          />
        </Card>

        <Button
          icon={<Pencil size={17} color="$white" />}
          accessibilityLabel="Editar informações"
        >
          Editar Informações
        </Button>

        {/* Account settings */}
        <Card radius={18} elevated>
          <Text
            fontSize="$10.5"
            fontWeight="800"
            color="$text3"
            letterSpacing={0.6}
            px="$15"
            pt="$11"
            pb="$7"
          >
            CONFIGURAÇÕES DA CONTA
          </Text>
          <ListRow
            icon={<Lock size={17} color="$text2" />}
            iconSize={32}
            title="Alterar senha"
            onPress={() => {}}
            right={<ChevronRight size={17} color="$text3" />}
          />
          <Separator mx="$15" />
          <ListRow
            icon={<Bell size={17} color="$text2" />}
            iconSize={32}
            title="Notificações"
            onPress={() => {}}
            right={
              <XStack ai="center" gap="$8">
                <Text fontSize="$11" fontWeight="700" color="$text3">
                  {data.notifications} novas
                </Text>
                <ChevronRight size={17} color="$text3" />
              </XStack>
            }
          />
          <Separator mx="$15" />
          <ListRow
            icon={<ShieldCheck size={17} color="$online" />}
            iconBg="$onlineSoft"
            iconSize={32}
            title="Autenticação 2FA"
            subtitle={twoFactor ? 'Ativada' : 'Desativada'}
            subtitleColor="$online"
            right={
              <Switch
                value={twoFactor}
                onValueChange={setTwoFactor}
                onColor="$online"
                accessibilityLabel="Autenticação de dois fatores"
              />
            }
          />
        </Card>
      </YStack>
    </Screen>
  );
}
