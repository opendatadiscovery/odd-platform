import React from 'react';
import { Collapse, Grid, MenuItem, Typography } from '@mui/material';
import cx from 'classnames';
import round from 'lodash/round';
import {
  DataSetField,
  DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest,
  DataSetFieldTypeTypeEnum,
  DataSetStats,
  InternalDescription,
} from 'generated-sources';
import {
  DataSetFormattedStats,
  DataSetFormattedStatsKeys,
  DatasetStatsLabelMap,
} from 'redux/interfaces/datasetStructure';
import { format } from 'date-fns';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import PlusIcon from 'components/shared/Icons/PlusIcon';
import MinusIcon from 'components/shared/Icons/MinusIcon';
import LineBreakIcon from 'components/shared/Icons/LineBreakIcon';
import InformationIcon from 'components/shared/Icons/InformationIcon';
import LabelsEditFormContainer from 'components/DataEntityDetails/DatasetStructure/LabelsEditForm/LabelsEditFormContainer';
import InternalDescriptionFormDialogContainer from 'components/DataEntityDetails/DatasetStructure/InternalDescriptionFormDialog/InternalDescriptionFormDialogContainer';
import DatasetStructureFieldTypeLabel from 'components/DataEntityDetails/DatasetStructure/DatasetStructureFieldTypeLabel/DatasetStructureFieldTypeLabel';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import { StylesType } from './DatasetStructureItemStyles';

interface DatasetStructureItemProps extends StylesType {
  initialStateOpen?: boolean;
  nesting: number;
  rowsCount: DataSetStats['rowsCount'];
  datasetField: DataSetField;
  childFields: DataSetField[];
  renderStructureItem: (
    field: DataSetField,
    nesting: number
  ) => JSX.Element;
  updateDataSetFieldDescription: (
    params: DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest
  ) => Promise<InternalDescription>;
}

const DatasetStructureItem: React.FC<DatasetStructureItemProps> = ({
  classes,
  initialStateOpen = false,
  nesting,
  rowsCount,
  datasetField,
  childFields,
  renderStructureItem,
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
        ?.dateTimeStats as DataSetFormattedStats;
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
          <Grid item xs={3} key={fieldStatName}>
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

  return (
    <Grid container className={cx(classes.container)}>
      <Grid item container>
        <Grid item xs={12} container className={classes.rowInfo}>
          <Grid item xs={6} container>
            <Grid
              item
              container
              className={classes.nameCol}
              style={nestedBlockStyle}
              wrap="nowrap"
            >
              <Grid item className={classes.treeDividerContainer}>
                {collapseBlock}
              </Grid>
              <Grid item container>
                <Grid item xs={12} className={classes.nameContainer}>
                  <AppTooltip title={datasetField.name}>
                    <Typography noWrap>
                      {(datasetField.isKey && 'Key') ||
                        (datasetField.isValue && 'Value') ||
                        datasetField.name}
                    </Typography>
                  </AppTooltip>
                  <div
                    className={
                      datasetField.labels ? classes.labelsList : ''
                    }
                  >
                    {datasetField.labels?.map(label => (
                      <LabelItem key={label.id} labelName={label.name} />
                    ))}
                  </div>
                </Grid>
                <Grid
                  item
                  xs={12}
                  className={classes.descriptionContainer}
                >
                  <AppTooltip
                    title={datasetField.internalDescription}
                    offset={{ right: 160 }}
                  >
                    <Typography
                      className={classes.internalDescription}
                      noWrap
                    >
                      {datasetField.internalDescription}
                    </Typography>
                  </AppTooltip>
                  <AppTooltip title={datasetField.externalDescription}>
                    <Typography
                      className={classes.externalDescription}
                      noWrap
                    >
                      {datasetField.externalDescription}
                    </Typography>
                  </AppTooltip>
                  {datasetField.type.type ===
                    DataSetFieldTypeTypeEnum.STRUCT &&
                  childFields.length ? (
                    <Typography
                      variant="subtitle2"
                      className={classes.childKeys}
                    >
                      <LineBreakIcon sx={{ mr: 0.5 }} />
                      {childFields?.map(field => field.name).join(', ')}
                    </Typography>
                  ) : null}
                </Grid>
              </Grid>
            </Grid>
            <Grid item className={classes.typeCol}>
              <div className={classes.optionsBtn}>
                <AppTooltip
                  control="byClick"
                  title={
                    <>
                      <LabelsEditFormContainer
                        datasetFieldId={datasetField.id}
                        btnCreateEl={<MenuItem>Edit Labels</MenuItem>}
                      />
                      <InternalDescriptionFormDialogContainer
                        datasetFieldId={datasetField.id}
                        btnCreateEl={<MenuItem>Edit Description</MenuItem>}
                      />
                    </>
                  }
                >
                  <AppIconButton
                    size="medium"
                    color="primaryLight"
                    icon={<KebabIcon />}
                  />
                </AppTooltip>
              </div>
              <DatasetStructureFieldTypeLabel
                typeName={datasetField.type.type}
              />
              <div>
                <AppTooltip
                  title={`Logical type: ${datasetField.type.logicalType}`}
                  type="dark"
                >
                  <InformationIcon
                    sx={{ display: 'flex', alignItems: 'center' }}
                  />
                </AppTooltip>
              </div>
            </Grid>
          </Grid>
          <Grid item xs={2} container className={classes.columnDivided}>
            <Grid item xs={6} className={classes.uniqCol}>
              <NumberFormatted value={fieldStats?.uniqueCount} />
              <span className={classes.colStatsPct}>
                {fieldStats?.uniqueCount && rowsCount
                  ? `(${round(
                      (fieldStats?.uniqueCount * 100) / rowsCount,
                      0
                    )}%)`
                  : null}
              </span>
            </Grid>
            <Grid item xs={6} className={classes.missingCol}>
              <NumberFormatted value={fieldStats?.nullsCount} />
              <span className={classes.colStatsPct}>
                {fieldStats?.nullsCount && rowsCount
                  ? `${round(
                      (fieldStats?.nullsCount * 100) / rowsCount,
                      0
                    )}%`
                  : null}
              </span>
            </Grid>
          </Grid>
          <Grid item xs={4} container className={classes.statsCol}>
            {fieldStats
              ? Object.keys(fieldStats).map(fieldName =>
                  getCustomStat(fieldName)
                )
              : null}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} className={classes.rowChildren}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          {open && childFields.length
            ? childFields.map(field =>
                renderStructureItem(field, nesting + 1)
              )
            : null}
        </Collapse>
      </Grid>
    </Grid>
  );
};

export default DatasetStructureItem;
