import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';

import { deviceService } from '../services/device.service';
import {
  countLeaves,
  deepDiff,
  setPath,
  type SettingsTree,
} from '../utils/settingsTree';

/** Remote device settings state + mutations for the Configuracao tab. */
export function useDeviceSettings(deviceId: string) {
  const [fetched, setFetched] = useState<SettingsTree | null>(null);
  const [edited, setEdited] = useState<SettingsTree>({});
  const [hash, setHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMut = useMutation({
    mutationFn: () => deviceService.getDeviceSettings(deviceId),
    onSuccess: (res) => {
      if (res.error) {
        setErrorMsg(res.message || 'Erro ao buscar configuracoes.');
        return;
      }
      setFetched(res.data.settings);
      setEdited(res.data.settings);
      setHash(res.data.hash);
      setErrorMsg(null);
    },
    onError: () =>
      setErrorMsg('Erro de comunicacao. Verifique se o dispositivo esta online.'),
  });

  const saveMut = useMutation({
    mutationFn: (diff: SettingsTree) =>
      deviceService.putDeviceSettings({ deviceId, settings: diff, hash: hash! }),
    onSuccess: (res) => {
      const apiErr = res.error || res.data.error;
      if (apiErr) {
        const message = (res.data.error ?? res.message) || '';
        setErrorMsg(
          /hash/i.test(message)
            ? 'Configuracoes desatualizadas (outra alteracao foi aplicada). Toque em Buscar e tente novamente.'
            : message || 'Falha ao aplicar configuracoes.',
        );
        return;
      }

      const applied = res.data.settings;
      if (applied && Object.keys(applied).length > 0) {
        setFetched(applied);
        setEdited(applied);
      } else {
        setFetched(edited);
      }
      setHash(res.data.hash);
      setErrorMsg(null);
    },
    onError: () => setErrorMsg('Erro de comunicacao ao salvar.'),
  });

  const changedDiff = fetched ? deepDiff(fetched, edited) : {};
  const changedCount = countLeaves(changedDiff);

  const onChange = (path: string[], value: unknown) =>
    setEdited((prev) => setPath(prev, path, value));

  const fetch = () => {
    if (changedCount > 0) {
      Alert.alert(
        'Descartar alteracoes?',
        `Voce tem ${changedCount} campo(s) alterado(s).`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descartar e buscar',
            style: 'destructive',
            onPress: () => fetchMut.mutate(),
          },
        ],
      );
      return;
    }
    fetchMut.mutate();
  };

  const save = () => {
    if (!hash || changedCount === 0) return;
    saveMut.mutate(changedDiff);
  };

  return {
    fetched,
    edited,
    errorMsg,
    changedCount,
    fetch,
    save,
    fetchNow: () => fetchMut.mutate(),
    isFetching: fetchMut.isPending,
    isSaving: saveMut.isPending,
    onChange,
  };
}
