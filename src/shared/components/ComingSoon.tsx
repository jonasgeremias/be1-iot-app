import { Hammer } from '@tamagui/lucide-icons';

import { Screen } from '@/shared/layouts/Screen';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';

/**
 * Placeholder for screens not yet built in the current vertical slice
 * (Perfil, Assistências, device Configuração/Histórico). Replaced by the full
 * implementation in the next phase.
 */
export function ComingSoon({ title }: { title: string }) {
  return (
    <Screen tabBarSpacing>
      <AppHeader title={title} />
      <EmptyState
        title="Em breve"
        description="Esta tela faz parte da próxima etapa do redesenho."
        icon={<Hammer size={32} color="$brand" />}
      />
    </Screen>
  );
}
