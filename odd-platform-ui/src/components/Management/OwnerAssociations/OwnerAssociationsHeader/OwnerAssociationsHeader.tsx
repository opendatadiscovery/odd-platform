import React, { useCallback } from 'react';
import { Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Input, Button } from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import { Permission } from 'generated-sources';
import { AddIcon } from 'components/shared/icons';
import { queryAtom } from '../OwnerAssociationsStore/OwnerAssociationsAtoms';
import * as S from './OwnerAssociationsHeaderStyles';
import OwnerAssociationForm from './OwnerAssociationForm/OwnerAssociationForm';

const OwnerAssociationsHeader: React.FC = () => {
  const { t } = useTranslation();

  const [query, setQuery] = useAtom(queryAtom);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    [setQuery]
  );

  return (
    <>
      <S.Caption container sx={{ mb: 1 }}>
        <Typography variant='h1'>{t('Owner associations')}</Typography>
        <WithPermissions permissionTo={Permission.OWNER_RELATION_MANAGE}>
          <OwnerAssociationForm
            btnCreateEl={
              <Button
                text='Create association'
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        </WithPermissions>
      </S.Caption>
      <S.Caption container sx={{ mb: 2 }}>
        <Input
          variant='search-m'
          placeholder={t('Search requests')}
          maxWidth={340}
          onChange={handleInputChange}
          value={query}
        />
      </S.Caption>
    </>
  );
};

export default OwnerAssociationsHeader;
