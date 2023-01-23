import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared';
import { useAppParams, useAppPaths, useQueryParams } from 'lib/hooks';
import {
  getDataEntityDetails,
  getDataEntityAlertsCount,
  getDatasetTestReportTotal,
  getIsDataEntityBelongsToClass,
} from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/Activity/common';
import { defaultLineageQuery } from '../Lineage/lineageLib/constants';

const DataEntityDetailsTabs: React.FC = () => {
  const { dataEntityId, viewType } = useAppParams();
  const { defaultQueryString: lineageQueryString } = useQueryParams(defaultLineageQuery);
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);
  const {
    dataEntityOverviewPath,
    datasetStructurePath,
    dataEntityLineagePath,
    dataEntityTestReportPath,
    dataEntityLinkedItemsPath,
    dataEntityHistoryPath,
    dataEntityAlertsPath,
    dataEntityActivityPath,
    dataEntityCollaborationPath,
  } = useAppPaths();

  const openAlertsCount = useAppSelector(getDataEntityAlertsCount(dataEntityId));
  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));
  const datasetQualityTestReportTotal = useAppSelector(
    getDatasetTestReportTotal(dataEntityId)
  );
  const { isDataset, isQualityTest, isTransformer } = useAppSelector(
    getIsDataEntityBelongsToClass(dataEntityId)
  );

  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'Overview',
        link: dataEntityOverviewPath(dataEntityId),
        value: 'overview',
      },
      {
        name: 'Structure',
        link: datasetStructurePath(dataEntityId),
        hidden: !isDataset,
        value: 'structure',
      },
      {
        name: 'Lineage',
        link: dataEntityLineagePath(dataEntityId, lineageQueryString),
        hidden: isQualityTest,
        value: 'lineage',
      },
      {
        name: 'Test reports',
        link: dataEntityTestReportPath(dataEntityId),
        hidden: !isDataset || !datasetQualityTestReportTotal,
        value: 'test-reports',
      },
      {
        name: 'History',
        link: dataEntityHistoryPath(dataEntityId),
        hidden: !isQualityTest && !isTransformer,
        value: 'history',
      },
      {
        name: 'Alerts',
        link: dataEntityAlertsPath(dataEntityId),
        value: 'alerts',
        hint: openAlertsCount > 0 ? openAlertsCount : undefined,
        hintType: 'alert',
      },
      {
        name: 'Linked items',
        link: dataEntityLinkedItemsPath(dataEntityId),
        hidden: !dataEntityDetails?.hasChildren,
        value: 'linked-items',
      },
      {
        name: 'Activity',
        link: dataEntityActivityPath(dataEntityId, activityQueryString),
        value: 'activity',
      },
      {
        name: 'Collaboration',
        link: dataEntityCollaborationPath(dataEntityId),
        value: 'collaboration',
      },
    ]);
  }, [
    dataEntityId,
    isQualityTest,
    isDataset,
    dataEntityDetails,
    openAlertsCount,
    datasetQualityTestReportTotal,
    lineageQueryString,
    activityQueryString,
  ]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(viewType ? tabs.findIndex(tab => tab.value === viewType) : 0);
  }, [tabs, viewType]);

  return (
    <>
      {tabs.length && selectedTab >= 0 ? (
        <AppTabs
          type='primary'
          items={tabs}
          selectedTab={selectedTab}
          handleTabChange={() => {}}
        />
      ) : null}
    </>
  );
};

export default DataEntityDetailsTabs;
