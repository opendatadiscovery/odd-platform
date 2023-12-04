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
    termId,
    termSearchId,
    termsViewType,
    searchId,
    structureViewType,
  } = useParams<keyof RouteParams>() as RouteParams;

  return {
    dataEntityId: parseInt(dataEntityId, 10),
    dataQATestId: parseInt(dataQATestId, 10),
    termId: parseInt(termId, 10),
    termSearchId,
    dataEntityViewType,
    testReportViewType,
    termsViewType,
    structureViewType,
    versionId: parseInt(versionId, 10),
    searchId,
    messageId,
  };
};

export default useAppParams;
