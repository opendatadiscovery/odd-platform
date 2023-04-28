import React from 'react';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { Button } from 'components/shared/elements';
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
          <Button text='Add term' buttonType='main-lg' startIcon={<AddIcon />} />
        }
      />
    </WithPermissions>
  </Grid>
);

export default TermSearchHeader;
