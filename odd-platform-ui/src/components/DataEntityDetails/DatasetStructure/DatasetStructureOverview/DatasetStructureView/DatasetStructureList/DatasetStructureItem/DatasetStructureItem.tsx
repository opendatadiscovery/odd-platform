import React, { useMemo } from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { getDatasetFieldName, getDatasetStructure } from 'redux/selectors';
import { AppTooltip, Button } from 'components/shared/elements';
import { ChevronIcon, RecursiveIcon, StrokedInfoIcon } from 'components/shared/icons';
import { useAppSelector } from 'redux/lib/hooks';
import type { DataSetField } from 'generated-sources';
import useStructure from '../../../lib/useStructure';
import TypeFieldLabel from '../../../../shared/TypeFieldLabel/TypeFieldLabel';
import KeyFieldLabel from '../../../../shared/KeyFieldLabel/KeyFieldLabel';
import * as S from './DatasetStructureItem.styles';

interface DatasetStructureItemProps {
  initialStateOpen?: boolean;
  nesting: number;
  datasetField: DataSetField;
  dataEntityId: number;
  versionId?: number;
  renderStructureItem: (
    field: DataSetField,
    nesting: number,
    rowHeight?: number
  ) => JSX.Element;
  rowHeight?: number;
}

const DatasetStructureItem: React.FC<DatasetStructureItemProps> = ({
  initialStateOpen = false,
  nesting,
  datasetField,
  renderStructureItem,
  dataEntityId,
  versionId,
  rowHeight,
}) => {
  const { selectedFieldId, setSelectedFieldId, setSearchQuery } = useStructure();

  const [open, setOpen] = React.useState(initialStateOpen);

  const childFields = useAppSelector(
    getDatasetStructure({
      datasetId: dataEntityId,
      versionId,
      parentFieldId: datasetField.id,
    })
  );

  const referenceFieldName = useAppSelector(
    getDatasetFieldName(datasetField.referenceFieldId)
  );

  const collapseBlock = useMemo(
    () => (
      <S.CollapseContainer $visibility={!!childFields?.length}>
        <Button
          buttonType='linkGray-m'
          icon={
            <ChevronIcon
              width={10}
              height={5}
              transform={open ? 'rotate(0)' : 'rotate(-90)'}
            />
          }
          aria-label='expand row'
          onClick={() => setOpen(!open)}
        />
      </S.CollapseContainer>
    ),
    [open, childFields?.length]
  );

  const handleRowClick = React.useCallback(() => {
    setSelectedFieldId(datasetField.id);
    setSearchQuery('');
  }, [datasetField.id]);

  const handleReferenceFieldClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (!datasetField.referenceFieldId) return;

      setSelectedFieldId(datasetField.referenceFieldId);
      setSearchQuery('');
    },
    [datasetField.referenceFieldId]
  );

  const isRowSelected = selectedFieldId === datasetField.id;

  return (
    <>
      <S.RowContainer
        onClick={handleRowClick}
        container
        $nesting={nesting}
        $rowHeight={rowHeight}
        $isRowSelected={isRowSelected}
      >
        <Grid container item sx={{ py: 1.75 }} flexWrap='nowrap'>
          <S.RowInfoWrapper container $nesting={nesting} item sx={{ px: 1 }}>
            {collapseBlock}
            <Grid container justifyContent='space-between' flexWrap='nowrap'>
              <Grid display='flex' minWidth={0} flexWrap='nowrap' alignItems='center'>
                <Typography variant='h4' noWrap title={datasetField.name}>
                  {(datasetField.isKey && 'Key') ||
                    (datasetField.isValue && 'Value') ||
                    datasetField.name}
                </Typography>
                {datasetField?.type.type === 'TYPE_REFERENCE' &&
                  datasetField.referenceFieldId && (
                    <Button
                      sx={{ ml: 1 }}
                      text={referenceFieldName}
                      buttonType='link-m'
                      startIcon={<RecursiveIcon />}
                      onClick={handleReferenceFieldClick}
                    />
                  )}
                {datasetField.isPrimaryKey && (
                  <KeyFieldLabel sx={{ ml: 0.5 }} keyType='primary' />
                )}
                {datasetField.isSortKey && (
                  <KeyFieldLabel sx={{ ml: 0.5 }} keyType='sort' />
                )}
              </Grid>
              <Grid display='flex' flexWrap='nowrap' alignItems='center'>
                {datasetField?.enumValueCount !== undefined &&
                  datasetField?.enumValueCount > 0 && (
                    <Typography
                      px={0.5}
                      mr={1}
                      variant='subtitle1'
                    >{`${datasetField.enumValueCount} enums`}</Typography>
                  )}
                <AppTooltip
                  title={`Logical type: ${datasetField.type.logicalType}`}
                  type='dark'
                  checkForOverflow={false}
                  childSx={{ display: 'flex' }}
                >
                  <StrokedInfoIcon />
                </AppTooltip>
                <TypeFieldLabel typeName={datasetField.type.type} sx={{ ml: 1 }} />
              </Grid>
            </Grid>
          </S.RowInfoWrapper>
        </Grid>
      </S.RowContainer>
      <Grid item>
        <Collapse in={open} timeout='auto' unmountOnExit>
          {open && childFields.length
            ? childFields.map(field => renderStructureItem(field, nesting + 1))
            : null}
        </Collapse>
      </Grid>
    </>
  );
};

export default DatasetStructureItem;
