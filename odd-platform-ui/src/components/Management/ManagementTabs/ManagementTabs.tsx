import React, { type FC, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { Permission } from 'generated-sources';
import { usePermissions } from 'lib/hooks';
import { managementPath } from 'routes';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import { useLocation, useMatch } from 'react-router-dom';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';

const ManagementTabs: FC = () => {
  const { t } = useTranslation();
  const { hasAccessTo } = usePermissions();
  const { updatePath } = useIsEmbeddedPath();
  const match = useMatch(useLocation().pathname);

  const [selectedTab, setSelectedTab] = useState(0);

  const hideAssociations = useMemo(
    () => !hasAccessTo(Permission.OWNER_ASSOCIATION_MANAGE),
    [hasAccessTo]
  );

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Namespaces'),
        link: updatePath(managementPath('namespaces')),
      },
      {
        name: t('Datasources'),
        link: updatePath(managementPath('datasources')),
      },
      {
        name: t('Integrations'),
        link: updatePath(managementPath('integrations')),
      },
      {
        name: t('Collectors'),
        link: updatePath(managementPath('collectors')),
      },
      { name: t('Owners'), link: updatePath(managementPath('owners')) },
      { name: t('Tags'), link: updatePath(managementPath('tags')) },
      {
        name: t('Associations'),
        link: updatePath(managementPath('associations')),
        hidden: hideAssociations,
      },
      { name: t('Roles'), link: updatePath(managementPath('roles')) },
      {
        name: t('Policies'),
        link: updatePath(managementPath('policies')),
      },
    ],
    [hideAssociations, t]
  );

  useSetSelectedTab(tabs, match, setSelectedTab);

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
