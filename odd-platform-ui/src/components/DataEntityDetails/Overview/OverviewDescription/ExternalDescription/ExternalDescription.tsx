import React, { type FC, memo } from 'react';
import { Markdown } from 'components/shared/elements';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityExternalDescription } from 'redux/selectors';
import { useDataEntityRouteParams } from 'routes';
import * as S from './ExternalDescription.styles';

const ExternalDescription: FC = () => {
  const { dataEntityId } = useDataEntityRouteParams();

  const description = useAppSelector(getDataEntityExternalDescription(dataEntityId));

  return description ? (
    <S.Container>
      <Markdown value={description} />
    </S.Container>
  ) : null;
};

export default memo(ExternalDescription);
