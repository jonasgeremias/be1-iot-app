# Requisitos — Telas de Dispositivo (Histórico · Eventos · Configuração)

> Levantados a partir do admin web `be1-dashboard` (`src/app/(site)/admin/iot/dispositivo/...`) em 2026-06-11.
> Objetivo: especificar a implementação dessas telas no app mobile (Expo Router + Tamagui).
> Tipos de dispositivo: **SCC**, **PP**, **BULK**, **GRANO**.

---

## 0. Mapa geral (o que existe em cada tela, por tipo)

| Tela             | SCC / PP / BULK                                                                                                                        | GRANO                                                                |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Eventos**      | ✅ `GET /iot/device/events` (severidade, período, paginação, metadata)                                                                 | ❌ não suportado no web                                              |
| **Histórico**    | ⚠️ no web é via **gráficos** (`/graficos`); não há tabela dedicada. No mobile já temos o histórico em gráfico embutido no "Tempo Real" | ✅ tabela paginada `POST /iot/grano/self/history` + export PDF/Excel |
| **Configuração** | ✅ **árvore de settings remota** via `GET/PUT /iot/device/settings` (hash de concorrência, MQTT)                                       | ✅ 3 formulários: silo, regras de excelência, parâmetros remotos     |

> ⚠️ Importante: a "Configuração" real do SCC/PP/BULK **não** é o mock atual (setpoints/soprador). É uma **árvore de configurações do dispositivo** (CB200, MQTT, alarmes, API, banco, etc.) buscada/aplicada via MQTT, com controle de concorrência por `hash`.

---

## 1. EVENTOS (SCC / PP / BULK)

A tela mais direta de implementar. GRANO não tem eventos no web.

### Endpoint

- `GET /iot/device/events`
- Headers: Bearer (já injetado pelo interceptor do mobile).

**Query params** (`IotDeviceEventsParams`):

```ts
{
  device: string;          // id do dispositivo (obrigatório)
  start?: string;          // ISO (filtro de período)
  end?: string;            // ISO
  severity?: 'I'|'W'|'E'|'C' | Array<'I'|'W'|'E'|'C'>;
  eventType?: string;      // (não usado na UI web)
  page?: number;           // 1-indexed (default 1)
  limit?: number;          // default 25
}
```

**Resposta** (`IotDeviceEventsResponse`):

```ts
{
  total: number;
  page: number;
  limit: number;
  data: Array<{
    id: string;
    deviceId: string;
    timeEmitted: string; // ISO
    severity: 'I' | 'W' | 'E' | 'C';
    eventType: string; // ex.: 'DEVICE_AUTH', 'DEVICE_POWER_ON', ...
    metadata?: unknown; // string ou JSON (admin)
  }>;
}
```

### Severidades

| Cód. | Label      | Cor                  | Ícone (sugestão lucide) |
| ---- | ---------- | -------------------- | ----------------------- |
| `I`  | Informação | `#1976D2` (azul)     | Info                    |
| `W`  | Aviso      | `#F57C00` (laranja)  | TriangleAlert           |
| `E`  | Erro       | `#E53935` (vermelho) | CircleX / OctagonAlert  |
| `C`  | Crítico    | `#7B1FA2` (roxo)     | ShieldAlert             |

### Tipos de evento (tradução PT-BR)

```ts
DEVICE_AUTH = 'Dispositivo autenticado';
DEVICE_POWER_ON = 'Dispositivo ligado';
DEVICE_CHANGE_RTC = 'RTC alterado';
USER_ACTION = 'Ação do usuário';
LOCAL_ACTION = 'Ação local';
CHANGE_SETTINGS_REMOTE = 'Configurações remotas alteradas';
CHANGE_DEVICE_SETTINGS = 'Configurações do dispositivo alteradas';
CHANGE_SILO_SETTINGS = 'Configurações do silo alteradas';
CHANGE_RULES_OF_EXCELLENCE_SETTINGS = 'Regras de excelência alteradas';
CHANGE_PENDULUMS_SETTINGS = 'Configurações dos pêndulos alteradas';
CHANGE_HUB_SETTINGS = 'Configurações do Hub alteradas';
CHANGE_HUB_SERVER_SETTINGS = 'Configurações do servidor do Hub alteradas';
```

- Tipo desconhecido → exibir o `eventType` cru.

### UI (web → mobile)

