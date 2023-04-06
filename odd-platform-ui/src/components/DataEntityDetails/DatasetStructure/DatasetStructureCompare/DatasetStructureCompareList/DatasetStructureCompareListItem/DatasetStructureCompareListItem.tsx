import React, { type FC } from 'react';
import type { DataSetFieldDiffState, DataSetVersionDiffStatus } from 'generated-sources';
import { useQueryParams } from 'lib/hooks';
import { Typography } from '@mui/material';
import type { StructureCompareQueryParams } from '../../lib/interfaces';
import { defaultStructureCompareQuery } from '../../lib/constants';
import TypeFieldLabel from '../../../shared/TypeFieldLabel/TypeFieldLabel';
import KeyFieldLabel from '../../../shared/KeyFieldLabel/KeyFieldLabel';
import * as S from './DatasetStructureCompareListItem.styles';

interface DatasetStructureCompareListItemProps {
  status: DataSetVersionDiffStatus;
  states: { [versionId: string]: DataSetFieldDiffState | null };
}

const DatasetStructureCompareListItem: FC<DatasetStructureCompareListItemProps> = ({
  status,
  states,
}) => {
  const {
    queryParams: { firstVersionId, secondVersionId },
  } = useQueryParams<StructureCompareQueryParams>(defaultStructureCompareQuery);

  const from = states[firstVersionId];
  const to = states[secondVersionId];

  const isTypeChanged = from?.type.type !== to?.type.type;
  const isIsNullableChanged = from?.type.isNullable !== to?.type.isNullable;
  const isPrimaryKeyChanged = from?.isPrimaryKey !== to?.isPrimaryKey;

  return (
    <S.Container>
      <S.FieldWrapper $isFrom>
        <S.FieldContainer $isFrom $isFieldExists={!!from} $status={status}>
          {from && (
            <>
              <Typography variant='h4'>{from.name}</Typography>
              {isTypeChanged && <TypeFieldLabel typeName={from.type.type} />}
              {isPrimaryKeyChanged && from.isPrimaryKey && (
                <KeyFieldLabel keyType='primary' />
              )}
              {isIsNullableChanged && from.type.isNullable && (
                <KeyFieldLabel keyType='nullable' />
              )}
            </>
          )}
        </S.FieldContainer>
      </S.FieldWrapper>
      <S.FieldWrapper>
        <S.FieldContainer $isFieldExists={!!to} $status={status}>
          {to && (
            <>
              <Typography variant='h4'>{to.name}</Typography>
              {isTypeChanged && <TypeFieldLabel typeName={to.type.type} />}
              {isPrimaryKeyChanged && to.isPrimaryKey && (
                <KeyFieldLabel keyType='primary' />
              )}
              {isIsNullableChanged && to.type.isNullable && (
                <KeyFieldLabel keyType='nullable' />
              )}
            </>
          )}
        </S.FieldContainer>
      </S.FieldWrapper>
    </S.Container>
  );
};

export default DatasetStructureCompareListItem;
