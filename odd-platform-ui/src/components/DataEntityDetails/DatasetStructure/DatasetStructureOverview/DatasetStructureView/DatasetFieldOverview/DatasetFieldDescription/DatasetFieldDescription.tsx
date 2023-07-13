import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import type { TermRef } from 'generated-sources';
import { Permission } from 'generated-sources';
import { Button } from 'components/shared/elements';
import { useTermWiki } from 'lib/hooks';
import { updateDataSetFieldDescription } from 'redux/thunks';
import DatasetFieldDescriptionPreview from './DatasetFieldDescriptionPreview/DatasetFieldDescriptionPreview';
import DatasetFieldDescriptionEdit from './DatasetFieldDescriptionEdit/DatasetFieldDescriptionEdit';

interface DatasetFieldDescriptionProps {
  datasetFieldId: number;
  description: string;
  terms: TermRef[] | undefined;
}

const DatasetFieldDescription: FC<DatasetFieldDescriptionProps> = ({
  description,
  datasetFieldId,
  terms,
}) => {
  const {
    error,
    internalDescription,
    handleUpdateDescription,
    handleRealtimeMarkdownChange,
    toggleEditMode,
    transformDescriptionToMarkdown,
    editMode,
  } = useTermWiki({
    terms,
    description,
    entityId: datasetFieldId,
    updateDescription: updateDataSetFieldDescription,
    isDatasetField: true,
  });

  return (
    <>
      <Grid container justifyContent='space-between' mb={0.5}>
        <Typography variant='h5' color='texts.hint'>
          INTERNAL DESCRIPTION
        </Typography>
        <WithPermissions
          permissionTo={Permission.DATASET_FIELD_DESCRIPTION_UPDATE}
          renderContent={({ isAllowedTo: editDescription }) => (
            <Button
              text={description ? 'Edit description' : 'Add description'}
              disabled={!editDescription}
              buttonType='secondary-m'
              sx={{ mr: 1 }}
              onClick={toggleEditMode}
            />
          )}
        />
      </Grid>
      {editMode ? (
        <DatasetFieldDescriptionEdit
          value={internalDescription}
          handleMarkdownChange={handleRealtimeMarkdownChange}
          handleUpdateDescription={handleUpdateDescription}
          toggleEditMode={toggleEditMode}
          error={error}
        />
      ) : (
        <DatasetFieldDescriptionPreview
          isDescriptionEmpty={!description}
          value={transformDescriptionToMarkdown(description)}
        />
      )}
    </>
  );
};

export default DatasetFieldDescription;
