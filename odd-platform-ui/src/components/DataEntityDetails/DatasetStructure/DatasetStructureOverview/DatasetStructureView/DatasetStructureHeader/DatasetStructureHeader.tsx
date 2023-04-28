import React, { type FC, useCallback, useState } from 'react';
import { useAppDispatch } from 'redux/lib/hooks';
import { useNavigate } from 'react-router-dom';
import { useAppDateTime, useAppParams, useAppPaths } from 'lib/hooks';
import type { SelectChangeEvent } from '@mui/material';
import { Grid, Typography } from '@mui/material';
import { fetchDataSetStructure } from 'redux/thunks';
import { ClearIcon, ColumnsIcon, SearchIcon } from 'components/shared/icons';
import {
  Button,
  AppInput,
  AppMenuItem,
  AppSelect,
  NumberFormatted,
} from 'components/shared/elements';
import useStructure from '../../lib/useStructure';
import DatasetStructureTypeCounts from './DatasetStructureTypeCounts/DatasetStructureTypeCounts';

const DatasetStructureHeader: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { versionId, dataEntityId } = useAppParams();
  const { datasetStructurePath, DataEntityRoutes, datasetStructureComparePath } =
    useAppPaths();
  const { datasetStructureVersionFormattedDateTime } = useAppDateTime();
  const {
    handleSearch,
    searchQuery,
    setSearchQuery,
    datasetFieldTypesCount,
    datasetFieldFieldsCount,
    datasetVersions,
  } = useStructure();

  const [typesExpanded, setTypesExpanded] = useState(false);

  const sortedVersions = [...(datasetVersions || [])].sort(
    (a, b) => a.version - b.version
  );

  const handleRevisionChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      const newVersionId = event.target.value as number;
      dispatch(fetchDataSetStructure({ dataEntityId, versionId: newVersionId }));
      navigate(
        datasetStructurePath(DataEntityRoutes.overview, dataEntityId, newVersionId)
      );
    },
    [dataEntityId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch(searchQuery);
    },
    [handleSearch, searchQuery]
  );

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleCompareClick = useCallback(() => {
    const firstVersionId = sortedVersions[0].id;
    const secondVersionId = sortedVersions[sortedVersions.length - 1].id;
    navigate(datasetStructureComparePath(dataEntityId, firstVersionId, secondVersionId));
  }, [dataEntityId]);

  const onSearchClick = useCallback(() => {
    handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  const clearSearchField = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <Grid
      p={2}
      item
      justifyContent='space-between'
      alignItems={typesExpanded ? 'flex-start' : 'center'}
      container
      flexWrap='nowrap'
    >
      <Grid item xs={0.8}>
        <Typography variant='h5' sx={{ display: 'flex' }}>
          <ColumnsIcon />
          <NumberFormatted sx={{ mx: 0.5 }} value={datasetFieldFieldsCount} />
          <Typography variant='body2' color='texts.hint'>
            columns
          </Typography>
        </Typography>
      </Grid>
      <Grid item container flexWrap='nowrap'>
        <DatasetStructureTypeCounts
          fieldsCount={datasetFieldFieldsCount}
          typesCount={datasetFieldTypesCount}
          expanded={typesExpanded}
          setExpanded={setTypesExpanded}
        />
      </Grid>
      <Grid
        item
        container
        flexWrap='nowrap'
        alignItems='center'
        justifyContent='flex-end'
      >
        <AppInput
          placeholder='Search'
          sx={{ minWidth: '250px', mr: 1 }}
          fullWidth={false}
          value={searchQuery}
          InputProps={{ 'aria-label': 'search' }}
          onKeyDown={handleKeyDown}
          onChange={handleOnChange}
          customStartAdornment={{
            variant: 'search',
            showAdornment: true,
            onCLick: onSearchClick,
            icon: <SearchIcon />,
          }}
          customEndAdornment={{
            variant: 'clear',
            showAdornment: !!searchQuery,
            onCLick: clearSearchField,
            icon: <ClearIcon />,
          }}
        />
        <AppSelect
          defaultValue={versionId}
          value={versionId}
          onChange={handleRevisionChange}
          fullWidth={false}
        >
          {sortedVersions.map(rev => (
            <AppMenuItem key={rev.id} value={rev.id}>
              <Grid container flexWrap='nowrap'>
                <Typography variant='body1' mr={1}>
                  {`Rev. ${rev.version}`}
                </Typography>
                <Typography variant='body1' color='texts.hint'>
                  {`(${datasetStructureVersionFormattedDateTime(
                    rev.createdAt.getTime()
                  )})`}
                </Typography>
              </Grid>
            </AppMenuItem>
          ))}
        </AppSelect>
        <Button
          text='Revision compare'
          buttonType='secondary-m'
          sx={{ ml: 1 }}
          onClick={handleCompareClick}
          disabled={datasetVersions.length < 2}
        />
      </Grid>
    </Grid>
  );
};

export default DatasetStructureHeader;
