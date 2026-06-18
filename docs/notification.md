# Sistema de Notificações — BE1 App

Documento de referência para **reaproveitar o sistema de notificações deste app em um novo projeto**. Descreve a stack, o fluxo ponta a ponta, todos os arquivos envolvidos e um passo a passo de implementação.

---

## 1. Stack e versões

| Tecnologia | Versão | Papel |
|---|---|---|
| Expo (React Native) | `~54.0.33` | Framework base |
| `expo-notifications` | `~0.32.16` | Push + notificações locais |
| `expo-constants` | `~18.0.13` | Acesso ao `projectId` do EAS |
| Firebase Cloud Messaging (FCM) | via `google-services.json` | Entrega de push no Android |
| `react-query` | `^3.39.3` | Invalidação de cache ao receber notificação |
| `socket.io-client` | `^4.8.1` | Mensagens de chat em tempo real (complementar) |

> O app é **Expo + TypeScript**, com nova arquitetura ativada (`newArchEnabled: true`).

---

## 2. Visão geral do fluxo

```
LOGIN
  └─> NotificationProvider pede permissão (getPermissions → requestPermissions)
        └─> obtém Expo Push Token (getExpoPushTokenAsync + projectId do EAS)
              └─> AuthContext envia token ao backend: POST /push { token }
                    └─> backend mapeia token ↔ usuário (FCM)

BACKEND ENVIA PUSH
  └─> FCM entrega ao device → expo-notifications
        ├─ App em PRIMEIRO PLANO → addNotificationReceivedListener
        │     └─ lê data.type → invalida cache do react-query
        └─ USUÁRIO TOCA A NOTIFICAÇÃO → addNotificationResponseReceivedListener
              └─ lê data.type → invalida cache + navega para a tela correta

LOGOUT
  └─> DELETE /push/tokens { token }  (limpa o token no backend)
```

A "cola" do sistema é o campo **`data.type`** que o backend envia em cada push. Ele decide qual cache invalidar e para qual tela navegar.

---

## 3. Arquivos envolvidos

| Arquivo | Responsabilidade |
|---|---|
| `src/contexts/NotificationContext.tsx` | Núcleo: handler global, permissões, token, listeners, notificação local |
| `src/hooks/useNotifications.tsx` | Hook `useNotification()` para consumir o contexto |
| `src/contexts/AuthContext.tsx` | Registra (`POST /push`) e remove (`DELETE /push/tokens`) o token |
| `App.tsx` | Ordem de montagem dos providers |
| `app.config.js` | Ícone/cor da notificação + `projectId` do EAS |
| `google-services.json` | Credenciais do Firebase (Android) |
| `android/app/src/main/AndroidManifest.xml` | Metadados FCM/Expo (ícone, cor) e permissões |
| `android/app/src/main/res/values/colors.xml` | Cor do ícone de notificação |

---

## 4. Núcleo: `NotificationContext.tsx`

### 4.1 Handler global (como a notificação se comporta ao chegar)

Definido **fora do componente**, executa uma vez ao carregar o módulo:

```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
})
```

> Para tocar som ou atualizar badge no novo app, altere `shouldPlaySound` / `shouldSetBadge` para `true`.

### 4.2 Tipo exposto pelo contexto

```ts
export type NotificationData = {
  showLocalNotification: (
    title: string,
    body: string,
    data: Record<string, unknown>
  ) => Promise<void>
  expoPushToken?: string
  notification: Notifications.Notification
}
```

### 4.3 Notificação local (disparo imediato pelo próprio app)

```ts
const showLocalNotification = async (title, body, data) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data },
    trigger: null // null = dispara imediatamente
  })
}
```

> Para **agendar** uma notificação, troque `trigger: null` por um trigger de data/intervalo do `expo-notifications` (ex.: `{ seconds: 60 }`).

### 4.4 Registro do push token (permissão + token)

