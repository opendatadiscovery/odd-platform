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
  } = useParams<keyof RouteParams>() as RouteParams;

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
    versionId: parseInt(versionId, 10),
    searchId,
    messageId,
    policyId: parseInt(policyId, 10),
    integrationId: parseInt(integrationId, 10),
    integrationViewType,
  };
};

export default useAppParams;
