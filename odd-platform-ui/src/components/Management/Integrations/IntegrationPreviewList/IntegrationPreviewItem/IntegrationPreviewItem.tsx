import React, { type FC, memo, useCallback } from 'react';
import type { IntegrationPreview } from 'generated-sources';
import { Typography } from '@mui/material';
import { IntegratedIcon } from 'components/shared/Icons';
import { useNavigate } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import * as S from './IntegrationPreviewItem.styles';

interface IntegrationPreviewItemProps {
  id: IntegrationPreview['id'];
  name: IntegrationPreview['name'];
  description: IntegrationPreview['description'];
  installed: IntegrationPreview['installed'];
}

const IntegrationPreviewItem: FC<IntegrationPreviewItemProps> = ({
  id,
  name,
  description,
  installed,
}) => {
  const navigate = useNavigate();
  const { integrationPath } = useAppPaths();

  const handleOnItemClick = useCallback(() => {
    navigate(integrationPath(id));
  }, [id]);

  return (
    <S.Container onClick={handleOnItemClick}>
      <S.LogoContainer />
      <S.TextContainer>
        <Typography variant='h3'>{name}</Typography>
        <Typography variant='body1'>{description}</Typography>
      </S.TextContainer>
      {installed && (
        <S.IntegratedContainer>
          <IntegratedIcon />
          <Typography variant='h5' ml={0.5}>
            Integrated
          </Typography>
        </S.IntegratedContainer>
      )}
    </S.Container>
  );
};

export default memo(IntegrationPreviewItem);
