import React from 'react';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { type AlertCountInfo, AlertViewType } from 'generated-sources';
import { useQueryParams } from 'lib/hooks';
import { type AlertsQuery, defaultAlertsQuery } from 'components/Alerts/common';

interface AlertsTabsProps {
  counts: AlertCountInfo;
  isCountsFetching: boolean;
}

// Mirrors Activity's ActivityTabs: the four alert views (All / My Objects / Downstream / Upstream)
// are query-param tabs (?type=...), not sub-routes, with live hint counts from AlertCountInfo.
const AlertsTabs: React.FC<AlertsTabsProps> = ({
  counts: { totalCount, myObjectsCount, downstreamCount, upstreamCount },
  isCountsFetching,
}) => {
  const { t } = useTranslation();
  const {
    queryParams: { type },
    setQueryParams,
  } = useQueryParams<AlertsQuery>(defaultAlertsQuery);

  const [tabs, setTabs] = React.useState<AppTabItem<AlertViewType>[]>([]);
  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    setTabs([
      {
        name: t('All'),
        hint: totalCount,
        value: AlertViewType.ALL,
      },
      {
        name: t('My Objects'),
        hint: myObjectsCount,
        value: AlertViewType.MY_OBJECTS,
      },
      {
        name: t('Downstream'),
        hint: downstreamCount,
        value: AlertViewType.DOWNSTREAM,
      },
      {
        name: t('Upstream'),
        hint: upstreamCount,
        value: AlertViewType.UPSTREAM,
      },
    ]);
  }, [totalCount, myObjectsCount, downstreamCount, upstreamCount, t]);

  React.useEffect(() => {
    setSelectedTab(type ? tabs.findIndex(tab => tab.value === type) : 0);
  }, [tabs, type]);

  const onAlertViewTypeChange = (newTypeIndex: number) => {
    const newAlertViewType = tabs[newTypeIndex].value ?? AlertViewType.ALL;
    setQueryParams(prev => ({ ...prev, type: newAlertViewType }));
  };

  return (
    <AppTabs
      type='primary'
      items={tabs}
      selectedTab={selectedTab}
      handleTabChange={onAlertViewTypeChange}
      isHintUpdating={isCountsFetching}
    />
  );
};

export default AlertsTabs;
