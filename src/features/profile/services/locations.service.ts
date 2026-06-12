import { apiClient } from '@/services/api/axios';
import type { SelectOption } from '@/shared/ui/Select';

/** Backend list payloads wrap rows under `data`. */
type LocationRow = { id: string; name: string; acronym?: string };

function toOptions(data: unknown): SelectOption[] {
  const rows = ((data as { data?: LocationRow[] })?.data ?? []) as LocationRow[];
  return rows
    .map((r) => ({ value: r.id, label: r.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Locations IO (be1-app useLocations parity). */
export const locationsService = {
  async listCountries(): Promise<SelectOption[]> {
    const { data } = await apiClient.post('/locations/countries/list');
    return toOptions(data);
  },

  async listStates(countryId: string): Promise<SelectOption[]> {
    const { data } = await apiClient.post(`/locations/countries/${countryId}/states/list`);
    return toOptions(data);
  },

  async listCities(stateId: string): Promise<SelectOption[]> {
    const { data } = await apiClient.post(`/locations/states/${stateId}/cities/list`);
    return toOptions(data);
  },
};