- **Linha/card por evento**: data (`dd/MM/yyyy HH:mm`), chip de severidade (cor + ícone), tipo traduzido.
- **Metadata**: só admin; tooltip com JSON (no mobile: expandir/colapsar ou tela de detalhe).
- **Filtros de período** (presets): Últimas 24h · Últimos 3 dias · Últimos 7 dias · Últimos 30 dias · Este mês · Mês anterior · (+ range customizado).
- **Filtro de severidade**: multi-seleção (default "Todas").
- **Paginação**: page size `[10, 25, 50, 100]` (default 25); "X–Y de N resultados".
- Cache sugerido: `staleTime` 30s, `keepPreviousData` (placeholderData).
- Empty states: "Selecione um período e clique em Buscar" / "Nenhum evento encontrado".

### Aplicabilidade

SCC / BULK / PP. **GRANO → não suportado** (mostrar aviso).

---

## 2. HISTÓRICO

### 2.1 SCC / PP / BULK

- No web, "histórico" desses tipos é exibido como **gráficos** (rota `/graficos`), não como tabela.
- No mobile, **já temos** o histórico em gráfico embutido na aba "Tempo Real" (por câmara no SCC; temp/umidade no PP/BULK).
- **Decisão a tomar:** a aba "Histórico" do mobile para esses tipos pode (a) reusar/abrigar esses gráficos, ou (b) ser substituída pela aba **Eventos**, ou (c) abrir os gráficos em tela cheia com seleção de período custom. Definir com requisitos.

### 2.2 GRANO (tabela paginada + export)

- `POST /iot/grano/self/history`

**Request** (`IRequesGranoHistoryFilters`):

```ts
{
  deviceId: string;
  subDeviceId: string;            // silo
  fromDate: string|Date|null;
  toDate: string|Date|null;
  page?: number;
  take?: number;                  // page size [10,50,100], default 10
  orderBy?: { field: string; direction: 'asc'|'desc' };  // default eventDate asc
}
```

**Resposta** (`IGranoHistoryResponse`):

```ts
{ data: IGranoHistory[]; filters: IRequesGranoHistoryFilters; totalItems: number }
```

`IGranoHistory.data` (após flatten de `status`+`status2`): `eventDate`, `temperatureUnit('C'|'F')`, `externalTemperature`, `relativeHumidity`, `internalTemperature`, `internalTempDifference`, `maxInternalTemperature`, `minInternalTemperature`, `flags`, setpoints, `pendulumInfo` (mapa pêndulo→array de sensores).

**Colunas da tabela**: Evento (`eventNumber`) · Data (`dd/MM/yyyy HH:mm`) · Umidade Rel. (`%`) · Temp. Externa · Temp. Interna · Dif. Temp · Aerador (Ligado/Desligado) · Modo de Operação (flags coloridas).

**Flags (cor)**:

- Seleção: `recommendedSelection`=Recomendada (verde), `possibleSelection`=Possível (laranja), `dryingRiskSelection`=Risco de secagem (cinza), `noInterestSelection`=Sem interesse (amarelo).
- Grupo: `coolingGroup`=Resfriamento (`#16BDFF`), `dryingGroup`=Secagem (laranja), `conservationGroup`=Conservação (verde).

**Export**: `POST /iot/grano/self/history/export-history-pdf` e `.../export-history-excel` (responseType blob; nome do arquivo no header `Content-Disposition`). No mobile, exportar/baixar requer `expo-file-system` + `expo-sharing` (a definir).

**Detalhe**: clicar numa linha converte o histórico para "realtime" e abre o card completo do GRANO.

> GRANO é placeholder no mobile hoje — só implementar se entrar no escopo.

---

## 3. CONFIGURAÇÃO

### 3.1 SCC / PP / BULK — árvore de settings remota (via MQTT)

Roteamento por tipo: SCC e BULK/PP compartilham a **mesma** tela (placa CB200).

**Buscar settings:**

- `GET /iot/device/settings?deviceId={id}&timeoutMs={opt}` (headers no-cache).

**Resposta:**

```ts
{
  error: boolean; message: string;
  data: {
    settings: Record<string, unknown>;  // árvore aninhada snake_case
    hash: string;                        // 16 hex (controle de concorrência)
    applied?: boolean; id?: string; error?: string|null;
  }
}
```

**Aplicar (patch):**

- `PUT /iot/device/settings`

```ts
{ deviceId: string; settings: Record<string,unknown> /* só os campos alterados */; hash: string; timeoutMs?: number }
```

- Enviar **apenas o diff** (deepDiff entre buscado e editado). Resposta traz a árvore atualizada + novo `hash`.

**Seções da árvore** (label PT-BR): `device` (Dispositivo), `cb200` (CB-200), `pc_agricola` (PC-Agrícola), `alarms` (Alarmes), `mqtt` (MQTT), `api` (API), `database` (Banco de dados), `snapshot` (Snapshot), `led` (LED de status), `chart` (Gráfico), `time_service` (Serviço de hora), `usb_export` (Exportação USB), `ota` (OTA), `tables` (Tabelas).

**Render por tipo de valor** (genérico):

