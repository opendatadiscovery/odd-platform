import { useQuery } from '@tanstack/react-query';
import { integrationApi } from 'lib/api';
import type { IntegrationApiGetIntegrationRequest } from 'generated-sources';

export function useIntegrationPreviews() {
  return useQuery(['integrationPreviews'], () => integrationApi.getIntegrationPreviews());
}

export function useIntegration({ integrationId }: IntegrationApiGetIntegrationRequest) {
  return useQuery(['integration', integrationId], () =>
    integrationApi.getIntegration({ integrationId })
  );
}