```ts
useEffect(() => {
  const registerForPushNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      setExpoPushToken(undefined)
      return
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId
    })
    setExpoPushToken(tokenData.data)
  }

  registerForPushNotifications().catch(() => setExpoPushToken(undefined))
}, [])
```

> ⚠️ O `projectId` do EAS é **obrigatório** para gerar o Expo Push Token em build de produção. Vem de `app.config.js → extra.eas.projectId`.

### 4.5 Listeners (recebimento e toque)

```ts
useEffect(() => {
  // App em primeiro plano
  const notificationSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      setNotification(notification)
      const data = notification.request.content.data
      if (data.type === 'chatMessage') {
        queryClient.invalidateQueries(['chat', data.chatId])
      }
    }
  )

  // Usuário tocou na notificação
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
      if (data.type === 'chatMessage') {
        queryClient.invalidateQueries(['chat', data.chatId])
        navigation.navigate('chatRoutes', {
          screen: 'chat',
          params: { chatId: data.chatId }
        })
      }
      if (data.type === 'assistance') {
        queryClient.invalidateQueries(['assistances'])
        navigation.navigate('assistancesRoutes', {
          screen: 'assistance',
          params: { assistanceId: data.assistanceId }
        })
      }
      if (data.type === 'sccConfigChange') {
        queryClient.invalidateQueries(['devices'])
        navigation.navigate('monitoringRoutes', {
          screen: 'monitoring_list',
          params: { deviceId: data.deviceId }
        })
      }
    })

  return () => {
    notificationSubscription.remove() // limpeza obrigatória
    responseSubscription.remove()
  }
}, [navigation, queryClient])
```

> A limpeza (`.remove()`) no retorno do `useEffect` evita listeners duplicados e vazamento de memória.

---

## 5. Tipos de notificação suportados

O contrato entre backend e app é o campo `data.type`:

| `data.type` | Campos extras esperados | Em primeiro plano | Ao tocar (navegação) |
|---|---|---|---|
| `chatMessage` | `chatId` | invalida `['chat', chatId]` | `chatRoutes → chat` com `chatId` |
| `assistance` | `assistanceId` | — | `assistancesRoutes → assistance` com `assistanceId` |
| `sccConfigChange` | `deviceId` | — | `monitoringRoutes → monitoring_list` com `deviceId` |

> **No novo app:** mantenha esse padrão de `data.type` + IDs e adapte os nomes das rotas e das query keys para o seu domínio.

---

## 6. Registro/remoção do token no backend (`AuthContext.tsx`)

### Registro após login (com proteção contra duplicidade)

```ts
const lastRegisteredPushTokenRef = useRef<string | null>(null)
useEffect(() => {
  const registerPush = async () => {
    if (!user?.id) return
    if (!expoPushToken) return
    if (lastRegisteredPushTokenRef.current === expoPushToken) return
    lastRegisteredPushTokenRef.current = expoPushToken

    await api.post('/push', { token: expoPushToken })
  }
  registerPush()
}, [user?.id, expoPushToken])
```

### Remoção no logout

```ts
const signOut = useCallback(async () => {
  const currentExpoToken = user?.expoToken
  await Promise.all([storageUserRemove(), storageAuthTokenRemove()])
  if (currentExpoToken) {
    api.delete('/push/tokens', { data: { token: currentExpoToken } }).catch(() => {})
  }
  setUser(null)
  setIsLoadingUserStorageData(false)
}, [user?.expoToken])
```

### Contrato da API esperado pelo backend

| Método | Rota | Body | Quando |
|---|---|---|---|
| `POST` | `/push` | `{ token }` | Após login, com token disponível |
| `DELETE` | `/push/tokens` | `{ token }` (em `data`) | No logout |

---

## 7. Ordem de montagem dos providers (`App.tsx`)

