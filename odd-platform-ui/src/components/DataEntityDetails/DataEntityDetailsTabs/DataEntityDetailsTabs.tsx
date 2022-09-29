import React from 'react';
import { AppTabItem, AppTabs } from 'components/shared';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  getDataEntityDetails,
  getDataEntityOpenAlertsCount,
  getDatasetTestReportTotal,
  getIsDataEntityBelongsToClass,
} from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';

const DataEntityDetailsTabs: React.FC = () => {
  const { dataEntityId, viewType } = useAppParams();
  const {
    dataEntityOverviewPath,
    datasetStructurePath,
    dataEntityLineagePath,
    dataEntityTestReportPath,
    dataEntityLinkedItemsPath,
    dataEntityHistoryPath,
    dataEntityAlertsPath,
    dataEntityActivityPath,
  } = useAppPaths();

  const openAlertsCount = useAppSelector(getDataEntityOpenAlertsCount);
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
        link: dataEntityLineagePath(dataEntityId),
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
        hint: openAlertsCount,
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
        link: dataEntityActivityPath(dataEntityId),
        value: 'activity',
      },
    ]);
  }, [
    dataEntityId,
    isQualityTest,
    isDataset,
    dataEntityDetails,
    openAlertsCount,
    datasetQualityTestReportTotal,
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
