import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { AsyncThunkAction } from '@reduxjs/toolkit';
import type {
  DataEntityApiUpsertDataEntityInternalDescriptionRequest,
  DatasetFieldApiUpdateDatasetFieldDescriptionRequest,
  TermRef,
} from 'generated-sources';
import { useAppDispatch } from 'redux/lib/hooks';
import useAppPaths from 'lib/hooks/useAppPaths/useAppPaths';
import useAppParams from 'lib/hooks/useAppParams/useAppParams';
import { TERM_PATTERN } from 'lib/constants';
import { useGetTermByNamespaceAndName } from 'lib/hooks/api';

interface UseTermWikiProps {
  updateDescription: (params: any) => AsyncThunkAction<any, any, any>;
  terms: TermRef[] | undefined;
  description: string | undefined;
  entityId: number;
  isDatasetField?: boolean;
}

type Value = string | undefined;

const makeTermKey = (namespaceName: string, termName: string) =>
  `${namespaceName}:${termName}`;
const makeTermPattern = (termKey: string) => `[[${termKey}]]`;
const makeTermLink = (name: string, path: string, definition: string) =>
  `[${name}](${path} "${definition}")`;

export default function useTermWiki({
  terms = [],
  updateDescription,
  description = '',
  entityId,
  isDatasetField = false,
}: UseTermWikiProps) {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const { termDetailsOverviewPath } = useAppPaths();
  const fetchTerm = useGetTermByNamespaceAndName();

  const [editMode, setEditMode] = useState(false);

  const [error, setError] = useState('');
  const [internalDescription, setInternalDescription] = useState(description);

  const toggleEditMode = useCallback(() => {
    setEditMode(!editMode);
    setInternalDescription(description);
  }, [editMode, description]);

  const [fetchedTerms, setFetchedTerms] = useState<Record<string, TermRef>>(() =>
    Object.fromEntries(
      terms.map(term => [makeTermKey(term.namespace.name, term.name), term])
    )
  );
  const [unsuccessfulTerms, setUnsuccessfulTerms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchMissingTerms = async (desc: string) => {
      if (desc === undefined || desc === null) return;

      const matches = desc.matchAll(TERM_PATTERN);

      for await (const match of matches) {
        const namespaceName = match[1];
        const termName = match[2];
        const termKey = makeTermKey(namespaceName, termName);

        const termPattern = makeTermPattern(termKey);
        const isTermInDescription = desc.includes(termPattern);

        if (
          isTermInDescription &&
          !fetchedTerms[termKey] &&
          !unsuccessfulTerms[termKey]
        ) {
          const response = await fetchTerm({ namespaceName, termName });

          if ('id' in response) {
            setFetchedTerms(prev => ({ ...prev, [termKey]: response }));
            if (unsuccessfulTerms[termKey]) {
              setUnsuccessfulTerms(prev => {
                const copy = { ...prev };
                delete copy[termKey];
                return copy;
              });
            }
          } else {
            setUnsuccessfulTerms(prev => ({ ...prev, [termKey]: true }));
          }
        }
      }
    };

    fetchMissingTerms(description).finally();
  }, [description]);

  const handleMarkdownChange = useCallback(
    async (val: Value) => {
      if (val === undefined) return;

      const newUnsuccessfulTerms: Record<string, boolean> = { ...unsuccessfulTerms };
      const matches = val.matchAll(TERM_PATTERN);

      for await (const match of matches) {
        const namespaceName = match[1];
        const termName = match[2];
        const termKey = makeTermKey(namespaceName, termName);

        const termPattern = makeTermPattern(termKey);
        const isTermInDescription = val.includes(termPattern);

        if (
          isTermInDescription &&
          !fetchedTerms[termKey] &&
          !unsuccessfulTerms[termKey]
        ) {
          const response = await fetchTerm({ namespaceName, termName });

          if ('id' in response) {
            setFetchedTerms(prev => ({ ...prev, [termKey]: response }));
            if (unsuccessfulTerms[termKey]) {
              delete newUnsuccessfulTerms[termKey];
            }
          } else {
            setError(`Term ${termName} not found in namespace ${namespaceName}`);
            newUnsuccessfulTerms[termKey] = true;
          }
        }
      }

      let errorTermStillPresent = false;
      for (const termKey in newUnsuccessfulTerms) {
        const termPattern = makeTermPattern(termKey);
        if (val.includes(termPattern)) {
          errorTermStillPresent = true;
          break;
        }
      }

      if (!errorTermStillPresent) {
        setError('');
      }

      setUnsuccessfulTerms(newUnsuccessfulTerms);
      setInternalDescription(val);
    },
    [fetchTerm, fetchedTerms, unsuccessfulTerms]
  );

  const handleUpdateDescription = useCallback(() => {
    const updateEntityDescriptionParams: DataEntityApiUpsertDataEntityInternalDescriptionRequest =
      {
        dataEntityId: entityId,
        internalDescriptionFormData: { internalDescription },
      };

    const updateDatasetFieldDescriptionParams: DatasetFieldApiUpdateDatasetFieldDescriptionRequest =
      {
        datasetFieldId: entityId,
        datasetFieldDescriptionUpdateFormData: { description: internalDescription },
      };

    const params = isDatasetField
      ? updateDatasetFieldDescriptionParams
      : updateEntityDescriptionParams;

    dispatch(updateDescription(params)).then(
      () => {
        setError('');
        setEditMode(false);
      },
      (response: Response) => {
        setError(response.statusText || 'Unable to update description');
      }
    );
  }, [dataEntityId, internalDescription, fetchedTerms]);

  const handleSaveMarkdownOnEnter = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && e.shiftKey) handleUpdateDescription();
    },
    [handleUpdateDescription]
  );

  const transformDescriptionToMarkdown = useCallback(
    (desc: string) => {
      if (!desc) return '';
      let markdownDescription = desc;

      for (const termKey in fetchedTerms) {
        const { id, name, definition } = fetchedTerms[termKey];
        const termLink = makeTermLink(name, termDetailsOverviewPath(id), definition);
        const termPattern = makeTermPattern(termKey);
        markdownDescription = markdownDescription.split(termPattern).join(termLink);
      }

      return markdownDescription;
    },
    [fetchedTerms]
  );

  const handleRealtimeMarkdownChange = useCallback(
    (val: Value) => {
      if (val === undefined) return;

      setInternalDescription(prevDesc => {
        if (prevDesc === val) return prevDesc;

        handleMarkdownChange(val).finally();

        return val;
      });
    },
    [handleMarkdownChange]
  );

  return {
    editMode,
    error,
    handleUpdateDescription,
    handleSaveMarkdownOnEnter,
    handleRealtimeMarkdownChange,
    internalDescription,
    toggleEditMode,
    transformDescriptionToMarkdown,
  };
}
