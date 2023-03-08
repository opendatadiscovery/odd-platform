import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared';
import { Permission } from 'generated-sources';
import { useAppParams, useAppPaths, usePermissions } from 'lib/hooks';
import { Grid } from '@mui/material';

const ManagementTabs: React.FC = () => {
  const { managementViewType } = useAppParams();
  const { managementPath, managementOwnerAssociationsPath, ManagementRoutes } =
    useAppPaths();
  const { hasAccessTo } = usePermissions();

  const [selectedTab, setSelectedTab] = React.useState(0);

  const hideAssociations = React.useMemo(
    () => !hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE),
    [hasAccessTo]
  );

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      { name: 'Namespaces', link: managementPath(ManagementRoutes.namespaces) },
      { name: 'Datasources', link: managementPath(ManagementRoutes.datasources) },
      { name: 'Collectors', link: managementPath(ManagementRoutes.collectors) },
      { name: 'Owners', link: managementPath(ManagementRoutes.owners) },
      { name: 'Tags', link: managementPath(ManagementRoutes.tags) },
      { name: 'Labels', link: managementPath(ManagementRoutes.labels) },
      {
        name: 'Associations',
        link: managementPath(ManagementRoutes.associations),
        hidden: hideAssociations,
      },
      { name: 'Roles', link: managementPath(ManagementRoutes.roles) },
      { name: 'Policies', link: managementPath(ManagementRoutes.policies) },
    ],
    [hideAssociations]
  );

  React.useEffect(() => {
    setSelectedTab(
      managementViewType
        ? tabs.findIndex(tab => tab.name.toLowerCase() === managementViewType)
        : 0
    );
  }, [tabs, managementViewType]);

  console.log('managementViewType', managementViewType);

  return (
    <Grid sx={{ p: 0.5 }}>
      <AppTabs
        orientation='vertical'
        type='menu'
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={() => {}}
      />
    </Grid>
  );
};

export default ManagementTabs;
