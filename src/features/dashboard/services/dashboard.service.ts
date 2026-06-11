import { delay } from '@/utils/async.util';

import {
  dashboardSummarySchema,
  highlightSchema,
  type DashboardSummary,
  type Highlight,
} from '../schemas/dashboard.schema';

const HIGHLIGHTS_FIXTURE = [
  {
    id: 'destaque',
    tone: 'feature',
    tag: 'DESTAQUE',
    title: 'Tecnologia que\ntransforma o agro',
    subtitle: '@BE1tecnologia',
    branded: true,
  },
  {
    id: 'v128',
    tone: 'update',
    tag: 'ATUALIZAÇÃO',
    date: '10 jun 2026',
    title: 'Monitoramento v1.28\njá disponível',
    subtitle: 'Novos gráficos em tempo real e alarmes',
    branded: false,
  },
  {
    id: 'agrishow',
    tone: 'event',
    tag: 'EVENTO',
    date: '27/04 – 01/05',
    title: 'BE1 na Agrishow 2026',
    subtitle: 'Visite nosso estande e conheça as novidades',
    branded: false,
  },
  {
    id: 'secagem',
    tone: 'success',
    tag: 'CASO DE SUCESSO',
    title: 'Secagem inteligente\nreduz perdas no grão',
    subtitle: 'Até 18% menos perdas com o monitoramento BE1',
    branded: false,
  },
];

const SUMMARY_FIXTURE = {
  greeting: 'Bom dia,',
  accountName: 'Fazenda Santa Clara',
  notifications: 3,
  monogram: 'TB',
  deviceCount: 24,
  groupCount: 6,
};

export const dashboardService = {
  async getHighlights(): Promise<Highlight[]> {
    await delay(300);
    return highlightSchema.array().parse(HIGHLIGHTS_FIXTURE);
  },

  async getSummary(): Promise<DashboardSummary> {
    await delay(300);
    return dashboardSummarySchema.parse(SUMMARY_FIXTURE);
  },
};
