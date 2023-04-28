import React, { type FC, useMemo } from 'react';
import { useQueryParams } from 'lib/hooks';
import { Collapse, Typography } from '@mui/material';
import { Button } from 'components/shared/elements';
import { ChevronIcon } from 'components/shared/icons';
import type { DataSetVersionDiff } from 'lib/interfaces';
import type { DataSetFieldDiffState } from 'generated-sources';
import type { StructureCompareQueryParams } from '../../lib/interfaces';
import { defaultStructureCompareQuery } from '../../lib/constants';
import TypeFieldLabel from '../../../shared/TypeFieldLabel/TypeFieldLabel';
import KeyFieldLabel from '../../../shared/KeyFieldLabel/KeyFieldLabel';
import * as S from './DatasetStructureCompareListItem.styles';

interface DatasetStructureCompareListItemProps {
  fieldDiff: DataSetVersionDiff;
  isNested?: boolean;
  nesting: number;
  renderCompareItem: (fieldDiff: DataSetVersionDiff, nesting: number) => JSX.Element;
}

const DatasetStructureCompareListItem: FC<DatasetStructureCompareListItemProps> = ({
  fieldDiff,
  isNested,
  nesting,
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

  const [open, setOpen] = React.useState(true);

  const collapseBlock = useMemo(
    () =>
      isNested ? (
        <S.CollapseContainer $visibility={!!fieldDiff.childFields?.length}>
          <Button
            aria-label='expand row'
            buttonType='tertiary-m'
            sx={{ width: '20px' }}
            icon={
              <ChevronIcon
                width={10}
                height={5}
                transform={open ? 'rotate(0)' : 'rotate(-90)'}
              />
            }
            onClick={() => setOpen(!open)}
          />
        </S.CollapseContainer>
      ) : null,
    [fieldDiff.childFields?.length, open, isNested]
  );

  const getFieldContent = (state: DataSetFieldDiffState, isFrom: boolean) =>
    state ? (
      <S.FieldContentWrapper $isFrom={isFrom}>
        <S.FieldNameWrapper>
          {collapseBlock}
          <Typography variant='h4' title={state.name} noWrap>
            {(state.isKey && 'Key') || (state.isValue && 'Value') || state.name}
          </Typography>
          {isPrimaryKeyChanged && state.isPrimaryKey && (
            <KeyFieldLabel keyType='primary' />
          )}
          {isIsNullableChanged && state.type.isNullable && (
            <KeyFieldLabel keyType='nullable' />
          )}
        </S.FieldNameWrapper>
        {isTypeChanged && <TypeFieldLabel typeName={state.type.type} />}
      </S.FieldContentWrapper>
    ) : null;

  return (
    <>
      <S.Container>
        <S.FieldWrapper $nesting={nesting}>
          <S.FieldContainer
            $nesting={nesting}
            $isFrom
            $isFieldExists={!!from}
            $status={fieldDiff.status}
          >
            {getFieldContent(from, true)}
          </S.FieldContainer>
        </S.FieldWrapper>
        <S.FieldWrapper $nesting={nesting}>
          <S.FieldContainer
            $nesting={nesting}
            $isFieldExists={!!to}
            $status={fieldDiff.status}
          >
            {getFieldContent(to, false)}
          </S.FieldContainer>
        </S.FieldWrapper>
      </S.Container>
      <Collapse in={open} timeout='auto' unmountOnExit>
        {open && fieldDiff.childFields?.length
          ? fieldDiff.childFields.map(field => renderCompareItem(field, nesting + 1))
          : null}
      </Collapse>
    </>
  );
};

export default DatasetStructureCompareListItem;
