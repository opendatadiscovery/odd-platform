import React from 'react';
import { ButtonProps, Collapse, Grid, Typography } from '@mui/material';
import round from 'lodash/round';
import {
  DataSetField,
  DataSetFieldTypeTypeEnum,
  DataSetStats,
} from 'generated-sources';
import {
  DataSetFormattedStats,
  DataSetFormattedStatsKeys,
  DatasetStatsLabelMap,
} from 'redux/interfaces/datasetStructure';
import { format } from 'date-fns';
import DatasetStructureKeyFieldLabel from 'components/DataEntityDetails/DatasetStructure/DatasetStructureKeyFieldLabel/DatasetStructureKeyFieldLabel';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import PlusIcon from 'components/shared/Icons/PlusIcon';
import MinusIcon from 'components/shared/Icons/MinusIcon';
import LineBreakIcon from 'components/shared/Icons/LineBreakIcon';
import InformationIcon from 'components/shared/Icons/InformationIcon';
import DatasetStructureFieldTypeLabel from 'components/DataEntityDetails/DatasetStructure/DatasetStructureFieldTypeLabel/DatasetStructureFieldTypeLabel';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppButton from 'components/shared/AppButton/AppButton';
import TruncatedLabel from 'components/shared/TruncatedLabel/TruncatedLabel';

import DatasetFieldInfoEditFormContainer from 'components/DataEntityDetails/DatasetStructure/DatasetStructureTable/DatasetStructureList/DatasetStructureItem/DatasetFieldInfoEditForm/DatasetFieldInfoEditFormContainer';
import DatasetFieldEnumsEditFormContainer from 'components/DataEntityDetails/DatasetStructure/DatasetStructureTable/DatasetStructureList/DatasetStructureItem/DatasetFieldEnumsEditForm/DatasetFieldEnumsEditFormContainer';
import { ButtonColors } from 'components/shared/AppButton/AppButtonStyles';
import { ColContainer } from '../../DatasetStructureTableStyles';
import * as S from './DatasetStructureItemStyles';

interface DatasetStructureItemProps {
  initialStateOpen?: boolean;
  nesting: number;
  rowsCount: DataSetStats['rowsCount'];
  datasetField: DataSetField;
  childFields: DataSetField[];
  renderStructureItem: (
    field: DataSetField,
    nesting: number,
    onSizeChange: () => void
  ) => JSX.Element;
  onSizeChange: () => void;
}

