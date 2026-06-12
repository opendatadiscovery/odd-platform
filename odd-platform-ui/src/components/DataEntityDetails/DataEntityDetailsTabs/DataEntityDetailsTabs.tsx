import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type AppTabItem, AppTabs } from 'components/shared/elements';
import { useQueryParams } from 'lib/hooks';
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
import {
  dataEntityDetailsPath,
  dataEntityLineagePath,
  dataEntityTestReportsPath,
  useDataEntityRouteParams,
} from 'routes';
import useSetSelectedTab from 'components/shared/elements/AppTabs/useSetSelectedTab';
import { defaultLineageQuery } from '../Lineage/HierarchyLineage/lineageLib/constants';
import { defaultDEGLineageQuery } from '../Lineage/DEGLineage/lib/constants';

const DataEntityDetailsTabs: React.FC = () => {
  const { t } = useTranslation();
  const { dataEntityId } = useDataEntityRouteParams();
  const { defaultQueryString: lineageQueryString } = useQueryParams(defaultLineageQuery);
  const { defaultQueryString: degLineageQueryString } =
    useQueryParams(defaultDEGLineageQuery);
  const { defaultQueryString: activityQueryString } =
    useQueryParams<ActivityQuery>(defaultActivityQuery);

  const openAlertsCount = useAppSelector(getDataEntityAlertsCount(dataEntityId));
  const dataEntityDetails = useAppSelector(getDataEntityDetails(dataEntityId));
  const datasetQualityTestReportTotal = useAppSelector(
    getDatasetTestReportTotal(dataEntityId)
  );
  const { isDataset, isQualityTest, isTransformer, isDEG } = useAppSelector(
    getIsDataEntityBelongsToClass(dataEntityId)
  );
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));
  const tabs = useMemo<AppTabItem[]>(
    () => [
      {
        name: t('Overview'),
        link: dataEntityDetailsPath(dataEntityId, 'overview'),
      },
      {
        name: t('Structure'),
        link: dataEntityDetailsPath(dataEntityId, 'structure'),
        hidden: !isDataset,
      },
      {
        name: t('Lineage'),
        link: dataEntityLineagePath(
          dataEntityId,
          isDEG ? degLineageQueryString : lineageQueryString
        ),
        hidden: isQualityTest || isStatusDeleted,
      },
      {
        name: t('Test reports'),
        link: dataEntityTestReportsPath(dataEntityId),
        hidden: !isDataset || !datasetQualityTestReportTotal || isStatusDeleted,
      },
      {
        name: t('History'),
        link: dataEntityDetailsPath(dataEntityId, 'history'),
        hidden: (!isQualityTest && !isTransformer) || isStatusDeleted,
      },
      {
        name: t('Alerts'),
        link: dataEntityDetailsPath(dataEntityId, 'alerts'),
        hint: openAlertsCount > 0 ? openAlertsCount : undefined,
        hintType: 'alert',
        hidden: isStatusDeleted,
      },
      {
        name: t('Linked entities'),
        link: dataEntityDetailsPath(dataEntityId, 'linked-entities'),
        hidden: !dataEntityDetails?.hasChildren || isStatusDeleted,
      },
      {
        name: t('Query examples'),
        link: dataEntityDetailsPath(dataEntityId, 'query-examples'),
        hidden: !isDataset,
      },
      {
        name: t('Activity'),
        link: dataEntityDetailsPath(dataEntityId, 'activity'),
      },
      {
        name: t('Discussions'),
        link: dataEntityDetailsPath(dataEntityId, 'discussions'),
        hidden: isStatusDeleted,
      },
      {
        name: t('Data'),
        link: dataEntityDetailsPath(dataEntityId, 'data'),
        hidden: !dataEntityDetails.lookupTableId,
      },
      {
        name: 'Relationships',
        link: dataEntityDetailsPath(dataEntityId, 'relationships'),
        hidden: !isDataset,
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

  const selectedTab = useSetSelectedTab(tabs);

  return (
    <>
      {tabs.length && selectedTab >= 0 ? (
        <AppTabs type='primary' items={tabs} selectedTab={selectedTab} />
      ) : null}
    </>
  );
};

export default DataEntityDetailsTabs;
