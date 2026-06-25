# Plano — Controle de Atuadores (Caixa de Comando) no Tempo Real do SCC

> **Projeto principal:** `app-react-native` (BE1 Monitoramento — Expo Router + Tamagui).
> **Projetos relacionados:** `be1-server` (API — alteração necessária, **rota flexível**) e
> `be1-bananapi` (firmware do hardware — referência visual e contrato MQTT, **sem alteração**).
> **Referência visual/UX:** `be1-bananapi/src/gui/components/comando.rs` + `assets/images/ca.svg`.
> **Alvo no app:** um **botão na tela de detalhe do SCC** (aba "Tempo Real") que abre uma
> **tela dedicada** com a caixa de comando, **apenas para dispositivos SCC**.
> **Status:** plano (não implementado). Atualizado em 2026-06-25.
> Leia junto com `docs/technical-spec.md` (normativo).

---

## 1. Objetivo

Na **tela de detalhe do SCC** (`DeviceRealtimeScreen`, aba "Tempo Real") adicionar um **botão**
que abre uma **tela dedicada** com o painel de **visualização e acionamento remoto** dos 16
atuadores da caixa de comando (PC‑Agrícola): ver o estado ao vivo e comandar os atuadores,
**sempre via API HTTP** (nunca MQTT direto no app), reaproveitando design system, padrões
visuais e comportamento do painel COMANDO do `bananapi`.

**Execução começa pela parte visual** (ver §11): construir o painel e toda a interação na UI
primeiro — a leitura do estado já existe na API —, e só depois ligar o envio do comando ao
backend.

---

## 2. Referência: o painel COMANDO do bananapi

Firmware: `src/gui/components/comando.rs`, desenhado a partir de `assets/images/ca.svg`.

### 2.1 Layout

- **16 atuadores em 2 fileiras:** **AR QUENTE** botões `1..8`, **AR RETORNO** botões `9..16`.
- Cada atuador tem **2 LEDs** (verde = fechado, vermelho = aberto). No SVG a ordem vertical
  verde/vermelho é **invertida** entre as fileiras (AR QUENTE verde em cima; AR RETORNO
  vermelho em cima).
- **Pill de bloqueio** ("BLOQUEIO"): vermelho + cadeado amarelo quando travado.

### 2.2 Estados do atuador → LED (portar 1:1)

| Código | Estado            | LED verde    | LED vermelho | Leitura        |
| -----: | ----------------- | ------------ | ------------ | -------------- |
|    `0` | Indisponível      | apagado      | apagado      | ambos "dim"    |
|    `1` | Fechado           | **aceso**    | apagado      | verde fixo     |
|    `2` | Abrindo           | apagado      | **piscando** | vermelho pisca |
|    `3` | Aberto            | apagado      | **aceso**    | vermelho fixo  |
|    `4` | Fechando          | **piscando** | apagado      | verde pisca    |
|    `5` | Abrindo (indef.)  | apagado      | pisca lento  | vermelho lento |
|    `6` | Fechando (indef.) | pisca lento  | apagado      | verde lento    |

Cores (de `comando.rs`): verde aceso `#28a05a` / dim `#1d322a`; vermelho aceso `#ed3237` /
dim `#321d1d`; cadeado travado chip `#ee1111`, ícone `#ffe100`.

### 2.3 O que **muda** no app

O firmware fala direto com o controlador serial → usa **UI otimista** e semântica
**press/release**. **No app, NADA disso:** sem otimismo, sem assertion, sem MQTT.
Reaproveitamos **o visual e o mapeamento de estados**, não a máquina de press otimista.

---

## 3. Comunicação

O app **nunca** publica MQTT. Fluxo:
`APP -> HTTPS -> API -> MQTT -> HARDWARE -> MQTT -> API -> HTTP RESPONSE -> APP`.

### 3.1 Leitura do estado — **já existe na API** ✅ (base da fase visual)

