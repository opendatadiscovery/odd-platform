import React, { type FC, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDataEntityInternalDescription } from 'redux/selectors';
import { useAppParams, useAppPaths, useGetTermByNamespaceAndName } from 'lib/hooks';
import { updateDataEntityInternalDescription } from 'redux/thunks';
import { TERM_PATTERN } from 'lib/constants';
import { useDebouncedCallback } from 'use-debounce';
import InternalDescriptionHeader from './InternalDescriptionHeader/InternalDescriptionHeader';
import InternalDescriptionEdit from './InternalDescriptionEdit/InternalDescriptionEdit';
import InternalDescriptionPreview from './InternalDescriptionPreview/InternalDescriptionPreview';

const InternalDescription: FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const { termDetailsOverviewPath } = useAppPaths();
  const fetchTerm = useGetTermByNamespaceAndName();

  const [editMode, setEditMode] = useState(false);

  const description = useAppSelector(getDataEntityInternalDescription(dataEntityId));
  const [error, setError] = useState('');
  const [internalDescription, setInternalDescription] = useState(description);

  const handleEditClick = useCallback(() => {
    setEditMode(true);
  }, []);

  const handleTurnOffEditMode = useCallback(() => {
    setEditMode(false);
  }, []);

  const handleUpdateDescription = useCallback(() => {
    const internalDescriptionFormData = { internalDescription };
    dispatch(
      updateDataEntityInternalDescription({ dataEntityId, internalDescriptionFormData })
    ).then(
      () => {
        setError('');
        setEditMode(false);
      },
      (response: Response) => {
        setError(response.statusText || 'Unable to update description');
      }
    );
  }, [dataEntityId, internalDescription]);

  const handleSaveMarkdownOnEnter = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && e.shiftKey) {
        handleUpdateDescription();
      }
    },
    [handleUpdateDescription]
  );

  const handleMarkdownChange = useCallback(
    async (val: string | undefined) => {
      if (!val) return;

      const matches = val.matchAll(TERM_PATTERN);

      for await (const match of matches) {
        const namespaceName = match[1];
        const termName = match[2];

        const response = await fetchTerm({ namespaceName, termName });

        if ('id' in response) {
          const { id, name, definition } = response;
          const termLink = `[${name}](${termDetailsOverviewPath(id)} "${definition}")`;
          val = val.replace(match[0], termLink);
        } else {
          setError(response.message);
        }

        setInternalDescription(val);
      }
    },
    [fetchTerm]
  );

  const debouncedHandleMarkdownChange = useDebouncedCallback(handleMarkdownChange, 500);

  return (
    <>
      <InternalDescriptionHeader
        isDescriptionEmpty={!description}
        handleEditClick={handleEditClick}
      />
      {editMode ? (
        <InternalDescriptionEdit
          value={internalDescription}
          handlePressEnter={handleSaveMarkdownOnEnter}
          handleMarkdownChange={debouncedHandleMarkdownChange}
          handleUpdateDescription={handleUpdateDescription}
          handleTurnOffEditMode={handleTurnOffEditMode}
          error={error}
        />
      ) : (
        <InternalDescriptionPreview
          value={description}
          isDescriptionEmpty={!description}
          handleEditClick={handleEditClick}
        />
      )}
    </>
  );
};

export default InternalDescription;
