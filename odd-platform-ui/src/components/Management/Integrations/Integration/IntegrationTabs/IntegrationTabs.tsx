import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { Grid } from '@mui/material';

const IntegrationTabs: React.FC = () => {
  const { integrationViewType } = useAppParams();
  const { ManagementRoutes } = useAppPaths();

  const [selectedTab, setSelectedTab] = React.useState(0);

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      { name: 'Overview', link: ManagementRoutes.overview },
      { name: 'Configure', link: ManagementRoutes.configure },
    ],
    []
  );

  React.useEffect(() => {
    setSelectedTab(
      integrationViewType
        ? tabs.findIndex(tab => tab.name.toLowerCase() === integrationViewType)
        : 0
    );
  }, [integrationViewType]);

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
