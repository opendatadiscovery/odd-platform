import { Typography } from '@mui/material';
import { NumberFormatted } from 'components/shared/elements';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props {
  total: number;
}

// TODO: create shared styled component for basic and flex box
const Box = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RelationshipsTitle = ({ total = 0 }: Props) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant='h1'>{t('Relationships')}</Typography>
      <Typography variant='subtitle1' color='texts.info'>
        <NumberFormatted value={total} /> {t('relationships overall')}
      </Typography>
    </Box>
  );
};

export default RelationshipsTitle;
