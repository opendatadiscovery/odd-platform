import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared';
import { Permission } from 'generated-sources';
import { useAppParams, useAppPaths, usePermissions } from 'lib/hooks';
import { Grid } from '@mui/material';

const ManagementTabs: React.FC = () => {
  const { viewType } = useAppParams();
  const { managementPath, managementOwnerAssociationsPath, ManagementRoutesEnum } =
    useAppPaths();
  const { hasAccessTo } = usePermissions();

  const [selectedTab, setSelectedTab] = React.useState(0);

  const hideAssociations = React.useMemo(
    () => !hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE),
    [hasAccessTo]
  );

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      { name: 'Namespaces', link: managementPath(ManagementRoutesEnum.namespaces) },
      { name: 'Datasources', link: managementPath(ManagementRoutesEnum.datasources) },
      { name: 'Collectors', link: managementPath(ManagementRoutesEnum.collectors) },
      { name: 'Owners', link: managementPath(ManagementRoutesEnum.owners) },
      { name: 'Tags', link: managementPath(ManagementRoutesEnum.tags) },
      { name: 'Labels', link: managementPath(ManagementRoutesEnum.labels) },
      {
        name: 'Associations',
        link: managementOwnerAssociationsPath(ManagementRoutesEnum.associationsNew),
        hidden: hideAssociations,
      },
      { name: 'Roles', link: managementPath(ManagementRoutesEnum.roles) },
      { name: 'Policies', link: managementPath(ManagementRoutesEnum.policies) },
    ],
    [hideAssociations]
  );

  React.useEffect(() => {
    setSelectedTab(
      viewType ? tabs.findIndex(tab => tab.name.toLowerCase() === viewType) : 0
    );
  }, [tabs, viewType]);

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
