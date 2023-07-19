import React, { type FC } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import type { TermRef } from 'generated-sources';
import { Permission } from 'generated-sources';
import { AppTooltip, Button } from 'components/shared/elements';
import { useTermWiki } from 'lib/hooks';
import { updateDataSetFieldDescription } from 'redux/thunks';
import { StrokedInfoIcon } from 'components/shared/icons';
import DatasetFieldDescriptionPreview from './DatasetFieldDescriptionPreview/DatasetFieldDescriptionPreview';
import DatasetFieldDescriptionEdit from './DatasetFieldDescriptionEdit/DatasetFieldDescriptionEdit';
import * as S from './DatasetFieldDescription.styles';

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

  const tooltipInfoContent = (
    <S.Tooltip>
      You can link an existing term by entering information about the term according to
      the pattern [[NamespaceName:TermName]]
      <br />
      <br />
      <b>Example: [[Finance:User]]</b>
    </S.Tooltip>
  );

  return (
    <>
      <Grid container justifyContent='space-between' mb={0.5}>
        <Box display='flex' flexWrap='nowrap'>
          <Typography variant='h5' color='texts.hint' mr={1}>
            INTERNAL DESCRIPTION
          </Typography>
          <AppTooltip title={tooltipInfoContent} checkForOverflow={false}>
            <StrokedInfoIcon />
          </AppTooltip>
        </Box>
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
