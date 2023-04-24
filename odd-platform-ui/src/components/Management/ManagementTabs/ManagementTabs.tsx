import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { useAppParams, useAppPaths, usePermissions } from 'lib/hooks';
import { Grid } from '@mui/material';

const ManagementTabs: React.FC = () => {
  const { managementViewType } = useAppParams();
  const { ManagementRoutes } = useAppPaths();
  const { hasAccessTo } = usePermissions();

  const [selectedTab, setSelectedTab] = React.useState(0);

  const hideAssociations = React.useMemo(
    () => !hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE),
    [hasAccessTo]
  );

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      { name: 'Namespaces', link: ManagementRoutes.namespaces },
      { name: 'Datasources', link: ManagementRoutes.datasources },
      { name: 'Integrations', link: ManagementRoutes.integrations },
      { name: 'Collectors', link: ManagementRoutes.collectors },
      { name: 'Owners', link: ManagementRoutes.owners },
      { name: 'Tags', link: ManagementRoutes.tags },
      { name: 'Labels', link: ManagementRoutes.labels },
      {
        name: 'Associations',
        link: ManagementRoutes.associations,
        hidden: hideAssociations,
      },
      { name: 'Roles', link: ManagementRoutes.roles },
      { name: 'Policies', link: ManagementRoutes.policies },
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
