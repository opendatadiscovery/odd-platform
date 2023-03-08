import type { Term } from 'generated-sources';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { TermsRoutes } from './shared';

type TermId = Term['id'] | string;

export const useTermsPaths = () => {
  const { updatePath } = useIsEmbeddedPath();

  const baseTermSearchPath = () => updatePath(`/${TermsRoutes.termSearch}`);
  const termSearchPath = (termSearchId: string = TermsRoutes.termSearchId) =>
    `${baseTermSearchPath()}/${termSearchId}`;

  const termDetailsPath = (
    termId: TermId = TermsRoutes.termId,
    viewType: string = TermsRoutes.termsViewTypeParam
  ) => updatePath(`/${TermsRoutes.terms}/${termId}/${viewType}`);

  const termDetailsLinkedItemsPath = (termId: TermId = TermsRoutes.termId) =>
    `${termDetailsPath(termId, TermsRoutes.linkedItems)}`;

  const termDetailsOverviewPath = (termId: TermId = TermsRoutes.termId) =>
    `${termDetailsPath(termId, TermsRoutes.overview)}`;

  return {
    baseTermSearchPath,
    termSearchPath,
    termDetailsPath,
    termDetailsLinkedItemsPath,
    termDetailsOverviewPath,
  };
};
