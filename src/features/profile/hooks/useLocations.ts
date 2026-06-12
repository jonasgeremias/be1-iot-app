import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys.constants';
import type { SelectOption } from '@/shared/ui/Select';

import { locationsService } from '../services/locations.service';

/**
 * State + city options for the profile edit form (be1-app parity): resolve
 * Brazil's id from the countries list, then load its states and the selected
 * state's cities.
 */
export function useLocations(stateId: string | null) {
  const countries = useQuery({
    queryKey: queryKeys.locations.countries,
    queryFn: () => locationsService.listCountries(),
    staleTime: 60 * 60_000,
  });

  const brazilId =
    countries.data?.find((c: SelectOption) => c.label.toLowerCase() === 'brasil')?.value ?? null;

  const states = useQuery({
    queryKey: queryKeys.locations.states(brazilId ?? ''),
    queryFn: () => locationsService.listStates(brazilId!),
    enabled: !!brazilId,
    staleTime: 60 * 60_000,
  });

  const cities = useQuery({
    queryKey: queryKeys.locations.cities(stateId ?? ''),
    queryFn: () => locationsService.listCities(stateId!),
    enabled: !!stateId,
    staleTime: 30 * 60_000,
  });

  return {
    statesOptions: states.data ?? [],
    citiesOptions: cities.data ?? [],
    isStatesLoading: countries.isLoading || states.isLoading,
    isCitiesLoading: cities.isFetching,
  };
}
