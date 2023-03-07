import React from 'react';
import { Grid, Typography, type SelectChangeEvent } from '@mui/material';
import { ClearIcon, ColumnsIcon, SearchIcon } from 'components/shared/Icons';
import { AppInput, AppMenuItem, AppSelect, NumberFormatted } from 'components/shared';
import type { DataSetStats, DataSetVersion } from 'generated-sources';
import type { DataSetStructureTypesCount } from 'redux/interfaces';
import { fetchDataSetStructure } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import DatasetStructureTypeCounts from './DatasetStructureTypeCounts/DatasetStructureTypeCounts';
import { useStructureContext } from '../../StructureContext/StructureContext';

interface DatasetStructureHeaderProps {
  dataEntityId: number;
  fieldsCount: DataSetStats['fieldsCount'];
  typesCount: DataSetStructureTypesCount;
  datasetStructureVersion?: number;
  datasetVersions?: DataSetVersion[];
}

const DatasetStructureHeader: React.FC<DatasetStructureHeaderProps> = ({
  dataEntityId,
  fieldsCount,
  typesCount,
  datasetStructureVersion,
  datasetVersions,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { datasetStructurePath } = useAppPaths();
  const { datasetStructureVersionFormattedDateTime } = useAppDateTime();
  const { searchQuery, setSearchQuery, handleSearch } = useStructureContext();

  const [typesExpanded, setTypesExpanded] = React.useState(false);

  const handleRevisionChange = (event: SelectChangeEvent<unknown>) => {
    const newVersionId = event.target.value as unknown as number;
    dispatch(fetchDataSetStructure({ dataEntityId, versionId: newVersionId }));
    navigate(datasetStructurePath(dataEntityId, newVersionId));
  };

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch(searchQuery);
    },
    [handleSearch, searchQuery]
  );

  const handleOnChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const onSearchClick = React.useCallback(() => {
    handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  const clearSearchField = React.useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const search = React.useMemo(
    () => (
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
    ),
    [handleKeyDown, handleOnChange, onSearchClick, searchQuery, clearSearchField]
  );

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
          <NumberFormatted sx={{ mx: 0.5 }} value={fieldsCount} />
          <Typography variant='body2' color='texts.hint'>
            columns
          </Typography>
        </Typography>
      </Grid>
      <Grid item xs={7} container flexWrap='nowrap'>
        <DatasetStructureTypeCounts
          fieldsCount={fieldsCount}
          typesCount={typesCount}
          expanded={typesExpanded}
          setExpanded={setTypesExpanded}
        />
      </Grid>
      <Grid
        item
        xs={4.2}
        container
        flexWrap='nowrap'
        alignItems='center'
        justifyContent='flex-end'
      >
        {search}
        <AppSelect defaultValue={datasetStructureVersion} onChange={handleRevisionChange}>
          {datasetVersions?.map(rev => (
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
      </Grid>
    </Grid>
  );
};

export default DatasetStructureHeader;
