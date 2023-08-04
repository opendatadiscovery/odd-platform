import React, { type FC, memo } from 'react';
import { Button, Markdown } from 'components/shared/elements';
import { Grid, Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';

interface InternalDescriptionPreviewProps {
  isDescriptionEmpty: boolean;
  isStatusDeleted: boolean;
  toggleEditMode: () => void;
  value: string;
}

const InternalDescriptionPreview: FC<InternalDescriptionPreviewProps> = ({
  isDescriptionEmpty,
  isStatusDeleted,
  toggleEditMode,
  value,
}) => (
  <div>
    {!isDescriptionEmpty ? (
      <Markdown value={value} />
    ) : (
      <Grid
        item
        xs={12}
        container
        alignItems='center'
        justifyContent='flex-start'
        wrap='nowrap'
      >
        <Typography variant='subtitle2'>Not created.</Typography>
        <WithPermissions permissionTo={Permission.DATA_ENTITY_DESCRIPTION_UPDATE}>
          {!isStatusDeleted && (
            <Button
              text='Add Description'
              onClick={toggleEditMode}
              buttonType='tertiary-sm'
            />
          )}
        </WithPermissions>
      </Grid>
    )}
  </div>
);

export default memo(InternalDescriptionPreview);
