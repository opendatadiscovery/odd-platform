import React, { memo } from 'react';
import { Collapse, Grid, Typography } from '@mui/material';
import { type DataSetField } from 'generated-sources';
import { isComplexField } from 'lib/helpers';
import { getDatasetStructure } from 'redux/selectors';
import { AppIconButton, AppTooltip } from 'components/shared';
import { ChevronIcon, StrokedInfoIcon } from 'components/shared/Icons';
import { useAppSelector } from 'redux/lib/hooks';
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

  const datasetStructure = useAppSelector(
    getDatasetStructure({
      datasetId: dataEntityId,
      versionId,
      parentFieldId: datasetField.id,
    })
  );

  const childFields = isComplexField(datasetField.type.type) ? datasetStructure : [];

  const nestedOffset = Math.min(nesting, 10) * 32;

  let collapseBlock;
  if (childFields?.length) {
    collapseBlock = (
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
    );
  }

  const handleRowClick = React.useCallback(() => {
    setSelectedFieldId(datasetField.id);
    setSearchQuery('');
  }, [datasetField.id]);

  const isRowSelected = selectedFieldId === datasetField.id;

  return (
    <>
      <S.RowContainer
        onClick={handleRowClick}
        container
        $offset={nestedOffset}
        $rowHeight={rowHeight}
        $isRowSelected={isRowSelected}
      >
        <Grid container item sx={{ px: 1, py: 1.25 }} flexWrap='nowrap'>
          <S.RowInfoWrapper container $padOffset={nestedOffset} item>
            {collapseBlock && (
              <Grid sx={{ p: 0.5, display: 'flex', alignSelf: 'center' }}>
                {collapseBlock}
              </Grid>
            )}
            <Grid container justifyContent='space-between' py={0.25} flexWrap='nowrap'>
              <Grid display='flex' minWidth={0} flexWrap='nowrap' alignItems='center'>
                <Typography variant='h4' noWrap title={datasetField.name}>
                  {(datasetField.isKey && 'Key') ||
                    (datasetField.isValue && 'Value') ||
                    datasetField.name}
                </Typography>
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

export default memo(DatasetStructureItem);
