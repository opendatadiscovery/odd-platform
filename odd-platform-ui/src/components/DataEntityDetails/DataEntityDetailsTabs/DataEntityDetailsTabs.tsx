import React, { useMemo } from 'react';
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
import { generatePath, useLocation, useMatch } from 'react-router-dom';
import { DataEntitiesRoutes } from 'routes/dataEntitiesRoutes';
import { defaultLineageQuery } from '../Lineage/HierarchyLineage/lineageLib/constants';
import { defaultDEGLineageQuery } from '../Lineage/DEGLineage/lib/constants';

const DataEntityDetailsTabs: React.FC = () => {
  const { t } = useTranslation();
  const { dataEntityId } = useAppParams();
  const { defaultQueryString: lineageQueryString } = useQueryParams(defaultLineageQuery);
  const { defaultQueryString: degLineageQueryString } =
    useQueryParams(defaultDEGLineageQuery);
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);
  const {
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
  const pathMatch = useMatch(useLocation().pathname);

  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Overview'),
        link: dataEntityOverviewPath(dataEntityId),
        value: DataEntitiesRoutes.OVERVIEW_PATH,
      },
      {
        name: t('Structure'),
        link: datasetStructurePath('overview', dataEntityId),
        hidden: !isDataset,
        value: DataEntitiesRoutes.STRUCTURE_PATH,
      },
      {
        name: t('Lineage'),
        link: dataEntityLineagePath(
          dataEntityId,
          isDEG ? degLineageQueryString : lineageQueryString
        ),
        hidden: isQualityTest || isStatusDeleted,
        value: DataEntitiesRoutes.LINEAGE_PATH,
      },
      {
        name: t('Test reports'),
        link: dataEntityTestReportPath(dataEntityId),
        hidden: !isDataset || !datasetQualityTestReportTotal || isStatusDeleted,
        value: DataEntitiesRoutes.TEST_REPORTS_PATH,
      },
      {
        name: t('History'),
        link: dataEntityHistoryPath(dataEntityId),
        hidden: (!isQualityTest && !isTransformer) || isStatusDeleted,
        value: DataEntitiesRoutes.HISTORY_PATH,
      },
      {
        name: t('Alerts'),
        link: dataEntityAlertsPath(dataEntityId),
        value: DataEntitiesRoutes.ALERTS_PATH,
        hint: openAlertsCount > 0 ? openAlertsCount : undefined,
        hintType: 'alert',
        hidden: isStatusDeleted,
      },
      {
        name: t('Linked entities'),
        link: dataEntityLinkedEntitiesPath(dataEntityId),
        hidden: !dataEntityDetails?.hasChildren || isStatusDeleted,
        value: DataEntitiesRoutes.LINKED_ENTITIES_PATH,
      },
      {
        name: t('Query examples'),
        link: generatePath(DataEntitiesRoutes.QUERY_EXAMPLES_PATH, {
          dataEntityId: String(dataEntityId),
        }),
        value: DataEntitiesRoutes.QUERY_EXAMPLES_PATH,
        hidden: !isDataset,
      },
      {
        name: t('Activity'),
        link: dataEntityActivityPath(dataEntityId, activityQueryString),
        value: DataEntitiesRoutes.ACTIVITY_PATH,
      },
      {
        name: t('Discussions'),
        link: dataEntityCollaborationPath(dataEntityId),
        value: DataEntitiesRoutes.DISCUSSIONS_PATH,
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
    const foundIndex = tabs.findIndex(({ link }) => {
      const pathname = pathMatch?.pathname;
      return link && pathname
        ? pathname.includes(link) || link.includes(pathname)
        : false;
    });
    setSelectedTab(foundIndex === -1 ? 0 : foundIndex);
  }, [tabs, pathMatch]);

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