`GET /iot/device/data/latest` (app: `useIotLatestData` → `getLatestData`). O
`GetDeviceDataLatestUseCase` do `be1-server` já retorna, para SCC, por câmara:
`hotAirActuatorState` e `returnAirActuatorState` (códigos 0..6), e o app já os parseia no
`chamberSnapshotSchema`. A tela de Tempo Real **já consome** esse latest (com polling 30–40s).

**Mapeamento câmara → 16 atuadores** (igual ao `render()` do `comando.rs`, que lê
`hot_air[8]`/`return_air[8]`):

- **AR QUENTE `n`** (n = 1..8) → câmara `n` · `hotAirActuatorState`.
- **AR RETORNO `n`** (n = 9..16) → câmara `n-8` · `returnAirActuatorState`.

> Logo, a **fase visual já mostra estado real ao vivo** sem backend novo. `link` = "existe
> snapshot SCC fresco"; o `lockedLocally` do firmware **não** é exposto — o app mantém o
> **seu próprio** bloqueio na UI. _Validar o mapeamento contra um payload real (§12)._

### 3.2 Envio do comando — rota e payload adequados (firmware)

O firmware (`be1-bananapi/src/services/mqtt_comm/router.rs`, handler `act`) consome o tópico
**`devices/<MAC>/act`** — **gated per‑MAC** (broadcast/foreign é recusado: "only per-MAC
actuator control is honored") — com **exatamente** estes payloads:

| Modo                 | Payload                                            |
| -------------------- | -------------------------------------------------- |
| Toque momentâneo     | `{ "actuatorsMap": { "1": true } }`                |
| Parar                | `{ "actuatorsMap": { "1": false } }`               |
| Pressionar por tempo | `{ "actuatorsMapLongPress": { "9": 10 } }` (seg.)  |
| Manter pressionado   | `{ "actuatorsMapLongPress": { "3": 0 } }` (0 = até parar) |

Índices válidos **1..16**. O handler é **fire‑and‑forget** ("the authoritative LED state
arrives in the next `*CA` poll, so there's no reply on the wire"): o hardware **não responde**
num tópico; apenas republica a telemetria, que o backend ingere e serve no
`/iot/device/data/latest`.

### 3.3 Backend: a rota a usar (a rota **pode ser alterada**)

Como o `POST /iot/send-data-mqtt` **pode ser modificado**, há duas formas — a escolha não
bloqueia a fase visual:

- **Opção A — endpoint dedicado (recomendado):** `POST /iot/scc/actuators` device‑scoped
  (auth dono/admin, validação 1..16, monta o tópico server‑side, publica). Mais limpo, seguro
  e alinhado ao padrão `getDeviceDataLatest`. Detalhe em §6.
- **Opção B — adaptar `send-data-mqtt`:** transformá‑lo de passthrough genérico em
  device‑scoped: receber `{ device, actuatorsMap|actuatorsMapLongPress }`, resolver o MAC,
  montar `devices/<MAC>/act` no servidor e **publicar sem aguardar resposta** (o `act` é
  fire‑and‑forget — o modelo atual de esperar `responseTopic` daria timeout 408).

> Em ambos os casos: **o app envia só `{ device, actuatorsMap|actuatorsMapLongPress }`**; quem
> conhece MQTT/tópico/MAC é o backend. O `send-data-mqtt` **como está hoje não serve**
> (espera resposta inexistente, vaza topologia para o app, sem auth por dispositivo).

---

## 4. Onde mora no app (botão no detalhe → tela dedicada)

### 4.1 Botão no detalhe do SCC

Na `DeviceRealtimeScreen` (ramo `isScc`, com dados de câmara), adicionar um **botão/card**
"Caixa de Comando" (ícone Lucide `ToggleRight`/`SlidersHorizontal`) que navega para a tela
dedicada. Posição sugerida: logo abaixo dos chips de meta ou junto ao `ChamberGrid`.

```tsx
{isScc && hasChamberData ? (
  <Button
    onPress={() => router.push(`/device/command/${deviceId}`)}
    accessibilityLabel="Abrir caixa de comando"
  >
    Caixa de Comando
  </Button>
) : null}
```

> O botão aparece para **qualquer** usuário que vê o SCC (a tela abre em leitura). A trava de
> **acionamento** é por permissão dentro da tela (§6A/§7 regra 0).

### 4.2 Tela dedicada (rota empilhada, sem a tab bar do dispositivo)

O detalhe `app/device/[id]/` é um navegador de **abas**; para uma tela cheia **empilhada**
(com header próprio + voltar, sem a tab bar), usar uma **rota irmã sob o Stack raiz**:

```
app/device/command/[id].tsx   ->  export { DeviceActuatorsScreen as default }
```

Navegação: `router.push(\`/device/command/${deviceId}\`)`. O segmento estático `command` não
conflita com `device/[id]` (estático tem precedência sobre o dinâmico).

### 4.3 Arquivos novos (todos em `src/features/devices/`)

```
src/features/devices/
├── screens/DeviceActuatorsScreen.tsx  # container da tela dedicada (header + painel + travas)
├── components/
│   ├── ActuatorSvgPanel.tsx           # ca.svg (SvgXml) + LEDs/seleção/cadeado sobrepostos
│   └── ActuatorModeBar.tsx            # seletor de modo + input de tempo + botão Acionar
├── assets/caSvg.ts                    # ca.svg do firmware embutido (gerado; SvgXml)
├── hooks/
│   ├── useDeviceActuators.ts          # deriva 16 estados do latestData (mapeamento §3.1)
│   └── useActuatorCommand.ts          # mutation HTTP + invalidate do latest
├── services/device.service.ts         # sendActuatorCommand(...)
├── schemas/device.schema.ts           # actuatorCommandSchema (payload + tipo)
└── utils/actuatorState.ts             # câmara→16 atuadores + código→modo de LED
```

> **Opção B implementada** (ver §8.1): o painel **é o `ca.svg`** do `be1-bananapi`, renderizado
> com `react-native-svg` (`SvgXml`), com os 16×2 LEDs, o anel de seleção, as áreas de toque e o
> cadeado pintados por cima nas âncoras do `comando.rs`.

A `DeviceActuatorsScreen` lê o `id` por `useGlobalSearchParams`, consome o **mesmo**
`useIotLatestData(id)` (com polling) — então o estado dos atuadores chega ao vivo e o refetch
do comando reaproveita `queryKeys.devices.latest(id)`. Estado de UI (atuador selecionado,
modo, tempo, bloqueio, in‑flight) vive **dentro da tela/painel** (`useState`/store de
feature), nunca no React Query.

---

## 5. Camada de dados (app)

### 5.1 `utils/actuatorState.ts` (Fase 1)

- `mapChambersToActuators(sccChambers)` → `{ hotAir: number[8], returnAir: number[8], link: boolean }`
  aplicando o mapeamento da §3.1.
- `ledModes(code)` → `{ green: 'off'|'on'|'blink'|'slow', red: ... }` (tabela §2.2).

### 5.2 Schema do comando (`device.schema.ts`) (Fase 3)

```ts
export const actuatorCommandSchema = z.union([
  z.object({ actuatorsMap: z.record(z.string(), z.boolean()) }),
  z.object({ actuatorsMapLongPress: z.record(z.string(), z.number().int().min(0)) }),
]);
export type ActuatorCommand = z.infer<typeof actuatorCommandSchema>;
```

### 5.3 Service + hook de comando (Fase 3)

```ts
// device.service.ts — endpoint dedicado (ou send-data-mqtt adaptado), o app só manda isto:
async sendActuatorCommand(deviceId: string, command: ActuatorCommand): Promise<void> {
  await apiClient.post('/iot/scc/actuators', { device: deviceId, ...command });
}
```

- `useActuatorCommand(deviceId)`: `useMutation` → `sendActuatorCommand`; no `onSuccess`
  `invalidateQueries(queryKeys.devices.latest(deviceId))` + refetch. **Sem `onMutate`
  otimista.** Expõe `isPending` para travar a UI.

---

## 6. Backend (`be1-server`) — Opção A recomendada (Fase 2)

`POST /iot/scc/actuators` (`ensureAuthenticated`), body
`{ device, actuatorsMap?, actuatorsMapLongPress? }`. Seguir o módulo de referência
(`productLines`) e o `CLAUDE.md` do `be1-server`:

```
src/modules/iot/
├── dtos/SendActuatorCommandRequestDTO.ts     # class-validator
├── useCases/iotSendActuatorCommand/
│   ├── IotSendActuatorCommandController.ts    # thin: body + request.user.id
│   └── IotSendActuatorCommandUseCase.ts
└── routes/iot.ts                              # + post('/scc/actuators', ...)
```

UseCase: (1) `DevicesRepository.findById`; checar **dono ou admin** (`iotLinkDevices`) como no
`GetDeviceDataLatestUseCase`; (2) só **SCC**; (3) validar índices **1..16** / tipos; (4) lock
**único por dispositivo** (recusa simultâneos, `409`); (5) montar `devices/<MAC>/act`
**reusando** o helper de tópico do `SetDeviceSettings`; (6) publicar via novo método do
provider `publishOnce(topic, data)` (QoS 1, **retain:false**, sem aguardar); (7) responder
`200 { ok: true }`. O app então re‑busca o `latest`.

> **Política de resposta (§12):** responder após publicar (recomendado). "Responder só após o
> realtime do hardware" exigiria correlação por `uid`, que o `act` não tem — mudaria firmware.

---

## 6A. Permissão de acionamento — **criar nova permissão** 🔒

O acionamento é mais sensível que ver/configurar, então ganha **permissão própria** em vez de
reusar `iotLinkDevices`. Seguir o modelo de permissões existente (módulos + `userModules`).

**Nome proposto:** `iotControlActuators` (rótulo PT‑BR: "Controlar atuadores").

### Backend (`be1-server`)

1. **Seed do módulo:** adicionar `{ name: 'iotControlActuators' }` ao array `modules` em
   `src/shared/infra/prisma/seed/admin.ts` (mesma lista de `iotDevices`/`iotLinkDevices`).
   Rodar o seed (`yarn seed:admin`) — **com autorização do usuário**.
2. **Util de checagem:** criar `iotCanControlActuators(userId, modulesRepo, userModulesRepo)`
   espelhando `src/modules/iot/utils/isIotAdmin.ts` (`findByName('iotControlActuators')` +
   `findByUserIdAndModuleId`). Opcional: admin (`iotLinkDevices`) como override.
3. **Gate no UseCase:** o `IotSendActuatorCommandUseCase` (§6) exige
   `iotControlActuators` (ou admin); senão `AppError(..., 'error_actuator_unauthorized', 403)`.
   Isto é **independente** da checagem dono/admin de leitura — comandar exige a permissão nova.
4. **Sessão:** garantir que `POST /sessions` devolva o novo módulo no `permissions: string[]`
   (a montagem de permissões por nome de módulo já existe; só depende de o usuário ter o
   `userModule`). _Confirmar (§12)._

### App (`app-react-native`)

5. **Constante:** adicionar em `src/constants/permissions.constants.ts`:
   ```ts
   /** Pode acionar atuadores (caixa de comando). */
   controlActuators: 'iotControlActuators',
   ```
6. **Hook:** estender `usePermissions()` com
   `canControlActuators: permissions.includes(IotPermissions.controlActuators)`.
7. **Gate de UI:** ver §7 (regra 0) e §4 (condição de montagem) — sem a permissão, o app
   **não envia** comando; o painel fica em modo leitura ou oculto (decisão §12).

> A permissão é a **trava de autorização** definitiva; as travas de UI (§7) e a validação no
> UseCase (§6) complementam, mas a permissão é quem libera o acionamento.

---

## 7. Máquina de estados da UI (regras de operação)

0. **Permissão (`iotControlActuators`):** sem ela, **nenhum** controle envia comando — o painel
   fica **somente leitura** (LEDs ao vivo, botões desabilitados) ou oculto (decisão §12). Com
   ela, valem as regras abaixo.

1. **Comando único por dispositivo:** com `isPending`, **todos** os controles desabilitam.
2. **Sem double‑tap / sem duplicado:** ignorar novo acionamento até o anterior concluir
   (sucesso) ou falhar (erro/timeout). Guard no handler.
3. **Sem estado otimista:** o visual reflete **somente** o último latest data.
4. **Indicador de carregamento** enquanto aguarda a API (overlay/spinner no painel).
5. **Após sucesso:** invalida/refetch do `latest` e re‑renderiza.
6. **Apenas um atuador "mantido" por vez** (limite do hardware): havendo um em "manter", o
   **Parar** fica disponível e os demais seguem bloqueados (regra 1).
7. **Botão Parar** ativo **apenas** quando há um atuador mantido pressionado.
8. **Offline / sem link → tudo desabilitado** (usar `device.status` / `link`).
9. **Bloqueio (pill):** painel inicia **travado**; destravar é ação explícita; toque em
   atuador travado → feedback (flash do cadeado), sem enviar comando.

### 7.1 Fluxo de um acionamento

Seleciona atuador → seleciona modo (Momentâneo · Tempo · Manter · Parar) → se "Tempo", informa
segundos → POST + **trava tudo** + spinner → API responde → invalida/refetch do `latest` → UI
re‑renderiza e reabilita → erro/timeout: libera trava, mantém último estado, mensagem inline.

---

## 8. UI e design system (reuso)

- **Tamagui + tokens** (`$brand`, `$surface`, `$border`, spacing `$N`, `Text`, `Card`,
  `IconButton`, `Chip`). **Nunca** estilo literal.
- **Cores dos LEDs:** **tokens semânticos** no tema (ex.: `$actuatorClosed` `#28a05a`,
  `$actuatorOpen` `#ed3237` e dims) em `src/theme`, não inline.
- **Piscar:** Reanimated (opacidade). Ritmos do firmware como referência (~300 ms; lento
  ~300 on / 1700 off).
- **Layout do card:** título "Caixa de Comando" + blocos "AR QUENTE" (1–8) e "AR RETORNO"
  (9–16); cada botão com número + 2 LEDs; em telas estreitas quebrar preservando a ordem.
  Visualmente coerente com os outros cards da Tempo Real (`SccCb200Card`, `IotAlarmCard`).
- **Acessibilidade:** `accessibilityRole="button"`, label ("Atuador 3 — Aberto"),
  `accessibilityState={{ disabled }}`.

### 8.1 Reuso do `ca.svg`

- **(B) Embutir `ca.svg` — ✅ IMPLEMENTADA** (a pedido: igual à tela do bananapi). O painel é o
  próprio `ca.svg` (`assets/caSvg.ts`, gerado do firmware, sem o prólogo `<?xml?>`) renderizado
  por `SvgXml`, com os 16×2 LEDs (base dim sólida + camada acesa animada por Reanimated), o anel
  de seleção, as áreas de toque dos botões e o cadeado (chip vermelho + cadeado amarelo quando
  travado) pintados por cima nas âncoras do `comando.rs` (`SVG_W/H`, `LED_R`, `BTN_R`,
  `LOCK_PILL`, `CELLS`). O SVG é memoizado por tamanho; o estado do cadeado é por **sobreposição**
  (não CSS no SVG — suporte limitado no `react-native-svg`).
- **(A) Reconstrução nativa** (alternativa não usada): rebuild com Tamagui, sem o SVG.

> Asset: `ca.svg` embutido em `src/features/devices/assets/caSvg.ts` (gerado de
> `be1-bananapi/assets/images/ca.svg`).

---

## 9. Estados de erro / borda

- **Offline / sem link:** painel desabilitado + aviso, mas **continua visível** (mostra último
  estado conhecido em "dim").
- **Timeout/erro do POST:** liberar trava; manter último estado; erro inline.
- **Sem dado de câmara / não‑SCC:** botão não aparece no detalhe; se a tela dedicada for
  aberta sem dados, exibir `LoadingState`/`NoDeviceData` (padrão da `DeviceRealtimeScreen`).
- **Header da tela dedicada:** título "Caixa de Comando" + nome do dispositivo + botão voltar
  (`ChevronLeft`, `router.back()`), no padrão do header da `DeviceRealtimeScreen`.

---

## 10. (reservado)

---

## 11. Plano de execução — **visual primeiro**

### Fase 1 — Visual (app, sem backend novo) ⭐ começar aqui

A leitura já existe (§3.1), então a Fase 1 já entrega estado **real ao vivo** + toda a
interação, com o **envio do comando stubado** (no‑op atrás de um flag, sem rede).

1. `utils/actuatorState.ts` — mapeamento câmara→16 + código→modo de LED.
2. `useDeviceActuators(deviceId)` — deriva os 16 estados do `latestData` (reusa o latest da
   tela).
3. Tokens de tema dos LEDs (`src/theme`).
4. Componentes apresentacionais: `ActuatorLed` (com animação de piscar), `ActuatorButton`,
   `ActuatorPanel`, `ActuatorLockPill`, `ActuatorModeBar`.
5. `DeviceActuatorsScreen` + rota `app/device/command/[id].tsx` (re‑export) + **botão** "Caixa
   de Comando" na `DeviceRealtimeScreen` (ramo SCC, `hasChamberData`) navegando para ela.
6. Interação completa na UI: seleção de atuador, seleção de modo, input de tempo, pill de
   bloqueio (estado local), e **todas as travas/estados desabilitados** da §7 — com o handler
   de comando **stub** (`onCommand` = no‑op/log).
7. Acessibilidade + responsividade da tela. `npm run typecheck` verde (sem `any`).

> Resultado da Fase 1: painel COMANDO funcional **visualmente**, refletindo o estado real dos
> atuadores ao vivo, pronto para revisão de UX antes de qualquer mudança de backend.

> Na Fase 1, o gate de permissão (§6A/§7 regra 0) já pode ser fiado na UI usando o
> `usePermissions()` atual — mostrando o painel em só‑leitura — mesmo antes do módulo existir
> no backend (a permissão simplesmente vem ausente).

### Fase 2 — Backend (`be1-server`) ✅ concluída

Opção A (endpoint dedicado) implementada. Arquivos:

8. **Permissão:** módulo `iotControlActuators` no `seed/admin.ts` + util
   `src/modules/iot/utils/iotCanControlActuators.ts`. O `/sessions`
   (`AuthenticateUserUseCase`) já devolve `permissions = modules.map(m => m.name)`, então o
   app recebe `iotControlActuators` ao usuário tê-lo atribuído.
9. **Provider:** `publishOnce(topic, data)` em `IIotClientProvider` + impl (QoS 1,
   **retain:false**, sem aguardar resposta).
10. **UseCase/Controller/DTO** `iotSendActuatorCommand`: auth **dono ou admin** + permissão
    `iotControlActuators` (admin override), só **SCC**, validação **1..16** + tipos, lock
    **único por dispositivo** (`409`), monta `devices/${deviceType}/${MAC}/act`
    (`normalizeMacAddress`, igual ao `settings/set`) e publica via `publishOnce`.
11. **Rota** `POST /iot/scc/actuators` registrada (`ensureAuthenticated`).
    `tsc --noEmit`, ESLint e Prettier (conteúdo) **verdes**.

> Resposta do endpoint: `{ ok, topic, command }` após a publicação; o app re-busca o `latest`.

### Fase 3 — Ligar o comando (app) ✅ concluída

12. Permissão no app: `IotPermissions.controlActuators` + `canControlActuators` no
    `usePermissions` (feito na Fase 1).
13. `actuatorCommandSchema` (+ tipo `ActuatorCommand`, fonte única em `device.schema.ts`,
    re-exportado por `actuatorState.ts`) + `sendActuatorCommand` no `device.service.ts`.
14. `useActuatorCommand` — `useMutation` que invalida `queryKeys.devices.latest(id)` no
    sucesso (o `useIotLatestData` re-busca e a UI reflete o estado real). **Sem otimismo.**
15. `DeviceActuatorsScreen`: stub trocado pelo envio real (`runCommand`); `isPending` trava
    todos os controles; `isError` mostra aviso inline; travas de bloqueio/offline/held ativas.
    `tsc`/ESLint/Prettier **verdes**.
16. [ ] Verificação end‑to‑end contra o hardware real (login com permissão, acionar,
    confirmar telemetria) — **pendente** (requer dispositivo/conta reais).

> **Nenhum build/teste/app é executado sem pedido explícito do usuário** (AGENTS.md). Trabalho
> em branch de feature; **nunca** na `main`.

---

## 12. Pendências / decisões em aberto

- [x] **Backend:** **Opção A** (endpoint dedicado `POST /iot/scc/actuators`) implementada
      na Fase 2.
- [x] **Formato do tópico/MAC:** confirmado `devices/${deviceType}/${MAC}/act` (mirror do
      `settings/set`; `MAC` = `normalizeMacAddress`, 12 hex maiúsculo). Firmware
      (`router.rs`) aceita `devices/{TYPE}/{MAC}/act` per‑MAC.
- [x] **Permissão (`/sessions`):** confirmado — `AuthenticateUserUseCase` mapeia módulos→nomes;
      basta atribuir o módulo `iotControlActuators` ao usuário.
- [ ] **Mapeamento de leitura:** validar contra payload real que AR QUENTE 1..8 =
      `chambers[1..8].hotAirActuatorState` e AR RETORNO 9..16 =
      `chambers[1..8].returnAirActuatorState` (e o papel do idx `9`/fornalha).
- [ ] **Formato do tópico/MAC:** confirmar `devices/<MAC>/act` e normalização do MAC reusando
      o helper do `SetDeviceSettings`.
- [x] **Permissão:** decidido **criar permissão dedicada** `iotControlActuators` (§6A) em vez
      de reusar `iotLinkDevices`. _Confirmar:_ nome final, se admin (`iotLinkDevices`) é
      override, e se sem a permissão o painel fica **só‑leitura** ou **oculto**.
- [ ] **Bloqueio (pill):** só UI local (recomendado) ou também envia algo à API?
- [ ] **Fidelidade visual:** reconstrução nativa (A) vs embutir `ca.svg` (B).
- [ ] **Timeouts** do POST e do publish.

---

## 13. Riscos

- **Segurança operacional:** acionar equipamento remotamente é sensível. As travas da §7 + a
  autorização/validação no backend (dono/admin, 1..16, comando único) são **requisito de
  segurança**, não só UX. Por isso a Fase 1 mantém o envio **stub**: nada chega ao hardware
  até o backend device‑scoped existir.
- **Fire‑and‑forget:** sem ack do `act`, a confirmação é a telemetria seguinte — UI deixa
  claro o "aguardando" e nunca enfileira comandos.
- **Acoplamento de tópico:** montagem do tópico **no backend** (não no app) para não vazar
  MQTT nem quebrar se a topologia mudar.
```
