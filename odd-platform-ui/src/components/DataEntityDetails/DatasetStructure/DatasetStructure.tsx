import React, { useState } from 'react';

import { Box, Grid, SelectChangeEvent, Typography } from '@mui/material';
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
import AppInput from 'components/shared/AppInput/AppInput';
import { getDatasetStructure } from 'redux/selectors/datasetStructure.selectors';

import { useDebouncedCallback } from 'use-debounce';

import { datasetStructurePath } from 'lib/paths';
import { isComplexField } from 'lib/helpers';
import { DataSetStructureTypesCount } from 'redux/interfaces/datasetStructure';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import ColumnsIcon from 'components/shared/Icons/ColumnsIcon';
import DatasetStructureSkeleton from 'components/DataEntityDetails/DatasetStructure/DatasetStructureSkeleton/DatasetStructureSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppSelect from 'components/shared/AppSelect/AppSelect';
import { useAppSelector } from 'lib/redux/hooks';

import DatasetStructureTableContainer from './DatasetStructureTable/DatasetStructureTableContainer';
import DatasetStructureFieldTypeLabel from './DatasetStructureFieldTypeLabel/DatasetStructureFieldTypeLabel';

interface DatasetStructureTableProps {
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
  const [searchText, setSearchText] = React.useState<string>('');
  const [scrollToIndex, setScrollToIndex] = useState(0);

  const datasetStructureRoot = useAppSelector(state =>
    getDatasetStructure(state, {
      datasetId: dataEntityId,
      versionId: versionIdParam,
    })
  );

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
  const handleRevisionChange = (event: SelectChangeEvent<unknown>) => {
    const newVersionId = event.target.value as unknown as number;
    fetchDataSetStructure({
      dataEntityId,
      versionId: newVersionId,
    });
    history.push(datasetStructurePath(dataEntityId, newVersionId));
  };

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      const indexItem = datasetStructureRoot.findIndex(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setScrollToIndex(indexItem);
    }, 500),
    [searchText]
  );

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchText(event.target.value);
    handleSearch();
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
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
            <Grid item xs={8} container alignItems="center">
              <Typography variant="h5" display="flex" sx={{ mr: 3 }}>
                <ColumnsIcon />
                <NumberFormatted
                  sx={{ mx: 0.5 }}
                  value={datasetStats?.fieldsCount}
                />
                <Typography variant="body2" color="texts.hint">
                  columns
                </Typography>
              </Typography>
              {toPairs(typesCount).map(([type, count]) =>
                isComplexField(type as DataSetFieldTypeTypeEnum) ? null : (
                  <Typography key={type} variant="h5" sx={{ mr: 5 }}>
                    {count}
                    <DatasetStructureFieldTypeLabel
                      sx={{ mx: 0.5 }}
                      typeName={type as DataSetFieldTypeTypeEnum}
                    />
                    <Typography
                      component="span"
                      variant="body2"
                      color="texts.hint"
                    >
                      {count && datasetStats?.fieldsCount
                        ? round(
                            (count * 100) / datasetStats.fieldsCount,
                            2
                          )
                        : 0}
                      %
                    </Typography>
                  </Typography>
                )
              )}
            </Grid>
            <Grid
              item
              xs={4}
              container
              flexWrap="nowrap"
              alignItems="center"
              justifyContent="flex-end"
            >
              <AppInput
                placeholder="Search"
                sx={{ minWidth: '250px', mr: 1 }}
                fullWidth={false}
                value={searchText}
                InputProps={{ 'aria-label': 'search' }}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
              />
              {datasetStructureVersion ? (
                <>
                  <Typography variant="subtitle2">
                    Current Revision:
                  </Typography>
                  <AppSelect
                    sx={{ width: 52, ml: 1 }}
                    fullWidth={false}
                    type="number"
                    native
                    defaultValue={datasetStructureVersion}
                    onChange={handleRevisionChange}
                  >
                    {datasetVersions?.map(rev => (
                      <option key={rev.id} value={rev.id}>
                        {rev.version}
                      </option>
                    ))}
                  </AppSelect>
                </>
              ) : null}
            </Grid>
          </Grid>
          {datasetStructureVersion ? (
            <DatasetStructureTableContainer
              dataEntityId={dataEntityId}
              versionId={versionIdParam}
              scrollToIndex={scrollToIndex}
            />
          ) : null}
        </Grid>
      )}
    </Box>
  );
};
export default DatasetStructureTable;
