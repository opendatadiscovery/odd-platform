import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared';
import { useAppParams, useAppPaths, useQueryParams } from 'lib/hooks';
import {
  getDataEntityAlertsCount,
  getDataEntityDetails,
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
  const { dataEntityId, dataEntityViewType } = useAppParams();
  const { defaultQueryString: lineageQueryString } = useQueryParams(defaultLineageQuery);
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);
  const {
    DataEntityRoutes,
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

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      {
        name: 'Overview',
        link: dataEntityOverviewPath(dataEntityId),
        value: DataEntityRoutes.overview,
      },
      {
        name: 'Structure',
        link: datasetStructurePath(dataEntityId),
        hidden: !isDataset,
        value: DataEntityRoutes.structure,
      },
      {
        name: 'Lineage',
        link: dataEntityLineagePath(dataEntityId, lineageQueryString),
        hidden: isQualityTest,
        value: DataEntityRoutes.lineage,
      },
      {
        name: 'Test reports',
        link: dataEntityTestReportPath(dataEntityId),
        hidden: !isDataset || !datasetQualityTestReportTotal,
        value: DataEntityRoutes.testReports,
      },
      {
        name: 'History',
        link: dataEntityHistoryPath(dataEntityId),
        hidden: !isQualityTest && !isTransformer,
        value: DataEntityRoutes.history,
      },
      {
        name: 'Alerts',
        link: dataEntityAlertsPath(dataEntityId),
        value: DataEntityRoutes.alerts,
        hint: openAlertsCount > 0 ? openAlertsCount : undefined,
        hintType: 'alert',
      },
      {
        name: 'Linked items',
        link: dataEntityLinkedItemsPath(dataEntityId),
        hidden: !dataEntityDetails?.hasChildren,
        value: DataEntityRoutes.linkedItems,
      },
      {
        name: 'Activity',
        link: dataEntityActivityPath(dataEntityId, activityQueryString),
        value: 'activity',
      },
      {
        name: 'Collaboration',
        link: dataEntityCollaborationPath(dataEntityId),
        value: DataEntityRoutes.collaboration,
      },
    ],
    [
      dataEntityId,
      activityQueryString,
      dataEntityDetails,
      openAlertsCount,
      isDataset,
      isQualityTest,
      isTransformer,
      datasetQualityTestReportTotal,
      lineageQueryString,
    ]
  );

  const [selectedTab, setSelectedTab] = React.useState(-1);

  React.useEffect(() => {
    setSelectedTab(
      dataEntityViewType ? tabs.findIndex(tab => tab.value === dataEntityViewType) : 0
    );
  }, [tabs, dataEntityViewType]);

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
