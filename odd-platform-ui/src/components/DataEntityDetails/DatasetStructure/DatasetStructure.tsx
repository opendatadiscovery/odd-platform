import { Grid, Typography, Select } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { toPairs, round } from 'lodash';
import {
  DataSetFieldTypeTypeEnum,
  DataSetStats,
  DataSetVersion,
  DataSetApiGetDataSetStructureLatestRequest,
  DataSetApiGetDataSetStructureByVersionIdRequest,
} from 'generated-sources';
import { datasetStructurePath } from 'lib/paths';
import { isComplexField } from 'lib/helpers';
import { DataSetStructureTypesCount } from 'redux/interfaces/datasetStructure';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import ColumnsIcon from 'components/shared/Icons/ColumnsIcon';
import { StylesType } from './DatasetStructureStyles';
import DatasetStructureTableContainer from './DatasetStructureTable/DatasetStructureTableContainer';
import DatasetStructureFieldTypeLabel from './DatasetStructureFieldTypeLabel/DatasetStructureFieldTypeLabel';

interface DatasetStructureTableProps extends StylesType {
  dataEntityId: number;
  datasetStats: DataSetStats;
  datasetVersions?: DataSetVersion[];
  typesCount: DataSetStructureTypesCount;
  versionIdParam?: number;
  datasetStructureVersion?: number;
  fetchDataSetStructureLatest: (
    params: DataSetApiGetDataSetStructureLatestRequest
  ) => void;
  fetchDataSetStructure: (
    params: DataSetApiGetDataSetStructureByVersionIdRequest
  ) => void;
}

const DatasetStructureTable: React.FC<DatasetStructureTableProps> = ({
  classes,
  dataEntityId,
  datasetStats,
  datasetVersions,
  typesCount,
  versionIdParam,
  datasetStructureVersion,
  fetchDataSetStructureLatest,
  fetchDataSetStructure,
}) => {
  const history = useHistory();

  React.useEffect(() => {
    if (versionIdParam) {
      fetchDataSetStructure({
        dataEntityId,
        versionId: versionIdParam,
      });
    } else {
      fetchDataSetStructureLatest({ dataEntityId });
    }
  }, [fetchDataSetStructureLatest, dataEntityId]);

  const handleRevisionChange = (
    e: React.ChangeEvent<{ value: unknown }>
  ) => {
    const newVersionId = e.target.value as number;
    fetchDataSetStructure({
      dataEntityId,
      versionId: newVersionId,
    });
    history.push(datasetStructurePath(dataEntityId, newVersionId));
  };

  return (
    <div>
      <div className={classes.container}>
        <Grid container>
          <Grid
            item
            xs={12}
            justify="space-between"
            alignItems="center"
            container
          >
            <Grid item xs={8} className={classes.typesCount}>
              <Typography variant="h5" className={classes.dataCount}>
                <ColumnsIcon className={classes.statIcon} />
                <NumberFormatted value={datasetStats?.fieldsCount} />
                <Typography
                  variant="body2"
                  className={classes.columnsName}
                >
                  columns
                </Typography>
              </Typography>
              {toPairs(typesCount).map(([type, count]) =>
                isComplexField(type as DataSetFieldTypeTypeEnum) ? null : (
                  <Typography
                    key={type}
                    variant="h5"
                    className={classes.typesCountItem}
                  >
                    {count}
                    <DatasetStructureFieldTypeLabel
                      type={type as DataSetFieldTypeTypeEnum}
                    />
                    <span className={classes.typesCountItemPct}>
                      {count
                        ? round(
                            (count * 100) / datasetStats?.fieldsCount,
                            2
                          )
                        : 0}
                      %
                    </span>
                  </Typography>
                )
              )}
            </Grid>
            <Grid item xs={4} className={classes.revisionContainer}>
              {datasetStructureVersion ? (
                <>
                  <Typography variant="subtitle2">
                    Current Revision:
                  </Typography>
                  <Select
                    native
                    className={classes.revisionSelect}
                    classes={{
                      root: classes.revisionSelect,
                      select: classes.revisionSelectSelect,
                    }}
                    labelId="revision-select-label"
                    id="revision-select"
                    variant="outlined"
                    defaultValue={datasetStructureVersion}
                    onChange={handleRevisionChange}
                  >
                    {datasetVersions?.map(rev => (
                      <option key={rev.id} value={rev.id}>
                        {rev.version}
                      </option>
                    ))}
                  </Select>
                </>
              ) : null}
            </Grid>
          </Grid>
          {datasetStructureVersion ? (
            <DatasetStructureTableContainer
              dataEntityId={dataEntityId}
              versionId={versionIdParam}
              datasetRowsCount={datasetStats?.rowsCount}
            />
          ) : null}
        </Grid>
      </div>
    </div>
  );
};
export default DatasetStructureTable;
