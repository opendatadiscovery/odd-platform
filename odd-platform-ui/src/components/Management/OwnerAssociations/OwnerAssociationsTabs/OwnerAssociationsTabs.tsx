import React from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { associationsPath } from 'routes';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';
import { useQueryClient } from '@tanstack/react-query';
import { queryAtom } from '../OwnerAssociationsStore/OwnerAssociationsAtoms';

interface OwnerAssociationsTabsProps {
  newRequestsTabHint?: number;
  activeAssociationsTabHint?: number;
  size: number;
}

const OwnerAssociationsTabs: React.FC<OwnerAssociationsTabsProps> = ({
  newRequestsTabHint,
  activeAssociationsTabHint,
  size,
}) => {
  const { t } = useTranslation();
  const [, setQuery] = useAtom(queryAtom);
  const queryClient = useQueryClient();
  const tabs = React.useMemo<AppTabItem<boolean>[]>(
    () => [
      {
        name: 'New requests',
        hint: newRequestsTabHint,
        link: associationsPath('new'),
      },
      {
        name: 'Active associations',
        hint: activeAssociationsTabHint,
        link: associationsPath('active'),
      },
      {
        name: 'History',
        link: associationsPath('history'),
      },
    ],
    [t, newRequestsTabHint, activeAssociationsTabHint]
  );
  const selectedTab = useSetSelectedTab(tabs);
  const onTabChange = React.useCallback(() => {
    setQuery('');
    queryClient.invalidateQueries({ queryKey: ['ownerAssociationRequestList'] });
  }, [size]);

  return (
    <AppTabs
      type='primary'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={onTabChange}
    />
  );
};

export default OwnerAssociationsTabs;
