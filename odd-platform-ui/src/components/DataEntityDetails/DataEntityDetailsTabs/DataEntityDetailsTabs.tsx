import React from 'react';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
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
} from 'components/shared/elements/Activity/common';
import { useTranslation } from 'react-i18next';
import { defaultLineageQuery } from '../Lineage/HierarchyLineage/lineageLib/constants';
import { defaultDEGLineageQuery } from '../Lineage/DEGLineage/lib/constants';

const DataEntityDetailsTabs: React.FC = () => {
  const { t } = useTranslation();
  const { dataEntityId, dataEntityViewType } = useAppParams();
  const { defaultQueryString: lineageQueryString } = useQueryParams(defaultLineageQuery);
  const { defaultQueryString: degLineageQueryString } =
    useQueryParams(defaultDEGLineageQuery);
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
  const { isDataset, isQualityTest, isTransformer, isDEG } = useAppSelector(
    getIsDataEntityBelongsToClass(dataEntityId)
  );

  const tabs = React.useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Overview'),
        link: dataEntityOverviewPath(dataEntityId),
        value: DataEntityRoutes.overview,
      },
      {
        name: t('Structure'),
        link: datasetStructurePath(DataEntityRoutes.overview, dataEntityId),
        hidden: !isDataset,
        value: DataEntityRoutes.structure,
      },
      {
        name: t('Lineage'),
        link: dataEntityLineagePath(
          dataEntityId,
          isDEG ? degLineageQueryString : lineageQueryString
        ),
        hidden: isQualityTest,
        value: DataEntityRoutes.lineage,
      },
      {
        name: t('Test reports'),
        link: dataEntityTestReportPath(dataEntityId),
        hidden: !isDataset || !datasetQualityTestReportTotal,
        value: DataEntityRoutes.testReports,
      },
      {
        name: t('History'),
        link: dataEntityHistoryPath(dataEntityId),
        hidden: !isQualityTest && !isTransformer,
        value: DataEntityRoutes.history,
      },
      {
        name: t('Alerts'),
        link: dataEntityAlertsPath(dataEntityId),
        value: DataEntityRoutes.alerts,
        hint: openAlertsCount > 0 ? openAlertsCount : undefined,
        hintType: 'alert',
      },
      {
        name: t('Linked items'),
        link: dataEntityLinkedItemsPath(dataEntityId),
        hidden: !dataEntityDetails?.hasChildren,
        value: DataEntityRoutes.linkedItems,
      },
      {
        name: t('Activity'),
        link: dataEntityActivityPath(dataEntityId, activityQueryString),
        value: 'activity',
      },
      {
        name: t('Discussions'),
        link: dataEntityCollaborationPath(dataEntityId),
        value: DataEntityRoutes.discussions,
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
      isDEG,
      degLineageQueryString,
      lineageQueryString,
      t,
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
