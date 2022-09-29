import React from 'react';
import { ButtonProps, Collapse, Grid, Typography } from '@mui/material';
import { DataSetField, DataSetFieldTypeTypeEnum, DataSetStats } from 'generated-sources';
import { isComplexField } from 'lib/helpers';
import { getDatasetStructure, getIsUniqStatsExist } from 'redux/selectors';
import {
  AppIconButton,
  AppTooltip,
  ButtonColors,
  TruncatedLabel,
} from 'components/shared';
import { GraphIcon, InformationIcon, MinusIcon, PlusIcon } from 'components/shared/Icons';
import { usePermissions } from 'lib/hooks';
import { useAppSelector } from 'redux/lib/hooks';
import DatasetFieldTypeLabel from './DatasetFieldTypeLabel/DatasetFieldTypeLabel';
import DatasetFieldInfoEditForm from './DatasetFieldInfoEditForm/DatasetFieldInfoEditForm';
import DatasetFieldEnumsEditForm from './DatasetFieldEnumsEditForm/DatasetFieldEnumsEditForm';
import DatasetFieldCollapsedDescription from './DatasetFieldCollapsedDescription/DatasetFieldCollapsedDescription';
import DatasetStructureKeyFieldLabel from '../../../DatasetStructureKeyFieldLabel/DatasetStructureKeyFieldLabel';
import * as S from './DatasetStructureItemStyles';
import DatasetFieldStats from './DatasetFieldStats/DatasetFieldStats';

interface DatasetStructureItemProps {
  initialStateOpen?: boolean;
  nesting: number;
  rowsCount: DataSetStats['rowsCount'];
  datasetField: DataSetField;
  dataEntityId: number;
  versionId?: number;
  renderStructureItem: (
    field: DataSetField,
    nesting: number,
    onSizeChange: () => void
  ) => JSX.Element;
  onSizeChange: () => void;
  rowHeight?: string | number;
}

