import {
  AlertViewType,
  ManagementViewType,
  OwnerAssociationRequestsViewType,
  TermsViewType,
  TestReportViewType,
} from 'lib/interfaces';
import { useParams } from 'react-router-dom';

interface RouteParams {
  dataEntityId: string;
  dataQATestId: string;
  termId: string;
  termSearchId: string;
  versionId: string;
  searchId: string;
  viewType:
    | TermsViewType
    | AlertViewType
    | ManagementViewType
    | OwnerAssociationRequestsViewType;
}

interface AppRouteParams {
  dataEntityId: number;
  dataQATestId: number;
  termId: number;
  termSearchId: string;
  versionId: number;
  searchId: string;
  viewType:
    | TermsViewType
    | AlertViewType
    | ManagementViewType
    | TestReportViewType
    | OwnerAssociationRequestsViewType;
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
  } = useParams<RouteParams>();

  return {
    dataEntityId: parseInt(dataEntityId, 10),
    dataQATestId: parseInt(dataQATestId, 10),
    termId: parseInt(termId, 10),
    termSearchId,
    viewType,
    versionId: parseInt(versionId, 10),
    searchId,
  };
};

export default useAppParams;
