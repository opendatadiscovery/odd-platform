import { useParams } from 'react-router-dom';
import type { AppRouteParams, RouteParams } from './interfaces';

export const useAppParams = (): AppRouteParams => {
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
    managementViewType,
    associationsViewType,
    searchId,
    policyId,
    integrationId,
    integrationViewType,
    structureViewType,
    dataSourceTypePrefix,
    dataSourceId,
    typeId,
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
    managementViewType,
    associationsViewType,
    structureViewType,
    versionId: parseInt(versionId, 10),
    searchId,
    messageId,
    policyId: parseInt(policyId, 10),
    integrationId,
    integrationViewType,
    dataSourceTypePrefix,
    dataSourceId: parseInt(dataSourceId, 10),
    typeId: directoriesEntityTypeId,
  };
};

export default useAppParams;
