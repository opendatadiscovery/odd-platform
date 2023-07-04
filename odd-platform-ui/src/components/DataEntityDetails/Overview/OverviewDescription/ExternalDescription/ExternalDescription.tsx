import React, { type FC } from 'react';
import { Markdown } from 'components/shared/elements';
import { useAppParams } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityExternalDescription } from 'redux/selectors';
import * as S from './ExternalDescription.styles';

// TODO check re-renders, memo if needed
const ExternalDescription: FC = () => {
  const { dataEntityId } = useAppParams();

  const DEExternalDescription = useAppSelector(
    getDataEntityExternalDescription(dataEntityId)
  );

  return (
    <S.Container>
      <Markdown value={DEExternalDescription} />
    </S.Container>
  );
};

export default ExternalDescription;