- `boolean` → Switch.
- `number` → input numérico.
- `string` → input texto.
- Campos enumerados (ex.: `device_type` → SCC/PP/BULK) → Select.
- Exemplos de campos: `cb200.port`, `cb200.baud`, `cb200.poll_interval_ms`, `alarms.temp_low`/`temp_high` (°C), `alarms.high_variation_threshold_f` (°F), `mqtt.host`, `mqtt.tls_enabled`, etc.

**Regras de negócio:**

1. **Concorrência por hash:** todo GET devolve `hash`; o PUT precisa enviar o mesmo. Se estiver desatualizado → erro "Configurações desatualizadas… clique em Buscar".
2. **Avisos por seção:** alterar `mqtt` (host/porta/TLS/timeouts) pode reconectar/derrubar o device; alterar `device.device_type` muda o namespace MQTT (desencorajado).
3. **Contador de alterações:** "N campo(s) alterado(s)"; botão **Salvar** desabilitado se 0.
4. **Buscar** com alterações pendentes → diálogo "Descartar e buscar".
5. Permissões: admin vê aba extra "Dispositivo" (CRUD); usuário comum vê só "Configuração Remota".

> Esta é uma tela **complexa** (editor de árvore dinâmica). Para o mobile, avaliar um MVP: renderizar seções como accordions com os campos editáveis, diff + hash + salvar.

### 3.2 GRANO — 3 formulários

Requer `subDeviceId` (silo). Cada um tem GET e SET próprios (todos `POST`):

**a) Silo** — `POST /iot/grano/self/get-silo-settings` / `.../upsert-silo-settings`
Campos: `name` (req, ≤32), `identificationCode` (≤20), `storedGrainType` (≤32), `capacity` (>0, t), datas (`constructionDate ≤ lastMaintenanceDate ≤ nextMaintenanceDate`, `loadingDate`), `loadedQuantity` (≥0, t).

**b) Regras de Excelência** — `POST /iot/grano/self/get-rules-of-excellence` / `.../upsert-rules-of-excellence`
8 faixas de temperatura (°C), cada uma `{min,max}` (-30..392, passo 0.1, min≤max). Defaults: Excelente 0–8, Ótimo 8–12, Bom 12–18, Regular 18–25, Irregular 25–28, Mal 28–32, Ruim 32–38, Péssimo 38–255 (com cores por faixa).

**c) Parâmetros remotos** — `POST /iot/grano/self/get-remote-params` / `.../set-remote-params`
`sensorQuantity` (>0), `mode` (`0`=AUTO/Automático, `1`=MANUAL).

---

## 4. Modelos (TypeScript) — resumo p/ Zod no mobile

```ts
// Eventos
type IotEventSeverity = 'I' | 'W' | 'E' | 'C';
interface IotDeviceEvent {
  id;
  deviceId;
  timeEmitted: string;
  severity: IotEventSeverity;
  eventType: string;
  metadata?: unknown;
}
interface IotDeviceEventsResponse {
  total: number;
  page: number;
  limit: number;
  data: IotDeviceEvent[];
}

// Settings (SCC/PP/BULK)
interface IotDeviceSettingsData {
  settings: Record<string, unknown>;
  hash: string;
  applied?: boolean;
  id?: string;
  error?: string | null;
}
interface IotDeviceSettingsResponse {
  error: boolean;
  message: string;
  data: IotDeviceSettingsData;
}
```

---

## 5. Recomendação de implementação (ordem sugerida)

1. **Eventos (SCC/PP/BULK)** — endpoint limpo e bem definido; alto valor, baixo risco. → nova aba/tela com lista paginada + filtros de período/severidade.
2. **Configuração (SCC/PP/BULK)** — substituir o mock atual pela árvore de settings real (GET/PUT `/iot/device/settings` com hash). MVP por accordions de seção. Maior esforço.
3. **Histórico** — decidir o destino da aba para SCC/PP/BULK (gráficos existentes vs Eventos). GRANO (tabela+export) só se entrar no escopo.

## 6. Perguntas em aberto (precisam de definição)

- A aba **Histórico** do mobile (SCC/PP/BULK) vira **Eventos**, vira **gráficos em tela cheia**, ou as duas como abas separadas?
- A **Configuração** real (árvore de settings) deve ser editável no app por usuário comum, ou só leitura + admin edita? (no web, comum também edita).
- **GRANO** entra no escopo do mobile agora (config/histórico/export) ou fica para depois?
- Export PDF/Excel (GRANO) no mobile: necessário? (precisa `expo-file-system`/`expo-sharing`).
- Endpoints exatos do export GRANO (confirmar caminho: `/iot/grano/self/export-history-pdf` vs `/iot/grano/self/history/export-...`).
