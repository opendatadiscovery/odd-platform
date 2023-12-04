import React, { type FC, memo, useCallback } from 'react';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { IntegrationPreview } from 'generated-sources';
import { IntegratedIcon } from 'components/shared/icons';
import type { DatasourceName } from 'lib/interfaces';
import { DatasourceLogo } from 'components/shared/elements';
import { integrationsPath } from 'routes';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updatePath } = useIsEmbeddedPath();

  const handleOnItemClick = useCallback(() => {
    navigate(updatePath(integrationsPath(id)));
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
            {t('Integrated')}
          </Typography>
        </S.IntegratedContainer>
      )}
    </S.Container>
  );
};

export default memo(IntegrationPreviewItem);
