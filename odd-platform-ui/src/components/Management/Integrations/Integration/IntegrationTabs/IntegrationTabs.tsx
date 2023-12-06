import React from 'react';
import { Grid } from '@mui/material';
import capitalize from 'lodash/capitalize';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { integrationsPath } from 'routes';
import type { Integration } from 'generated-sources';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';

interface IntegrationTabsProps {
  titles: string[];
  integrationId: Integration['id'];
}

const IntegrationTabs: React.FC<IntegrationTabsProps> = ({ titles, integrationId }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  const tabs = React.useMemo<AppTabItem[]>(
    () =>
      titles.map(title => ({
        name: capitalize(title),
        link: integrationsPath(integrationId, title),
      })),
    [titles]
  );

  useSetSelectedTab(tabs, setSelectedTab);

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
