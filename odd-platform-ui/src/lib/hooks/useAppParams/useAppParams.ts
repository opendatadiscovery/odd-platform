import { useParams } from 'react-router-dom';
import type { AppRouteParams, RouteParams } from './interfaces';

const useAppParams = (): AppRouteParams => {
  const {
    dataEntityId,
    dataQATestId,
    versionId,
    messageId,
    dataEntityViewType,
    testReportViewType,
    alertsViewType,
    termId,
    termSearchId,
    termsViewType,
    searchId,
    structureViewType,
    dataSourceTypePrefix,
    dataSourceId,
    typeId,
    queryExampleId,
  } = useParams<keyof RouteParams>() as RouteParams;

  const directoriesEntityTypeId = typeId === 'all' ? undefined : parseInt(typeId, 10);

  return {
    dataEntityId: parseInt(dataEntityId, 10),
    dataQATestId: parseInt(dataQATestId, 10),
    termId: parseInt(termId, 10),
    termSearchId,
    dataEntityViewType,
    testReportViewType,
    alertsViewType,
    termsViewType,
    structureViewType,
    versionId: parseInt(versionId, 10),
    searchId,
    messageId,
    dataSourceTypePrefix,
    dataSourceId: parseInt(dataSourceId, 10),
    typeId: directoriesEntityTypeId,
    queryExampleId: parseInt(queryExampleId, 10),
  };
};

export default useAppParams;
