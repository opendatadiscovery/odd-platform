import { useQuery } from '@tanstack/react-query';
import { integrationApi } from 'lib/api';
import type {
  IntegrationApiGetIntegrationRequest,
  Integration as GeneratedIntegration,
} from 'generated-sources';
import type { ErrorState } from 'redux/interfaces';
import type { Integration } from 'lib/interfaces';

export function useIntegrationPreviews() {
  return useQuery(['integrationPreviews'], () => integrationApi.getIntegrationPreviews());
}

export function useIntegration({ integrationId }: IntegrationApiGetIntegrationRequest) {
  return useQuery<GeneratedIntegration, ErrorState, Integration>(
    ['integration', integrationId],
    () => integrationApi.getIntegration({ integrationId }),
    {
      select: ({ id, installed, name, description, contentBlocks }) => {
        const contentByTitle = contentBlocks.reduce<Integration['contentByTitle']>(
          (memo, block) => {
            const lowerCasedTitle = block.title.toLowerCase();

            return {
              ...memo,
              [lowerCasedTitle]: {
                ...memo[lowerCasedTitle],
                content: block.content,
                codeSnippets: block.codeSnippets,
              },
            };
          },
          {}
        );

        return { id, name, description, installed, contentByTitle };
      },
    }
  );
}
