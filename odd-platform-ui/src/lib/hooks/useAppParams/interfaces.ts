import type { SearchRoutes, TermsRoutes } from '../useAppPaths/shared';

interface TermRouteViewTypes {
  [TermsRoutes.termsViewType]:
    | typeof TermsRoutes.overview
    | typeof TermsRoutes.linkedEntities;
}

interface TermRouteParams extends TermRouteViewTypes {
  [TermsRoutes.termId]: string;
  [TermsRoutes.termSearchId]: string;
}

interface AppTermRouteParams extends TermRouteViewTypes {
  [TermsRoutes.termId]: number;
  [TermsRoutes.termSearchId]: string;
}

interface SearchRouteParams {
  [SearchRoutes.searchId]: string;
}

interface AppSearchRouteParams {
  [SearchRoutes.searchId]: string;
}

export type RouteParams = TermRouteParams & SearchRouteParams;
export type AppRouteParams = AppSearchRouteParams & AppTermRouteParams;
