import type { TestReportViewType } from 'lib/interfaces';
import { useParams } from 'react-router-dom';
import type { AlertsRoutes, ManagementRoutes, TermsRoutes } from './useAppPaths/shared';

interface RouteParams {
  dataEntityId: string;
  dataQATestId: string;
  termId: string;
  termSearchId: string;
  versionId: string;
  searchId: string;
  messageId: string;
  policyId: string;
  viewType: TermsRoutes | AlertsRoutes | ManagementRoutes;
}

interface AppRouteParams {
  dataEntityId: number;
  dataQATestId: number;
  termId: number;
  termSearchId: string;
  versionId: number;
  searchId: string;
  messageId: string;
  policyId: number;
  viewType: TermsRoutes | AlertsRoutes | ManagementRoutes | TestReportViewType;
}

export const useAppParams = (): AppRouteParams => {
  const {
    dataEntityId,
    termId,
    termSearchId,
    viewType,
    dataQATestId,
    versionId,
    searchId,
    messageId,
    policyId,
  } = useParams<RouteParams>();

  return {
    dataEntityId: parseInt(dataEntityId, 10),
    dataQATestId: parseInt(dataQATestId, 10),
    termId: parseInt(termId, 10),
    termSearchId,
    viewType,
    versionId: parseInt(versionId, 10),
    searchId,
    messageId,
    policyId: parseInt(policyId, 10),
  };
};

export default useAppParams;
