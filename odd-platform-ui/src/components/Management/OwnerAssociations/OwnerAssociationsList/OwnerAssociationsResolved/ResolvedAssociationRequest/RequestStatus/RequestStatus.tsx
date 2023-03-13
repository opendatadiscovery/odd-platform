import React from 'react';
import { OwnerAssociationRequestStatus } from 'generated-sources';
import * as S from './RequestStatusStyles';

interface Props {
  status: OwnerAssociationRequestStatus | undefined;
}

const ResolvedAssociationRequest: React.FC<Props> = ({ status }) => {
  const statusText = React.useMemo(() => {
    if (status === OwnerAssociationRequestStatus.APPROVED) return 'accept';
    if (status === OwnerAssociationRequestStatus.DECLINED) return 'reject';

    return 'pending';
  }, [status]);

  return status ? (
    <S.Container $status={status} variant='body2'>
      {statusText}
    </S.Container>
  ) : null;
};

export default ResolvedAssociationRequest;
