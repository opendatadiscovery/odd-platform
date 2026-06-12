import React, { type FC, useMemo } from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { usePermissions } from 'lib/hooks';
import { managementPath } from 'routes';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';

const ManagementTabs: FC = () => {
  const { t } = useTranslation();
  const { hasAccessTo } = usePermissions();

  const hideAssociations = useMemo(
    () => !hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE),
    [hasAccessTo]
  );

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Namespaces'),
        link: managementPath('namespaces'),
      },
      {
        name: t('Datasources'),
        link: managementPath('datasources'),
      },
      {
        name: t('Integrations'),
        link: managementPath('integrations'),
      },
      {
        name: t('Collectors'),
        link: managementPath('collectors'),
      },
      { name: t('Owners'), link: managementPath('owners') },
      { name: t('Tags'), link: managementPath('tags') },
      {
        name: t('Associations'),
        link: managementPath('associations'),
        hidden: hideAssociations,
      },
      { name: t('Roles'), link: managementPath('roles') },
      {
        name: t('Policies'),
        link: managementPath('policies'),
      },
    ],
    [hideAssociations, t]
  );

  const selectedTab = useSetSelectedTab(tabs);

  return (
    <Grid sx={{ p: 0.5 }}>
      <AppTabs
        orientation='vertical'
        type='menu'
        items={tabs}
        selectedTab={selectedTab}
      />
    </Grid>
  );
};

export default ManagementTabs;
