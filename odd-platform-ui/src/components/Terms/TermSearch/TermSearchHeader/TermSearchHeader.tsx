import React from 'react';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { AppButton } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import { Grid } from '@mui/material';
import TermsForm from '../TermForm/TermsForm';
import TermSearchInput from '../TermSearchInput/TermSearchInput';

const TermSearchHeader: React.FC = () => (
  <Grid container justifyContent='space-between' alignItems='center' mt={1.5}>
    <TermSearchInput />
    <WithPermissions permissionTo={Permission.TERM_CREATE}>
      <TermsForm
        btnCreateEl={
          <AppButton size='large' color='primary' startIcon={<AddIcon />}>
            Add term
          </AppButton>
        }
      />
    </WithPermissions>
  </Grid>
);

export default TermSearchHeader;
