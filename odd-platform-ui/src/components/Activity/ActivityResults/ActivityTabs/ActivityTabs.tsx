import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const {
    queryParams: { type },
    setQueryParams,
  } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const [tabs, setTabs] = React.useState<AppTabItem<ActivityType>[]>([]);
  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    setTabs([
      {
        name: t('All'),
        hint: totalCount,
        value: ActivityType.ALL,
      },
      {
        name: t('My Objects'),
        hint: myObjectsCount,
        value: ActivityType.MY_OBJECTS,
      },
      {
        name: t('Downstream'),
        hint: downstreamCount,
        value: ActivityType.DOWNSTREAM,
      },
      {
        name: t('Upstream'),
        hint: upstreamCount,
        value: ActivityType.UPSTREAM,
      },
    ]);
  }, [totalCount, myObjectsCount, downstreamCount, upstreamCount, t]);

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
