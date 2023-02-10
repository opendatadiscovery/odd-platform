import type { Term } from 'generated-sources';
import React from 'react';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';

export const useTermsPaths = () => {
  enum TermsRoutesEnum {
    termSearchId = ':termSearchId',
    termId = ':termId',
    viewType = ':viewType',
    overview = 'overview',
    linkedItems = 'linked-items',
  }

  type TermId = Term['id'] | string;

  const { updatePath } = useIsEmbeddedPath();

  const baseTermSearchPath = () => updatePath(`/termsearch`);
  const termSearchPath = (termSearchId: string = TermsRoutesEnum.termSearchId) =>
    `${baseTermSearchPath()}/${termSearchId}`;

  const termDetailsPath = (
    termId: TermId = TermsRoutesEnum.termId,
    viewType: string = TermsRoutesEnum.viewType
  ) => updatePath(`/terms/${termId}/${viewType}`);

  const termDetailsLinkedItemsPath = (termId: TermId = TermsRoutesEnum.termId) =>
    `${termDetailsPath(termId, TermsRoutesEnum.linkedItems)}`;

  const termDetailsOverviewPath = (termId: TermId = TermsRoutesEnum.termId) =>
    `${termDetailsPath(termId, TermsRoutesEnum.overview)}`;

  return React.useMemo(
    () => ({
      TermsRoutesEnum,
      baseTermSearchPath,
      termSearchPath,
      termDetailsPath,
      termDetailsLinkedItemsPath,
      termDetailsOverviewPath,
    }),
    []
  );
};
