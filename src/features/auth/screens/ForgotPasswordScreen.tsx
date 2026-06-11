import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View, XStack, YStack } from 'tamagui';

import { AppHeader } from '@/shared/components/AppHeader';
import { Screen } from '@/shared/layouts/Screen';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { MonoText, Text } from '@/shared/ui/Text';

import { useForgotPassword } from '../hooks/useForgotPassword';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '../schemas/auth.schema';

const STEPS = [
  'Solicite o link pelo e-mail',
  'Confirme no e-mail recebido',
  'Defina uma nova senha',
];

/** Account recovery (screen 10). */
export function ForgotPasswordScreen() {
  const router = useRouter();
  const forgot = useForgotPassword();

  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  const onSubmit = (values: ForgotPasswordInput) =>
    forgot.mutate(values.email);

  return (
    <Screen scroll bg="$bg">
      <AppHeader
        title="Recuperar conta"
        titleSize="$17"
        onBack={() => router.back()}
      />

      <YStack px="$22" pt="$14">
        <YStack ai="center" mt="$8">
          <View width={74} height={74} br={22} bg="$brandSoft" ai="center" jc="center">
            <Mail size={36} color="$brand" />
          </View>
          <Text fontSize="$21" fontWeight="800" color="$text" mt="$18" letterSpacing={-0.3}>
            Esqueceu a senha?
          </Text>
          <Text fontSize="$13" color="$text2" mt="$8" ta="center" maxWidth={280} lineHeight={19}>
            Informe o e-mail cadastrado e enviaremos um link para você redefinir o
            acesso.
          </Text>
        </YStack>

        <YStack mt="$24">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <YStack mb="$18">
                <Input
                  label="E-mail da conta"
                  tone="$surface"
                  accessibilityLabel="E-mail da conta"
                  icon={<Mail size={19} color="$text3" />}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                />
                {fieldState.error ? (
                  <Text color="$red" fontSize="$11" mt="$6">
                    {fieldState.error.message}
                  </Text>
                ) : null}
              </YStack>
            )}
          />

          <Button
            height={52}
            onPress={handleSubmit(onSubmit)}
            disabled={forgot.isPending}
            opacity={forgot.isPending ? 0.7 : 1}
          >
            {forgot.isSuccess
              ? 'Link enviado!'
              : forgot.isPending
                ? 'Enviando…'
                : 'Enviar link de recuperação'}
          </Button>
        </YStack>

        <Card radius={18} p="$15" mt="$26" elevated>
          <Text
            fontSize="$10.5"
            fontWeight="800"
            color="$text3"
            letterSpacing={0.6}
            mb="$12"
          >
            COMO FUNCIONA
          </Text>
          {STEPS.map((label, i) => {
            const active = i === 0;
            return (
              <XStack key={label} ai="center" gap="$12" mb={i < 2 ? '$11' : 0}>
                <View
                  width={26}
                  height={26}
                  br={13}
                  ai="center"
                  jc="center"
                  bg={active ? '$brand' : '$surface3'}
                >
                  <MonoText
                    fontSize="$12"
                    fontWeight="800"
                    color={active ? '$white' : '$text2'}
                  >
                    {i + 1}
                  </MonoText>
                </View>
                <Text
                  fontSize="$12.5"
                  fontWeight="600"
                  color={active ? '$text' : '$text2'}
                >
                  {label}
                </Text>
              </XStack>
            );
          })}
        </Card>

        <XStack jc="center" mt="$26" py="$18">
          <Text fontSize="$13" color="$text2">
            Lembrou a senha?{' '}
            <Text
              fontSize="$13"
              fontWeight="800"
              color="$brand"
              onPress={() => router.replace('/(auth)/login')}
              accessibilityRole="button"
              accessibilityLabel="Entrar"
            >
              Entrar
            </Text>
          </Text>
        </XStack>
      </YStack>
    </Screen>
  );
}
