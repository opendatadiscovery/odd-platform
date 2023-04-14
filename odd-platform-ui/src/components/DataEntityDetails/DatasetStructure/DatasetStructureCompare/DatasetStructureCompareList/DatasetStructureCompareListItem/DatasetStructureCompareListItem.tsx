import React, { type FC, useMemo } from 'react';
import { useQueryParams } from 'lib/hooks';
import { Collapse, Grid, Typography } from '@mui/material';
import { AppIconButton } from 'components/shared';
import { ChevronIcon } from 'components/shared/Icons';
import type { DataSetVersionDiff } from 'lib/interfaces';
import type { StructureCompareQueryParams } from '../../lib/interfaces';
import { defaultStructureCompareQuery } from '../../lib/constants';
import TypeFieldLabel from '../../../shared/TypeFieldLabel/TypeFieldLabel';
import KeyFieldLabel from '../../../shared/KeyFieldLabel/KeyFieldLabel';
import * as S from './DatasetStructureCompareListItem.styles';

interface DatasetStructureCompareListItemProps {
  fieldDiff: DataSetVersionDiff;
  nesting: number;
  initialStateOpen: boolean;
  renderCompareItem: (fieldDiff: DataSetVersionDiff, nesting: number) => JSX.Element;
}

const DatasetStructureCompareListItem: FC<DatasetStructureCompareListItemProps> = ({
  fieldDiff,
  nesting,
  initialStateOpen,
  renderCompareItem,
}) => {
  const {
    queryParams: { firstVersionId, secondVersionId },
  } = useQueryParams<StructureCompareQueryParams>(defaultStructureCompareQuery);

  const from = fieldDiff.states[firstVersionId];
  const to = fieldDiff.states[secondVersionId];

  const isTypeChanged = from?.type.type !== to?.type.type;
  const isIsNullableChanged = from?.type.isNullable !== to?.type.isNullable;
  const isPrimaryKeyChanged = from?.isPrimaryKey !== to?.isPrimaryKey;

  const [open, setOpen] = React.useState(initialStateOpen);

  const collapseBlock = useMemo(
    () =>
      fieldDiff.childFields?.length ? (
        <AppIconButton
          color='primaryLight'
          icon={
            open ? (
              <ChevronIcon width={10} height={5} transform='rotate(180)' />
            ) : (
              <ChevronIcon width={10} height={5} />
            )
          }
          aria-label='expand row'
          onClick={() => setOpen(!open)}
        />
      ) : undefined,
    [fieldDiff.childFields?.length, open]
  );

  return (
    <>
      <S.Container $nesting={nesting}>
        <S.FieldWrapper $isFrom>
          <S.FieldContainer $isFrom $isFieldExists={!!from} $status={fieldDiff.status}>
            {collapseBlock && (
              <Grid sx={{ p: 0.5, display: 'flex', alignSelf: 'center' }}>
                {collapseBlock}
              </Grid>
            )}
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
          <S.FieldContainer $isFieldExists={!!to} $status={fieldDiff.status}>
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
      <Collapse in={open} timeout='auto' unmountOnExit sx={{ mb: 0.5 }}>
        {open && fieldDiff.childFields?.length
          ? fieldDiff.childFields.map(field => renderCompareItem(field, nesting + 1))
          : null}
      </Collapse>
    </>
  );
};

export default DatasetStructureCompareListItem;
