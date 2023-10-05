import React from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { Button } from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import TermsForm from '../TermForm/TermsForm';
import TermSearchInput from '../TermSearchInput/TermSearchInput';

const TermSearchHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Grid container justifyContent='space-between' alignItems='center' mt={1.5}>
      <TermSearchInput />
      <WithPermissions permissionTo={Permission.TERM_CREATE}>
        <TermsForm
          btnCreateEl={
            <Button text={t('Add term')} buttonType='main-lg' startIcon={<AddIcon />} />
          }
        />
      </WithPermissions>
    </Grid>
  );
};

export default TermSearchHeader;
