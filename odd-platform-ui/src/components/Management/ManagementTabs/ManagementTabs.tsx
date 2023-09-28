import React, { type FC, useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { useAppParams, useAppPaths, usePermissions } from 'lib/hooks';

const ManagementTabs: FC = () => {
  const { t } = useTranslation();
  const { managementViewType } = useAppParams();
  const { ManagementRoutes } = useAppPaths();
  const { hasAccessTo } = usePermissions();

  const [selectedTab, setSelectedTab] = useState(0);

  const hideAssociations = useMemo(
    () => !hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE),
    [hasAccessTo]
  );

  const tabs = useMemo<AppTabItem[]>(
    () => [
      { name: t('Namespaces'), link: ManagementRoutes.namespaces },
      { name: t('Datasources'), link: ManagementRoutes.datasources },
      { name: t('Integrations'), link: ManagementRoutes.integrations },
      { name: t('Collectors'), link: ManagementRoutes.collectors },
      { name: t('Owners'), link: ManagementRoutes.owners },
      { name: t('Tags'), link: ManagementRoutes.tags },
      {
        name: t('Associations'),
        link: ManagementRoutes.associations,
        hidden: hideAssociations,
      },
      { name: t('Roles'), link: ManagementRoutes.roles },
      { name: t('Policies'), link: ManagementRoutes.policies },
    ],
    [hideAssociations, t]
  );

  useEffect(() => {
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
