import React from 'react';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useAppParams, useAppPaths, useQueryParams } from 'lib/hooks';
import {
  getDataEntityAlertsCount,
  getDataEntityDetails,
  getDatasetTestReportTotal,
  getIsDataEntityBelongsToClass,
  getIsEntityStatusDeleted,
} from 'redux/selectors';
import { useAppSelector } from 'redux/lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import { generatePath } from 'react-router-dom';
import { DataEntitiesRoutes } from 'routes/dataEntitiesRoutes';
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
    dataEntityLinkedEntitiesPath,
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
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

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
        hidden: isQualityTest || isStatusDeleted,
        value: DataEntityRoutes.lineage,
      },
      {
        name: t('Test reports'),
        link: dataEntityTestReportPath(dataEntityId),
        hidden: !isDataset || !datasetQualityTestReportTotal || isStatusDeleted,
        value: DataEntityRoutes.testReports,
      },
      {
        name: t('History'),
        link: dataEntityHistoryPath(dataEntityId),
        hidden: (!isQualityTest && !isTransformer) || isStatusDeleted,
        value: DataEntityRoutes.history,
      },
      {
        name: t('Alerts'),
        link: dataEntityAlertsPath(dataEntityId),
        value: DataEntityRoutes.alerts,
        hint: openAlertsCount > 0 ? openAlertsCount : undefined,
        hintType: 'alert',
        hidden: isStatusDeleted,
      },
      {
        name: t('Linked entities'),
        link: dataEntityLinkedEntitiesPath(dataEntityId),
        hidden: !dataEntityDetails?.hasChildren || isStatusDeleted,
        value: DataEntityRoutes.linkedEntities,
      },
      {
        name: t('Query examples'),
        link: generatePath(DataEntitiesRoutes.QUERY_EXAMPLES_PATH, {
          dataEntityId: String(dataEntityId),
        }),
        value: 'query-examples',
        hidden: !isDataset,
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
        hidden: isStatusDeleted,
      },
    ],
    [
      dataEntityId,
      activityQueryString,
      dataEntityDetails?.hasChildren,
      openAlertsCount,
      isDataset,
      isQualityTest,
      isTransformer,
      datasetQualityTestReportTotal,
      isDEG,
      degLineageQueryString,
      lineageQueryString,
      dataEntityDetails.status,
      isStatusDeleted,
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
