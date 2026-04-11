import React, { type FC } from 'react';
import { useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityInternalDescription,
  getIsEntityStatusDeleted,
} from 'redux/selectors';
import { useTermWiki } from 'lib/hooks';
import { updateDataEntityInternalDescription } from 'redux/thunks';
import type { TermRef } from 'generated-sources';
import { useDataEntityRouteParams } from 'routes';
import InternalDescriptionHeader from './InternalDescriptionHeader/InternalDescriptionHeader';
import InternalDescriptionEdit from './InternalDescriptionEdit/InternalDescriptionEdit';
import InternalDescriptionPreview from './InternalDescriptionPreview/InternalDescriptionPreview';

interface InternalDescriptionProps {
  terms?: TermRef[];
}

const InternalDescription: FC<InternalDescriptionProps> = ({ terms = [] }) => {
  const { dataEntityId } = useDataEntityRouteParams();

  const description = useAppSelector(getDataEntityInternalDescription(dataEntityId));
  const isStatusDeleted = useAppSelector(getIsEntityStatusDeleted(dataEntityId));

  const {
    error,
    internalDescription,
    handleUpdateDescription,
    handleRealtimeMarkdownChange,
    handleSaveMarkdownOnEnter,
    toggleEditMode,
    transformDescriptionToMarkdown,
    editMode,
  } = useTermWiki({
    terms,
    description,
    entityId: dataEntityId,
    updateDescription: updateDataEntityInternalDescription,
  });

  return (
    <>
      <InternalDescriptionHeader
        isDescriptionEmpty={!description}
        toggleEditMode={toggleEditMode}
        isStatusDeleted={isStatusDeleted}
      />
      {editMode ? (
        <InternalDescriptionEdit
          value={internalDescription}
          handlePressEnter={handleSaveMarkdownOnEnter}
          handleMarkdownChange={handleRealtimeMarkdownChange}
          handleUpdateDescription={handleUpdateDescription}
          toggleEditMode={toggleEditMode}
          error={error}
        />
      ) : (
        <InternalDescriptionPreview
          value={transformDescriptionToMarkdown(description)}
          isDescriptionEmpty={!description}
          toggleEditMode={toggleEditMode}
          isStatusDeleted={isStatusDeleted}
        />
      )}
    </>
  );
};

export default InternalDescription;