const DatasetStructureItem: React.FC<DatasetStructureItemProps> = ({
  initialStateOpen = false,
  nesting,
  rowsCount,
  datasetField,
  childFields,
  renderStructureItem,
  onSizeChange,
}) => {
  const [open, setOpen] = React.useState<boolean>(initialStateOpen);
  let fieldStats = {} as DataSetFormattedStats;
  switch (datasetField.type.type) {
    case DataSetFieldTypeTypeEnum.STRING:
      fieldStats = datasetField.stats
        ?.stringStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.BOOLEAN:
      fieldStats = datasetField.stats
        ?.booleanStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.INTEGER:
    case DataSetFieldTypeTypeEnum.NUMBER:
      fieldStats = datasetField.stats
        ?.numberStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.DATETIME:
      fieldStats = datasetField.stats
        ?.datetimeStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.BINARY:
      fieldStats = datasetField.stats
        ?.binaryStats as DataSetFormattedStats;
      break;
    default:
      fieldStats = datasetField.stats
        ?.complexStats as DataSetFormattedStats;
  }

  const getCustomStat = React.useCallback(
    (fieldStatName: string) => {
      const label = DatasetStatsLabelMap.get(
        fieldStatName as DataSetFormattedStatsKeys
      );
      const value = fieldStats[fieldStatName as DataSetFormattedStatsKeys];
      if (label && value) {
        return (
          <Grid item xs={3} key={fieldStatName} sx={{ ml: 1 }}>
            <LabeledInfoItem label={label}>
              {datasetField.type.type ===
              DataSetFieldTypeTypeEnum.DATETIME ? (
                format(value, 'd MMM yyyy')
              ) : (
                <NumberFormatted value={value} precision={1} />
              )}
            </LabeledInfoItem>
          </Grid>
        );
      }
      return null;
    },
    [datasetField, fieldStats]
  );

  const nestedBlockStyle = {
    paddingLeft: `${Math.min(nesting, 10) * 20 + 8}px`,
  };
  let collapseBlock;
  if (childFields?.length) {
    collapseBlock = (
      <AppIconButton
        color="collapse"
        open={open}
        icon={
          open ? (
            <MinusIcon width={6} height={6} />
          ) : (
            <PlusIcon width={6} height={6} />
          )
        }
        aria-label="expand row"
        onClick={() => setOpen(!open)}
      />
    );
  }

  const setEnumFormOpenBtn = React.useMemo(() => {
    let btnColor: ButtonColors = 'primaryLight';
    let btnText = 'Add values';
    let btnSize: ButtonProps['size'] = 'medium';
    const count = datasetField.enumValueCount;
    if (count && count > 0) {
      btnColor = 'valueCount';
      btnText = `${count} value${count > 1 ? 's' : ''}`;
      btnSize = 'small';
    }

    return (
      <AppButton size={btnSize} color={btnColor} sx={{ mr: 0.5 }}>
        {btnText}
      </AppButton>
    );
  }, [datasetField.enumValueCount]);
  return (
    <Grid container>
      <Grid item container>
        <S.RowInfo item xs={12} container>
          <Grid
            item
            xs={6}
            container
            wrap="nowrap"
            justifyContent="space-between"
          >
            <ColContainer
              item
              container
              $colType="name"
              style={nestedBlockStyle}
              wrap="nowrap"
            >
              <Grid item sx={{ mr: 0.75 }}>
                {collapseBlock}
              </Grid>
              <Grid item container>
                <Grid
                  item
                  xs={12}
                  container
                  alignItems="center"
                  justifyContent="flex-start"
                  sx={{ pr: 9 }}
                >
                  <AppTooltip title={() => datasetField.name}>
                    <Typography noWrap>
                      {(datasetField.isKey && 'Key') ||
                        (datasetField.isValue && 'Value') ||
                        datasetField.name}
                    </Typography>
                  </AppTooltip>
                </Grid>
                <TruncatedLabel
                  dataList={datasetField.labels}
                  externalEntityId={datasetField.id}
                />
                {datasetField.isPrimaryKey && (
                  <DatasetStructureKeyFieldLabel typeName="primary" />
                )}
                {datasetField.isSortKey && (
                  <DatasetStructureKeyFieldLabel typeName="sort" />
                )}
                <Grid item xs={12} sx={{ pr: 2.5 }}>
                  <AppTooltip
                    title={() => datasetField.internalDescription}
                  >
                    <Typography color="texts.info" noWrap>
                      {datasetField.internalDescription}
                    </Typography>
                  </AppTooltip>
                  <AppTooltip
                    title={() => datasetField.externalDescription}
                  >
                    <Typography color="text.secondary" noWrap>
                      {datasetField.externalDescription}
                    </Typography>
                  </AppTooltip>
                  {datasetField.type.type ===
                    DataSetFieldTypeTypeEnum.STRUCT &&
                  childFields.length ? (
                    <Typography variant="subtitle2" color="texts.info">
                      <LineBreakIcon sx={{ mr: 0.5 }} />
                      {childFields?.map(field => field.name).join(', ')}
                    </Typography>
                  ) : null}
                </Grid>
              </Grid>
            </ColContainer>
            <S.OptionsBtnContainer sx={{ mr: 1 }}>
              {datasetField.type.type ===
                DataSetFieldTypeTypeEnum.INTEGER ||
              datasetField.type.type ===
                DataSetFieldTypeTypeEnum.STRING ? (
                <DatasetFieldEnumsEditFormContainer
                  datasetFieldId={datasetField.id}
                  datasetFieldName={datasetField.name}
                  enumValueType={datasetField.type.type}
                  btnCreateEl={setEnumFormOpenBtn}
                />
              ) : null}
              <DatasetFieldInfoEditFormContainer
                datasetFieldId={datasetField.id}
                btnCreateEl={
                  <AppButton size="medium" color="primaryLight">
                    Edit
                  </AppButton>
                }
              />
            </S.OptionsBtnContainer>
            <S.TypeContainer item>
              <DatasetStructureFieldTypeLabel
                sx={{ mr: 1 }}
                typeName={datasetField.type.type}
              />
              <AppTooltip
                title={() =>
                  `Logical type: ${datasetField.type.logicalType}`
                }
                type="dark"
                checkForOverflow={false}
              >
                <InformationIcon
                  sx={{ display: 'flex', alignItems: 'center' }}
                />
              </AppTooltip>
            </S.TypeContainer>
          </Grid>
          <S.Divider item xs={2} container>
            <ColContainer item xs={6} $colType="uniq">
              <NumberFormatted
                sx={{ ml: 1 }}
                value={fieldStats?.uniqueCount}
              />
              <Typography
                sx={{ ml: 0.5 }}
                variant="body1"
                color="texts.hint"
              >
                {fieldStats?.uniqueCount && rowsCount
                  ? `(${round(
                      (fieldStats.uniqueCount * 100) / rowsCount,
                      0
                    )}%)`
                  : null}
              </Typography>
            </ColContainer>
            <ColContainer item xs={6} $colType="missing">
              <NumberFormatted
                sx={{ ml: 1 }}
                value={fieldStats?.nullsCount}
              />
              <Typography
                sx={{ ml: 0.5 }}
                variant="body1"
                color="texts.hint"
              >
                {fieldStats?.nullsCount && rowsCount
                  ? `${round(
                      (fieldStats.nullsCount * 100) / rowsCount,
                      0
                    )}%`
                  : null}
              </Typography>
            </ColContainer>
          </S.Divider>
          <ColContainer item xs={4} container $colType="stats">
            {fieldStats
              ? Object.keys(fieldStats).map(fieldName =>
                  getCustomStat(fieldName)
                )
              : null}
          </ColContainer>
        </S.RowInfo>
      </Grid>
      <Grid item xs={12}>
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
    </Grid>
  );
};

export default DatasetStructureItem;
