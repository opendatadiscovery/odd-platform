import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { type ActivityCountInfo, ActivityType } from 'generated-sources';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';

interface ActivityTabsProps {
  counts: ActivityCountInfo;
  isCountsFetching: boolean;
}

const ActivityTabs: React.FC<ActivityTabsProps> = ({
  counts: { totalCount, myObjectsCount, downstreamCount, upstreamCount },
  isCountsFetching,
}) => {
  const {
    queryParams: { type },
    setQueryParams,
  } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const [tabs, setTabs] = React.useState<AppTabItem<ActivityType>[]>([]);
  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    setTabs([
      {
        name: 'All',
        hint: totalCount,
        value: ActivityType.ALL,
      },
      {
        name: 'My Objects',
        hint: myObjectsCount,
        value: ActivityType.MY_OBJECTS,
      },
      {
        name: 'Downstream',
        hint: downstreamCount,
        value: ActivityType.DOWNSTREAM,
      },
      {
        name: 'Upstream',
        hint: upstreamCount,
        value: ActivityType.UPSTREAM,
      },
    ]);
  }, [totalCount, myObjectsCount, downstreamCount, upstreamCount]);

  React.useEffect(() => {
    setSelectedTab(type ? tabs.findIndex(tab => tab.value === type) : 0);
  }, [tabs, type]);

  const onActivityTypeChange = (newTypeIndex: number) => {
    const newActivityType = tabs[newTypeIndex].value ?? ActivityType.ALL;
    setQueryParams(prev => ({ ...prev, type: newActivityType }));
  };

  return (
    <AppTabs
      type='primary'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={onActivityTypeChange}
      isHintUpdating={isCountsFetching}
    />
  );
};

export default ActivityTabs;