const DatasetStructureItem: React.FC<DatasetStructureItemProps> = ({
  initialStateOpen = false,
  nesting,
  rowsCount,
  datasetField,
  renderStructureItem,
  dataEntityId,
  versionId,
  onSizeChange,
  rowHeight,
}) => {
  const { isAllowedTo: editDataEntity } = usePermissions({ dataEntityId });

  const [open, setOpen] = React.useState<boolean>(initialStateOpen);

  const datasetStructure = useAppSelector(
    getDatasetStructure({
      datasetId: dataEntityId,
      versionId,
      parentFieldId: datasetField.id,
    })
  );
  const isUniqStatsExist = useAppSelector(
    getIsUniqStatsExist({ datasetId: dataEntityId, versionId })
  );

  const childFields = isComplexField(datasetField.type.type) ? datasetStructure : [];

  const nestedOffset = Math.min(nesting, 10) * 20 + 8;

  let collapseBlock;
  if (childFields?.length) {
    collapseBlock = (
      <AppIconButton
        color='collapse'
        open={open}
        icon={
          open ? <MinusIcon width={6} height={6} /> : <PlusIcon width={6} height={6} />
        }
        aria-label='expand row'
        onClick={() => setOpen(!open)}
      />
    );
  }

  const setEnumFormOpenBtn = React.useMemo(() => {
    let btnColor: ButtonColors = 'primaryLight';
    let btnText = 'Add values';
    let btnSize: ButtonProps['size'] = 'medium';
    let showBtn = false;
    const count = datasetField.enumValueCount;
    if (count && count > 0) {
      btnColor = 'tertiary';
      btnText = `${count} value${count > 1 ? 's' : ''}`;
      btnSize = 'medium';
      showBtn = true;
    }

    return (
      <S.Button
        $showBtn={showBtn}
        disabled={!editDataEntity}
        size={btnSize}
        color={btnColor}
        sx={{ mr: 1 }}
      >
        {btnText}
      </S.Button>
    );
  }, [datasetField.enumValueCount]);

  const datasetFieldInfoEditBtn = (
    <S.Button
      disabled={!editDataEntity}
      size='medium'
      color='primaryLight'
      sx={{ mr: 1 }}
    >
      Edit
    </S.Button>
  );

  return (
    <>
      <S.RowContainer container $offset={nestedOffset} $rowHeight={rowHeight}>
        <Grid
          container
          item
          lg={isUniqStatsExist ? 8 : 12}
          sx={{ p: 1 }}
          flexWrap='nowrap'
        >
          <S.RowInfoWrapper container $padOffset={nestedOffset} item lg={12}>
            {collapseBlock && (
              <Grid sx={{ p: 0.5, display: 'flex' }}>{collapseBlock}</Grid>
            )}
            <Grid container flexDirection='column' flexWrap='nowrap'>
              <S.RowInfoHeader item lg={12}>
                <Grid container sx={{ mr: 0.5 }}>
                  <AppTooltip title={() => datasetField.name}>
                    <Typography noWrap>
                      {(datasetField.isKey && 'Key') ||
                        (datasetField.isValue && 'Value') ||
                        datasetField.name}
                    </Typography>
                  </AppTooltip>
                </Grid>
                <S.RowInfoHeaderActions>
                  <DatasetFieldInfoEditForm
                    datasetFieldId={datasetField.id}
                    btnCreateEl={datasetFieldInfoEditBtn}
                  />
                  {datasetField.type.type === DataSetFieldTypeTypeEnum.INTEGER ||
                  datasetField.type.type === DataSetFieldTypeTypeEnum.STRING ? (
                    <DatasetFieldEnumsEditForm
                      datasetFieldId={datasetField.id}
                      datasetFieldName={datasetField.name}
                      enumValueType={datasetField.type.type}
                      btnCreateEl={setEnumFormOpenBtn}
                    />
                  ) : null}
                  <DatasetFieldTypeLabel
                    typeName={datasetField.type.type}
                    sx={{ mr: 1 }}
                  />
                  <AppTooltip
                    title={() => `Logical type: ${datasetField.type.logicalType}`}
                    type='dark'
                    checkForOverflow={false}
                  >
                    <InformationIcon />
                  </AppTooltip>
                </S.RowInfoHeaderActions>
              </S.RowInfoHeader>
              {(datasetField.isPrimaryKey ||
                (datasetField?.labels && datasetField?.labels?.length > 0) ||
                datasetField.isSortKey) && (
                <Grid
                  container
                  sx={{ mt: 0.5, py: 0.25, flexWrap: 'nowrap' }}
                  item
                  lg={12}
                >
                  <TruncatedLabel
                    onSizeChange={onSizeChange}
                    labelList={datasetField.labels}
                  />
                  {datasetField.isPrimaryKey && (
                    <DatasetStructureKeyFieldLabel sx={{ ml: 0.5 }} keyType='primary' />
                  )}
                  {datasetField.isSortKey && (
                    <DatasetStructureKeyFieldLabel sx={{ ml: 0.5 }} keyType='sort' />
                  )}
                </Grid>
              )}
              {datasetField.externalDescription && (
                <Grid container sx={{ py: 0.25 }} item lg={12}>
                  <AppTooltip title={() => datasetField.externalDescription}>
                    <Typography variant='subtitle2' noWrap>
                      {datasetField.externalDescription}
                    </Typography>
                  </AppTooltip>
                </Grid>
              )}
              {datasetField.internalDescription && (
                <Grid container sx={{ py: 0.25, mt: 0.75 }} item lg={12}>
                  <DatasetFieldCollapsedDescription
                    content={datasetField.internalDescription}
                    onSizeChange={onSizeChange}
                  />
                </Grid>
              )}
              {datasetField.type.type === DataSetFieldTypeTypeEnum.STRUCT &&
              childFields.length ? (
                <Grid
                  container
                  sx={{ py: 0.25, alignItems: 'center', mt: 0.5 }}
                  item
                  lg={12}
                >
                  <GraphIcon sx={{ mr: 0.5 }} />
                  <Typography variant='subtitle2' color='texts.info'>
                    {childFields?.map(field => field.name).join(', ')}
                  </Typography>
                </Grid>
              ) : null}
            </Grid>
          </S.RowInfoWrapper>
        </Grid>
        {isUniqStatsExist && (
          <DatasetFieldStats datasetField={datasetField} rowsCount={rowsCount} />
        )}
      </S.RowContainer>
      <Grid item lg={12}>
        <Collapse
          in={open}
          timeout={0}
          unmountOnExit
          addEndListener={() => onSizeChange()}
        >
          {open && childFields.length
            ? childFields.map(field =>
                renderStructureItem(field, nesting + 1, onSizeChange)
              )
            : null}
        </Collapse>
      </Grid>
    </>
  );
};

export default DatasetStructureItem;
