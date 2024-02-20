import React from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import { getOwnerAssociationRequestsListFetchingStatuses } from 'redux/selectors';
import { associationsPath } from 'routes';
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

  const tabs = React.useMemo<AppTabItem<boolean>[]>(
    () => [
      {
        name: t('New'),
        hint: newRequestsTabHint,
        link: associationsPath('new'),
      },
      {
        name: t('Resolved'),
        link: associationsPath('resolved'),
      },
    ],
    [t, newRequestsTabHint]
  );

  const selectedTab = useSetSelectedTab(tabs);

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
