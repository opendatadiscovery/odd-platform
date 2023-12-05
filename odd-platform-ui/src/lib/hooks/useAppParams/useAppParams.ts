import { useParams } from 'react-router-dom';
import type { AppRouteParams, RouteParams } from './interfaces';

const useAppParams = (): AppRouteParams => {
  const { termId, termSearchId, termsViewType } = useParams<
    keyof RouteParams
  >() as RouteParams;

  return {
    termId: parseInt(termId, 10),
    termSearchId,
    termsViewType,
  };
};

export default useAppParams;
