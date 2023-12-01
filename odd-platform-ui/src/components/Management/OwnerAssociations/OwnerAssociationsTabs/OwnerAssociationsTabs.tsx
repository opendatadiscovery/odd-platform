import React from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import { getOwnerAssociationRequestsListFetchingStatuses } from 'redux/selectors';
import { associationsPath } from 'routes/managementRoutes';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import { useLocation, useMatch } from 'react-router-dom';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';
import { queryAtom } from '../OwnerAssociationsStore/OwnerAssociationsAtoms';

interface OwnerAssociationsTabsProps {
  newRequestsTabHint: number;
  size: number;
}

const OwnerAssociationsTabs: React.FC<OwnerAssociationsTabsProps> = ({
  newRequestsTabHint,
  size,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [, setQuery] = useAtom(queryAtom);

  const { isLoading } = useAppSelector(getOwnerAssociationRequestsListFetchingStatuses);
  const { updatePath } = useIsEmbeddedPath();
  const match = useMatch(useLocation().pathname);

  const tabs = React.useMemo<AppTabItem<boolean>[]>(
    () => [
      {
        name: t('New'),
        hint: newRequestsTabHint,
        link: updatePath(associationsPath('new')),
        value: true,
      },
      {
        name: t('Resolved'),
        link: updatePath(associationsPath('resolved')),
        value: false,
      },
    ],
    [t, newRequestsTabHint]
  );

  const [selectedTab, setSelectedTab] = React.useState(-1);
  useSetSelectedTab(tabs, match, setSelectedTab);

  const onTabChange = React.useCallback(() => {
    setQuery('');
    dispatch(fetchOwnerAssociationRequestList({ page: 1, size, active: true }));
    dispatch(fetchOwnerAssociationRequestList({ page: 1, size, active: false }));
  }, [size]);

  return (
    <AppTabs
      type='primary'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={onTabChange}
      isHintUpdating={isLoading}
    />
  );
};

export default OwnerAssociationsTabs;
