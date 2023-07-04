import React, { type FC } from 'react';
import { Button, Markdown } from 'components/shared/elements';
import { Grid, Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';

interface InternalDescriptionPreviewProps {
  isDescriptionEmpty: boolean;
  handleEditClick: () => void;
  value: string;
}

// TODO check re-renders, memo if needed
const InternalDescriptionPreview: FC<InternalDescriptionPreviewProps> = ({
  isDescriptionEmpty,
  handleEditClick,
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
          <Button
            text='Add Description'
            onClick={handleEditClick}
            buttonType='tertiary-sm'
          />
        </WithPermissions>
      </Grid>
    )}
  </div>
);

export default InternalDescriptionPreview;
