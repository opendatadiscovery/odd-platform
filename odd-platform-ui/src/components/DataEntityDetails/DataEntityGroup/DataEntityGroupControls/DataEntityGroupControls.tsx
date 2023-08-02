import { Grid } from '@mui/material';
import type { FC } from 'react';
import React from 'react';
import { AppMenuItem, AppPopover, Button } from 'components/shared/elements';
import { KebabIcon } from 'components/shared/icons';
import { Permission } from 'generated-sources';
import { WithPermissions } from 'components/shared/contexts';
import DataEntityGroupForm from '../DataEntityGroupForm/DataEntityGroupForm';

const DataEntityGroupControls: FC = () => (
  <Grid>
    <AppPopover
      childrenSx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
      renderOpenBtn={({ onClick, ariaDescribedBy }) => (
        <Button
          aria-describedby={ariaDescribedBy}
          buttonType='secondary-m'
          icon={<KebabIcon />}
          sx={{ ml: 2 }}
          onClick={onClick}
        />
      )}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 65,
      }}
    >
      <WithPermissions permissionTo={Permission.DATA_ENTITY_GROUP_UPDATE}>
        <DataEntityGroupForm btnCreateEl={<AppMenuItem>Edit</AppMenuItem>} />
      </WithPermissions>
    </AppPopover>
  </Grid>
);

export default DataEntityGroupControls;
