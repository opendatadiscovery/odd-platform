import React from 'react';
import { Collapse, Typography, Grid, MenuItem } from '@mui/material';
import cx from 'classnames';
import { round } from 'lodash';
import {
  DataSetField,
  DataSetFieldTypeTypeEnum,
  DataSetStats,
  InternalDescription,
  DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest,
} from 'generated-sources';
import {
  DataSetFormattedStats,
  DatasetStatsLabelMap,
  DataSetFormattedStatsKeys,
} from 'redux/interfaces/datasetStructure';
import { format } from 'date-fns';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import AppButton from 'components/shared/AppButton/AppButton';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import PlusIcon from 'components/shared/Icons/PlusIcon';
import MinusIcon from 'components/shared/Icons/MinusIcon';
import LineBreakIcon from 'components/shared/Icons/LineBreakIcon';
import LabelsEditFormContainer from 'components/DataEntityDetails/DatasetStructure/LabelsEditForm/LabelsEditFormContainer';
import InternalDescriptionFormDialogContainer from 'components/DataEntityDetails/DatasetStructure/InternalDescriptionFormDialog/InternalDescriptionFormDialogContainer';
import DatasetStructureFieldTypeLabel from 'components/DataEntityDetails/DatasetStructure/DatasetStructureFieldTypeLabel/DatasetStructureFieldTypeLabel';
import InformationIcon from 'components/shared/Icons/InformationIcon';
import Tooltip from 'components/shared/Tooltip/Tooltip';
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
      <button
        className={classes.treeDivider}
        type="button"
        aria-label="expand row"
        onClick={() => setOpen(!open)}
      >
        <div
          className={cx(classes.collapseBtn, {
            [classes.collapseBtnOpen]: open,
          })}
        >
          {open ? <MinusIcon /> : <PlusIcon />}
        </div>
      </button>
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
                  <Tooltip
                    tooltipContent={datasetField.name}
                    place="bottom"
                  >
                    <Typography noWrap>
                      {(datasetField.isKey && 'Key') ||
                        (datasetField.isValue && 'Value') ||
                        datasetField.name}
                    </Typography>
                  </Tooltip>
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
                  <Tooltip
                    tooltipContent={datasetField.internalDescription}
                    place="bottom"
                  >
                    <Typography
                      className={classes.internalDescription}
                      noWrap
                    >
                      {datasetField.internalDescription}
                    </Typography>
                  </Tooltip>
                  <Tooltip
                    tooltipContent={datasetField.externalDescription}
                    place="bottom"
                  >
                    <Typography
                      className={classes.externalDescription}
                      noWrap
                    >
                      {datasetField.externalDescription}
                    </Typography>
                  </Tooltip>
                  {datasetField.type.type ===
                    DataSetFieldTypeTypeEnum.STRUCT &&
                  childFields.length ? (
                    <Typography
                      variant="subtitle2"
                      className={classes.childKeys}
                    >
                      <LineBreakIcon />
                      {childFields?.map(field => field.name).join(', ')}
                    </Typography>
                  ) : null}
                </Grid>
              </Grid>
            </Grid>
            <Grid item className={classes.typeCol}>
              <Tooltip
                tooltipControl="byClick"
                tooltipContent={
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
                place="bottom"
                type="light"
              >
                <AppButton
                  className={classes.optionsBtn}
                  size="medium"
                  color="primaryLight"
                  icon={<KebabIcon />}
                />
              </Tooltip>
              <DatasetStructureFieldTypeLabel
                type={datasetField.type.type}
              />
              <Tooltip
                tooltipContent={`Logical type: ${datasetField.type.logicalType}`}
                place="bottom"
                type="dark"
                classes={{ childrenContainer: classes.logicalTypeIcon }}
              >
                <InformationIcon />
              </Tooltip>
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
