import React, { type FC, memo } from 'react';
import { Markdown } from 'components/shared/elements';
import { useAppParams } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityExternalDescription } from 'redux/selectors';
import * as S from './ExternalDescription.styles';

const ExternalDescription: FC = () => {
  const { dataEntityId } = useAppParams();

  const description = useAppSelector(getDataEntityExternalDescription(dataEntityId));

  return description ? (
    <S.Container>
      <Markdown value={description} />
    </S.Container>
  ) : null;
};

export default memo(ExternalDescription);
