import React, { type FC, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDataEntityInternalDescription } from 'redux/selectors';
import { useAppParams } from 'lib/hooks';
import { updateDataEntityInternalDescription } from 'redux/thunks';
import InternalDescriptionHeader from './InternalDescriptionHeader/InternalDescriptionHeader';
import InternalDescriptionEdit from './InternalDescriptionEdit/InternalDescriptionEdit';
import InternalDescriptionPreview from './InternalDescriptionPreview/InternalDescriptionPreview';

const InternalDescription: FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

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

        // TODO add function to parse successful terms to links
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

  const handleMarkdownChange = useCallback((val: string | undefined) => {
    if (!val) return;

    // TODO add logic to parse and find terms
    setInternalDescription(val);
  }, []);

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
          handleMarkdownChange={handleMarkdownChange}
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
