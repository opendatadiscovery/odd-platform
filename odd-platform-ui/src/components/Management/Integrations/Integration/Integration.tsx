import React, { type FC } from 'react';
import { useAppParams } from 'lib/hooks';
import { useIntegration } from 'lib/hooks/api';
import { AppErrorPage, AppLoadingPage, EmptyContentPlaceholder } from 'components/shared';
import type { ErrorState } from 'redux/interfaces';
import type { Integration as IntegrationType } from 'generated-sources';
import IntegrationHeader from './IntegrationHeader/IntegrationHeader';
import IntegrationTabs from './IntegrationTabs/IntegrationTabs';
import IntegrationRoutes from './IntegrationRoutes/IntegrationRoutes';

const Integration: FC = () => {
  const { integrationId } = useAppParams();

  const {
    data: integration,
    isError,
    isLoading,
    error,
  } = useIntegration({ integrationId });

  if (isLoading) {
    return <AppLoadingPage />;
  }

  if (isError) {
    return <AppErrorPage showError={isError} error={error as ErrorState} />;
  }

  if (!integration) {
    return <EmptyContentPlaceholder />;
  }

  // const integration: IntegrationType = {
  //   id: '1',
  //   name: 'Snow flake',
  //   description: 'Small snowflake description',
  //   installed: true,
  //   textBlocks: [
  //     { title: 'Overview', content: '```\ndef main():\n  print()\n```' },
  //     { title: 'pre-def', content: 'this is Mos Espa, the capital of Tatooine' },
  //   ],
  //   codeSnippets: [],
  // };

  return (
    <>
      <IntegrationHeader name={integration.name} description={integration.description} />
      <IntegrationTabs />
      <IntegrationRoutes
        textBlocks={integration.textBlocks}
        codeSnippets={integration.codeSnippets}
      />
    </>
  );
};

export default Integration;
