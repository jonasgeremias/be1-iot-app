# Pendências — BE1 Monitoramento (app novo)

> Atualizado em 2026-06-11. Acompanha a portabilidade do `be1-app` (funcional) para o app novo (Expo Router + Tamagui).
> Legenda: 🔴 alta · 🟠 média · 🟡 baixa · ⏸️ adiado · ⛔ fora de escopo.

---

## ✅ Concluído (referência)

- **Dispositivos (API real):** lista agrupada por planta com polling 30s, countdown clicável (busca instantânea), detalhe por tipo (SCC / PP / BULK / GRANO) com grid de câmaras, gráficos de histórico, variação de temperatura, cards CB200 (temp/umidade/soprador/fase-clima) e alarmes.
- **Auth (API real):** login por e-mail **ou** CPF (`POST /sessions`), restauração de sessão no boot, refresh-token no interceptor (proativo + retry 401), guards de rota `(main)`/`(auth)`, logout.
- **Perfil (API real):** `GET/POST /users/{id}`, edição inline (nome, telefone, CPF, nascimento + **estado/cidade** via `/locations/*`), upload de avatar (`PATCH /users/update/avatar`).
- **Dashboard:** contagem real de dispositivos/grupos; saudação por horário + nome do usuário.
- **Acesso a Assistências ocultado** (card da dashboard + aba do tab bar) até a tela ter API.
- **Detalhe do dispositivo (SCC/PP/BULK)** com 4 abas: **Tempo Real** (estado ao vivo), **Histórico** (gráficos), **Eventos** (`GET /iot/device/events` com filtros de período/severidade + paginação) e **Configuração** (árvore de settings via `GET/PUT /iot/device/settings` com diff + hash).
- **Permissões/admin**: `permissions` guardadas no login; hook `usePermissions`/`isIotAdmin`; aba **Configuração** visível/acessível **só para admin** (`iotLinkDevices`).
- **Correções:** tamanho da câmara de retorno (SCC); histórico aceitando leituras `null`; estado vazio de busca; refresh instantâneo do countdown; erro de login exibido; "Lembrar acesso" preenchendo o e-mail; debounce na busca.

---

## 🔴 Alta prioridade

- [ ] **Dashboard — carrossel de destaques**: ainda mockado. _Bloqueado: não existe endpoint na API._
- [ ] **Dashboard — notificações (sino + contador)**: mockado. _Será feito depois._
- [ ] **Assistências (support)**: feature inteira mockada. Acesso está oculto; ligar à API quando os endpoints existirem.

## ⏸️ Adiado (faremos depois, com requisitos)

- [ ] **GRANO** — Configuração (silo/regras de excelência/parâmetros remotos), Histórico (tabela paginada `POST /iot/grano/self/history` + export PDF/Excel) e Eventos (não existe no web). Requer `subDeviceId`. Ver `docs/requisitos-iot-dispositivo.md`.
- [ ] **Export PDF/Excel** (histórico GRANO) no mobile — precisaria de `expo-file-system`/`expo-sharing`.
- [ ] **Configuração — campos enumerados/validações finas** além do genérico (boolean/number/string/select), e o CRUD admin do device (aba extra do web).
- [ ] **Notificações push**: be1-app registra `expoToken` no login e faz `DELETE /push/tokens` no logout. _Não será feito agora._

> Detalhes completos dos requisitos das telas em **`docs/requisitos-iot-dispositivo.md`**.

## 🟠 Média — paridade com o be1-app que ficou de fora

- [ ] **Setas de fluxo de ar do SCC** (`SccArrowsStrip`): indicador visual de fluxo nas câmaras (não portado).
- [ ] **Chip de "dono" + permissões de admin** (`loadPermissions`): omitidos na listagem/cards.
- [ ] **Fallback de nome por produto**: hoje uso `nickname || MAC`; be1-app usa `nome do produto + nº de ordem` quando não há apelido.
- [ ] **Perfil — "Notificações" e "2FA"**: toggles locais, sem endpoint real.

## 🟡 Baixa — robustez / UX / dúvidas técnicas

- [ ] **Refresh token assumido como JWT** (`isTokenExpired(refreshToken)`): se o backend usar refresh token opaco, o boot deslogaria. Confirmar formato.
- [ ] **Upload de avatar**: implementado, mas não validado contra o backend (confirmar nome do campo/shape do multipart).
- [ ] **Sem sistema de toast global**: erros aparecem inline; be1-app usa toasts.
- [ ] **GRANO**: apenas placeholder "não suportado" (igual be1-app — talvez ok).

## ✅ Verificação pendente (transversal)

- [ ] **Validar end-to-end contra o backend real** com conta de verdade: login (e-mail/CPF), `/users` (perfil + edição + estado/cidade), `/iot/*` (lista/detalhe/histórico), `/locations/*`, upload de avatar. Nenhum fluxo real foi testado contra o servidor ainda.

## ⛔ Fora de escopo (por decisão)

- **Recuperação de senha / e-mail** (forgot/reset): não será feito neste ciclo.
