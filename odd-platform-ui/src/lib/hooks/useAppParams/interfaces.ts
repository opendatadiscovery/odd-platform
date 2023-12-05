import type { TermsRoutes } from '../useAppPaths/shared';

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

export type RouteParams = TermRouteParams;
export type AppRouteParams = AppTermRouteParams;
