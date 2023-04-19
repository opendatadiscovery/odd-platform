import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useAppParams, useAppPaths } from 'lib/hooks';
import { useAtom } from 'jotai';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchOwnerAssociationRequestList } from 'redux/thunks';
import { getOwnerAssociationRequestsListFetchingStatuses } from 'redux/selectors';
import { queryAtom } from '../OwnerAssociationsStore/OwnerAssociationsAtoms';

interface OwnerAssociationsTabsProps {
  newRequestsTabHint: number;
  size: number;
}

const OwnerAssociationsTabs: React.FC<OwnerAssociationsTabsProps> = ({
  newRequestsTabHint,
  size,
}) => {
  const dispatch = useAppDispatch();
  const { associationsViewType } = useAppParams();
  const { ManagementRoutes } = useAppPaths();

  const [, setQuery] = useAtom(queryAtom);

  const { isLoading } = useAppSelector(getOwnerAssociationRequestsListFetchingStatuses);

  const tabs = React.useMemo<AppTabItem<boolean>[]>(
    () => [
      {
        name: 'New',
        hint: newRequestsTabHint,
        link: ManagementRoutes.associationsNew,
        value: true,
      },
      {
        name: 'Resolved',
        link: ManagementRoutes.associationsResolved,
        value: false,
      },
    ],
    [newRequestsTabHint]
  );

  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    const tabIdx = associationsViewType
      ? tabs.findIndex(tab => tab.link === associationsViewType)
      : 0;
    setSelectedTab(tabIdx);
  }, [tabs, associationsViewType]);

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