A ordem importa: o `NotificationProvider` usa `useNavigation` e `useQueryClient`, então precisa estar **dentro** de `NavigationContainer` e `QueryClientProvider`, e **acima** do `AuthContextProvider` (que consome o `expoPushToken`).

```tsx
<NavigationContainer theme={AppTheme} linking={linking}>
  <QueryClientProvider client={queryClient}>
    <NotificationProvider>
      <AuthContextProvider>
        {/* resto do app */}
      </AuthContextProvider>
    </NotificationProvider>
  </QueryClientProvider>
</NavigationContainer>
```

---

## 8. Configuração nativa

### `app.config.js`

```js
notification: {
  icon: './assets/favicon.png',
  color: '#123A7F'
},
extra: {
  eas: { projectId: '<SEU_PROJECT_ID_EAS>' }
},
android: {
  package: '<SEU_PACKAGE>',
  googleServicesFile: './google-services.json'
}
```

### `AndroidManifest.xml` — metadados (gerados pelo Expo prebuild)

```xml
<meta-data android:name="com.google.firebase.messaging.default_notification_color"
           android:resource="@color/notification_icon_color"/>
<meta-data android:name="com.google.firebase.messaging.default_notification_icon"
           android:resource="@drawable/notification_icon"/>
<meta-data android:name="expo.modules.notifications.default_notification_color"
           android:resource="@color/notification_icon_color"/>
<meta-data android:name="expo.modules.notifications.default_notification_icon"
           android:resource="@drawable/notification_icon"/>
```

### `colors.xml`

```xml
<color name="notification_icon_color">#123A7F</color>
```

> Canais de notificação do Android 8+ são criados automaticamente pelo `expo-notifications` usando esses metadados — não há criação manual de canal no código.

---

## 9. Passo a passo para reaproveitar em um novo app

1. **Crie o projeto Expo** e configure `app.config.js` com o seu `name`, `slug`, `package`/`bundleIdentifier`.
2. **Firebase/FCM (Android):** crie um projeto no Firebase, adicione o app Android com o seu `package`, baixe o `google-services.json` para a raiz e aponte em `android.googleServicesFile`.
3. **EAS:** rode `eas init` para obter o `projectId` e coloque em `extra.eas.projectId`.
4. **Instale as dependências:**
   ```bash
   npx expo install expo-notifications expo-constants
   npm install react-query react-react@^3  # se for usar invalidação de cache
   ```
5. **Configure ícone e cor** em `app.config.js → notification`.
6. **Copie** `NotificationContext.tsx` e `useNotifications.tsx`. Ajuste:
   - os blocos `if (data.type === ...)` para os **tipos do seu domínio**;
   - os nomes de **rotas** e **query keys**.
7. **No `App.tsx`,** monte os providers na ordem da seção 7.
8. **No seu `AuthContext`,** copie o `useEffect` de registro (`POST /push`) e o trecho de logout (`DELETE /push/tokens`). Implemente essas rotas no backend.
9. **Backend:** ao enviar push via Expo Push API / FCM, inclua sempre `data: { type, ...ids }` seguindo o contrato da seção 5.
10. **Build com EAS** (`eas build`) — push **não funciona no Expo Go** para produção; use development build ou build standalone.

---

## 10. Pontos de atenção

- **Expo Go não recebe push remoto** de produção de forma confiável — teste em development/standalone build.
- **iOS** exige credenciais APNs configuradas no EAS (`eas credentials`) além do Firebase.
- O **`projectId` do EAS é obrigatório** em `getExpoPushTokenAsync` para builds reais.
- O backend é a fonte da verdade do `data.type`; mantenha esse contrato versionado entre app e API.
- Som e badge estão **desligados** por padrão no handler — habilite se o novo app precisar.
- Há um canal **complementar** em tempo real via Socket.io (`useChat.tsx`) para mensagens de chat; é independente do push e opcional.

---

*Documento gerado a partir do código do BE1 App (Expo `~54.0.33`, `expo-notifications ~0.32.16`).*
