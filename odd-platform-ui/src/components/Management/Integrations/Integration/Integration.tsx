import React, { type FC, useMemo } from 'react';
import { useAppParams } from 'lib/hooks';
import { useIntegration } from 'lib/hooks/api';
import {
  AppErrorPage,
  AppLoadingPage,
  EmptyContentPlaceholder,
} from 'components/shared/elements';
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

  const titles = useMemo(
    () => Object.keys(integration?.contentByTitle || {}),
    [integration?.contentByTitle]
  );

  if (isLoading) {
    return <AppLoadingPage />;
  }

  if (isError) {
    return <AppErrorPage showError={isError} error={error} />;
  }

  if (!integration) {
    return <EmptyContentPlaceholder />;
  }

  return (
    <>
      <IntegrationHeader
        id={integration.id}
        name={integration.name}
        description={integration.description}
      />
      <IntegrationTabs titles={titles} />
      <IntegrationRoutes contentByTitle={integration.contentByTitle} />
    </>
  );
};

export default Integration;
