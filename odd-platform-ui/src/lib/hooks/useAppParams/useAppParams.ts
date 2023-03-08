import { useParams } from 'react-router-dom-v5-compat';
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
  };
};

export default useAppParams;
