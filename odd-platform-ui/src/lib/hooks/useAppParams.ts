import {
  AlertViewType,
  ManagementViewType,
  TermsViewType,
  TestReportViewType,
} from 'lib/interfaces';
import { useParams } from 'react-router-dom';

interface RouteParams {
  dataEntityId: string;
  dataQATestId: string;
  termId: string;
  versionId: string;
  searchId: string;
  viewType: TermsViewType | AlertViewType | ManagementViewType;
}

interface AppRouteParams {
  dataEntityId: number;
  dataQATestId: number;
  termId: number;
  versionId: number;
  searchId: string;
  viewType:
    | TermsViewType
    | AlertViewType
    | ManagementViewType
    | TestReportViewType;
}

export const useAppParams = (): AppRouteParams => {
  const {
    dataEntityId,
    termId,
    viewType,
    dataQATestId,
    versionId,
    searchId,
  } = useParams<RouteParams>();

  return {
    dataEntityId: parseInt(dataEntityId, 10),
    dataQATestId: parseInt(dataQATestId, 10),
    termId: parseInt(termId, 10),
    viewType,
    versionId: parseInt(versionId, 10),
    searchId,
  };
};
