import React, { type FC, memo, useCallback } from 'react';
import type { IntegrationPreview } from 'generated-sources';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { IntegratedIcon } from 'components/shared/icons';
import type { DatasourceName } from 'lib/interfaces';
import { DatasourceLogo } from 'components/shared/elements';
import * as S from './IntegrationPreviewItem.styles';

interface IntegrationPreviewItemProps {
  id: DatasourceName;
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
      <S.LogoContainer>
        <DatasourceLogo name={id} />
      </S.LogoContainer>
      <S.TextContainer>
        <Typography title={name} variant='h3' textAlign='center'>
          {name}
        </Typography>
        <Typography title={description} variant='body1' textAlign='center'>
          {description}
        </Typography>
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
