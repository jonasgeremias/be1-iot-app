import {
  Calendar,
  ChevronLeft,
  CreditCard,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
  X,
} from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { ErrorState } from '@/shared/components/ErrorState';
import { ListRow } from '@/shared/components/ListRow';
import { LoadingState } from '@/shared/components/LoadingState';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { IconButton } from '@/shared/ui/IconButton';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Separator } from '@/shared/ui/Separator';
import { Text } from '@/shared/ui/Text';
import {
  formatCPF,
  formatDateBr,
  formatPhone,
  monogramOf,
  onlyDigits,
} from '@/utils/format.util';

import { useLogout } from '@/hooks/useLogout';

import { ProfileHeader } from '../components/ProfileHeader';
import { useLocations } from '../hooks/useLocations';
import { useProfile } from '../hooks/useProfile';
import { useUpdateAvatar } from '../hooks/useUpdateAvatar';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import type { ProfileUpdateInput } from '../schemas/profile.schema';

function brToIso(s: string): string | undefined {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return undefined;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** Client profile with inline edit + logout (screen 06, be1-app parity). */
export function ProfileScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, userId } = useProfile();
  const update = useUpdateProfile(userId);
  const avatar = useUpdateAvatar();
  const logout = useLogout();

  const [editing, setEditing] = useState(false);

  // editable fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [birth, setBirth] = useState('');
  const [stateId, setStateId] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);

  const { statesOptions, citiesOptions, isStatesLoading, isCitiesLoading } =
    useLocations(stateId);

  useEffect(() => {
    if (!data) return;
    setName(data.name ?? '');
    setPhone(formatPhone(data.phone ?? ''));
    setCpf(formatCPF(data.cpf ?? ''));
    setBirth(formatDateBr(data.birthdate));
    setStateId(data.cityRelation?.stateId ?? null);
    setCityId(data.cityId ?? null);
  }, [data]);

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

  const role = data.roles?.[0]?.name ?? 'Usuário';
  const city = data.cityRelation?.name ?? '';
  const stateLabel =
    data.cityRelation?.state?.uf ?? data.cityRelation?.state?.name ?? '';
  const location = [city, stateLabel].filter(Boolean).join(' · ');
  const imageUrl = data.avatarUrl ?? data.avatar ?? null;

  const canSave =
    name.trim() !== '' &&
    onlyDigits(cpf).length === 11 &&
    onlyDigits(phone).length === 11;

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const a = res.assets[0];
    await avatar.mutateAsync({
      uri: a.uri,
      name: a.fileName ?? 'avatar.jpg',
      type: a.mimeType ?? 'image/jpeg',
    });
  };

  const handleSave = async () => {
    const payload: ProfileUpdateInput = {
      name: name.trim(),
      phone: onlyDigits(phone),
      cpf: onlyDigits(cpf),
    };
    const iso = brToIso(birth);
    if (iso) payload.birthdate = iso;
    if (cityId) payload.cityId = cityId;
    await update.mutateAsync(payload);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setName(data.name ?? '');
    setPhone(formatPhone(data.phone ?? ''));
    setCpf(formatCPF(data.cpf ?? ''));
    setBirth(formatDateBr(data.birthdate));
    setStateId(data.cityRelation?.stateId ?? null);
    setCityId(data.cityId ?? null);
  };

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
        {editing ? (
          <IconButton accessibilityLabel="Cancelar edição" onPress={cancelEdit}>
            <X size={18} color="$text2" />
          </IconButton>
        ) : (
          <IconButton accessibilityLabel="Sair" onPress={() => void logout()}>
            <LogOut size={18} color="$red" />
          </IconButton>
        )}
      </XStack>

      <YStack px="$16" gap="$13" pt="$6">
        <ProfileHeader
          name={data.name}
          role={role}
          location={location}
          monogram={monogramOf(data.name)}
          imageUrl={imageUrl}
          onEditAvatar={() => void pickAvatar()}
        />

        {/* Personal info */}
        <Card radius={18} elevated>
          <ListRow
            icon={<Mail size={18} color="$brand" />}
            label="E-mail"
            title={data.email || '—'}
          />

          {editing ? (
            <YStack px="$15" pt="$8" pb="$13" gap="$13">
              <YStack>
                <Input
                  label="Nome"
                  accessibilityLabel="Nome"
                  icon={<User size={18} color="$text3" />}
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  autoCapitalize="sentences"
                />
              </YStack>
              <YStack>
                <Input
                  label="Telefone"
                  accessibilityLabel="Telefone"
                  icon={<Phone size={18} color="$text3" />}
                  value={phone}
                  onChangeText={(t) => setPhone(formatPhone(t))}
                  placeholder="(00) 0 0000-0000"
                />
              </YStack>
              <YStack>
                <Input
                  label="CPF"
                  accessibilityLabel="CPF"
                  icon={<CreditCard size={18} color="$text3" />}
                  value={cpf}
                  onChangeText={(t) => setCpf(formatCPF(t))}
                  placeholder="000.000.000-00"
                />
              </YStack>
              <YStack>
                <Input
                  label="Nascimento"
                  accessibilityLabel="Data de nascimento"
                  icon={<Calendar size={18} color="$text3" />}
                  value={birth}
                  onChangeText={setBirth}
                  placeholder="dd/mm/aaaa"
                />
              </YStack>
              <YStack>
                <Select
                  label="Estado"
                  accessibilityLabel="Estado"
                  value={stateId}
                  options={statesOptions}
                  loading={isStatesLoading}
                  placeholder="Selecione o estado"
                  onChange={(v) => {
                    setStateId(v);
                    setCityId(null);
                  }}
                />
              </YStack>
              <YStack>
                <Select
                  label="Cidade"
                  accessibilityLabel="Cidade"
                  value={cityId}
                  options={citiesOptions}
                  loading={isCitiesLoading}
                  disabled={!stateId}
                  placeholder={
                    stateId ? 'Selecione a cidade' : 'Selecione o estado primeiro'
                  }
                  onChange={(v) => setCityId(v)}
                />
              </YStack>
            </YStack>
          ) : (
            <>
              <Separator mx="$15" />
              <ListRow
                icon={<Phone size={18} color="$brand" />}
                label="Telefone celular"
                title={data.phone ? formatPhone(data.phone) : '—'}
                mono
              />
              <Separator mx="$15" />
              <ListRow
                icon={<MapPin size={18} color="$brand" />}
                label="Localização"
                title={location || '—'}
              />
              <Separator mx="$15" />
              <ListRow
                icon={<CreditCard size={18} color="$brand" />}
                label="CPF"
                title={data.cpf ? formatCPF(data.cpf) : '—'}
                mono
              />
              <Separator mx="$15" />
              <ListRow
                icon={<Calendar size={18} color="$brand" />}
                label="Nascimento"
                title={formatDateBr(data.birthdate) || '—'}
                mono
              />
            </>
          )}
        </Card>

        {update.isError ? (
          <Text fontSize="$11" color="$red">
            Não foi possível salvar. Tente novamente.
          </Text>
        ) : null}

        {editing ? (
          <YStack gap="$8">
            <Button
              onPress={() => void handleSave()}
              disabled={!canSave || update.isPending}
              opacity={!canSave || update.isPending ? 0.6 : 1}
            >
              {update.isPending ? 'Salvando…' : 'Salvar alterações'}
            </Button>
            <Button variant="ghost" onPress={cancelEdit}>
              Cancelar
            </Button>
          </YStack>
        ) : (
          <Button
            icon={<Pencil size={17} color="$white" />}
            accessibilityLabel="Editar informações"
            onPress={() => setEditing(true)}
          >
            Editar Informações
          </Button>
        )}

        {/* Logout */}
        <Button
          variant="outline"
          icon={<LogOut size={17} color="$red" />}
          accessibilityLabel="Sair da conta"
          onPress={() => void logout()}
        >
          Sair
        </Button>
      </YStack>
    </Screen>
  );
}
