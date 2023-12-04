import React from 'react';
import { Grid } from '@mui/material';
import capitalize from 'lodash/capitalize';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import { integrationsPath } from 'routes';
import type { Integration } from 'generated-sources';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';
import { useLocation, useMatch } from 'react-router-dom';

interface IntegrationTabsProps {
  titles: string[];
  integrationId: Integration['id'];
}

const IntegrationTabs: React.FC<IntegrationTabsProps> = ({ titles, integrationId }) => {
  const { updatePath } = useIsEmbeddedPath();
  const match = useMatch(useLocation().pathname);

  const [selectedTab, setSelectedTab] = React.useState(0);

  const tabs = React.useMemo<AppTabItem[]>(
    () =>
      titles.map(title => ({
        name: capitalize(title),
        link: updatePath(integrationsPath(integrationId, title)),
      })),
    [titles]
  );

  useSetSelectedTab(tabs, match, setSelectedTab);

  return (
    <Grid sx={{ mt: 1 }}>
      <AppTabs
        type='primary'
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={() => {}}
      />
    </Grid>
  );
};

export default IntegrationTabs;
