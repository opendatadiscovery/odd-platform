import { Grid, Typography } from '@mui/material';
import React, { ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import round from 'lodash/round';
import toPairs from 'lodash/toPairs';
import {
  DataSetApiGetDataSetStructureByVersionIdRequest,
  DataSetApiGetDataSetStructureLatestRequest,
  DataSetFieldTypeTypeEnum,
  DataSetStats,
  DataSetVersion,
} from 'generated-sources';
import { datasetStructurePath } from 'lib/paths';
import { isComplexField } from 'lib/helpers';
import { DataSetStructureTypesCount } from 'redux/interfaces/datasetStructure';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import ColumnsIcon from 'components/shared/Icons/ColumnsIcon';
import DatasetStructureSkeleton from 'components/DataEntityDetails/DatasetStructure/DatasetStructureSkeleton/DatasetStructureSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppTextField from 'components/shared/AppTextField/AppTextField';
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
  isDatasetStructureFetching: boolean;
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
  isDatasetStructureFetching,
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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newVersionId = (e.target.value as unknown) as number;
    fetchDataSetStructure({
      dataEntityId,
      versionId: newVersionId,
    });
    history.push(datasetStructurePath(dataEntityId, newVersionId));
  };

  return (
    <div className={classes.container}>
      {isDatasetStructureFetching ? (
        <SkeletonWrapper
          renderContent={({ randomSkeletonPercentWidth }) => (
            <DatasetStructureSkeleton
              width={randomSkeletonPercentWidth()}
            />
          )}
        />
      ) : (
        <Grid container>
          <Grid
            item
            xs={12}
            justifyContent="space-between"
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
                      typeName={type as DataSetFieldTypeTypeEnum}
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
                  <AppTextField
                    sx={{ width: 52, ml: 1 }}
                    id="revision-select"
                    type="number"
                    selectNative
                    defaultValue={datasetStructureVersion}
                    onChange={handleRevisionChange}
                  >
                    {datasetVersions?.map(rev => (
                      <option key={rev.id} value={rev.id}>
                        {rev.version}
                      </option>
                    ))}
                  </AppTextField>
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
      )}
    </div>
  );
};
export default DatasetStructureTable;
