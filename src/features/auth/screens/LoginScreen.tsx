import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Mail, Lock } from '@tamagui/lucide-icons';
import { Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View, XStack, YStack } from 'tamagui';

import { appConfig } from '@/config/app.config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/shared/ui/Button';
import { BrandGradient } from '@/shared/ui/BrandGradient';
import { Input } from '@/shared/ui/Input';
import { Card } from '@/shared/ui/Card';
import { Separator } from '@/shared/ui/Separator';
import { Switch } from '@/shared/ui/Switch';
import { MonoText, Text } from '@/shared/ui/Text';

import { useLogin } from '../hooks/useLogin';
import { useRememberedLoginEmail } from '../hooks/useRememberedLoginEmail';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';

const logo = require('@/assets/images/be1-white.png');

/** Login & authentication (screen 01). */
export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, setValue } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: true },
    mode: 'onTouched',
  });

  useRememberedLoginEmail(setValue);

  const onSubmit = (values: LoginInput) => login.mutate(values);

  const errorMessage = login.isError
    ? (login.error as { status?: number; message?: string })?.status === 401
      ? 'E-mail/CPF ou senha inválidos.'
      : ((login.error as { message?: string })?.message ??
        'Não foi possível entrar. Tente novamente.')
    : null;

  return (
    <YStack flex={1} bg="$bg">
      <ScrollView
        flex={1}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand header */}
        <BrandGradient
          from="brandGrad1"
          to="brandGrad2"
          start={[0.2, 0]}
          end={[0.85, 1]}
          style={{ borderBottomLeftRadius: 34, borderBottomRightRadius: 34 }}
        >
          <View
            position="absolute"
            right={-46}
            top={30}
            width={208}
            height={208}
            br={104}
            borderWidth={1}
            borderColor="$whiteA13"
          />
          <View
            position="absolute"
            right={6}
            top={84}
            width={124}
            height={124}
            br={62}
            borderWidth={1}
            borderColor="$whiteA13"
          />
          <YStack pt={insets.top + 18} pb="$34" px="$26" ai="center">
            <Image
              source={logo}
              style={{ height: 52, width: 140, resizeMode: 'contain' }}
              accessibilityLabel="BE1"
            />
            <Text
              col="$white"
              fontSize="$21"
              fontWeight="800"
              mt="$20"
              ta="center"
              letterSpacing={-0.4}
            >
              Monitoramento que{'\n'}transforma o agro
            </Text>
            <Text col="$whiteA82" fontSize="$12.5" mt="$8">
              Seus dispositivos, em tempo real
            </Text>
          </YStack>
        </BrandGradient>

        {/* Form card (overlaps header) */}
        <YStack px="$20" mt={-26} gap="$20">
          <Card radius={22} p="$20" elevated>
            <Text fontSize="$18" fontWeight="800" color="$text">
              Bem-vindo de volta
            </Text>
            <Text fontSize="$12.5" color="$text2" mt="$3" mb="$20">
              Acesse sua conta para continuar
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <YStack mb="$16">
                  <Input
                    label="E-mail ou CPF"
                    accessibilityLabel="E-mail ou CPF"
                    icon={<Mail size={19} color="$text3" />}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="seu@email.com ou CPF"
                  />
                  {fieldState.error ? (
                    <Text color="$red" fontSize="$11" mt="$6">
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </YStack>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <YStack>
                  <Input
                    label="Senha"
                    accessibilityLabel="Senha"
                    icon={<Lock size={19} color="$text3" />}
                    iconAfter={
                      <View
                        onPress={() => setShowPassword((v) => !v)}
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword ? 'Ocultar senha' : 'Mostrar senha'
                        }
                        cursor="pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={19} color="$text3" />
                        ) : (
                          <Eye size={19} color="$text3" />
                        )}
                      </View>
                    }
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                  />
                  {fieldState.error ? (
                    <Text color="$red" fontSize="$11" mt="$6">
                      {fieldState.error.message}
                    </Text>
                  ) : null}
                </YStack>
              )}
            />

            <XStack ai="center" jc="space-between" my="$16">
              <Controller
                control={control}
                name="remember"
                render={({ field }) => (
                  <XStack ai="center" gap="$9">
                    <Switch
                      size="sm"
                      value={field.value}
                      onValueChange={field.onChange}
                      accessibilityLabel="Lembrar acesso"
                    />
                    <Text fontSize="$12.5" color="$text2" fontWeight="600">
                      Lembrar acesso
                    </Text>
                  </XStack>
                )}
              />
              <Text
                fontSize="$12.5"
                fontWeight="700"
                color="$brand"
                onPress={() => router.push('/(auth)/forgot-password')}
                accessibilityRole="button"
                accessibilityLabel="Esqueci a senha"
              >
                Esqueci a senha
              </Text>
            </XStack>

            {errorMessage ? (
              <Text color="$red" fontSize="$11.5" mb="$10" ta="center" fontWeight="600">
                {errorMessage}
              </Text>
            ) : null}

            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={login.isPending}
              opacity={login.isPending ? 0.7 : 1}
              iconAfter={<ArrowRight size={18} color="$white" />}
            >
              {login.isPending ? 'Entrando…' : 'Entrar'}
            </Button>
          </Card>

          <XStack ai="center" gap="$12" px="$4">
            <Separator flex={1} />
            <Text fontSize="$11" color="$text3">
              ou
            </Text>
            <Separator flex={1} />
          </XStack>

          <Button variant="outline">Falar com o suporte</Button>

          <MonoText
            ta="center"
            color="$text3"
            fontSize="$10.5"
            py="$18"
            letterSpacing={0.4}
          >
            {appConfig.company} · {appConfig.appVersion}
          </MonoText>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
