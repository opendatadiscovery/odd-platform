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

const integrationMock = {
  id: '1',
  name: 'Snow flake',
  description: 'Small snowflake description',
  installed: true,
  contentBlocks: [
    {
      title: 'Overview',
      content: '```\ndef main():\n  print()\n```',
      codeSnippets: [],
    },
    {
      title: 'Configure',
      content: 'this is Mos Espa, the capital of Tatooine',
      codeSnippets: [],
    },
  ],
};

export function useIntegration({ integrationId }: IntegrationApiGetIntegrationRequest) {
  return useQuery<GeneratedIntegration, ErrorState, Integration>(
    ['integration', integrationId],
    () => integrationApi.getIntegration({ integrationId }),
    {
      initialData: integrationMock,
      select: integration => {
        const contentByTitle = integration.contentBlocks.reduce<
          Integration['contentByTitle']
        >((memo, block) => {
          const lowerCasedTitle = block.title.toLowerCase();

          return {
            ...memo,
            [lowerCasedTitle]: {
              ...memo[lowerCasedTitle],
              content: block.content,
              codeSnippets: block.codeSnippets,
            },
          };
        }, {});

        return {
          id: integration.id,
          name: integration.name,
          description: integration.description,
          installed: integration.installed,
          contentByTitle,
        };
      },
    }
  );
}
