import React, { type FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SelectChangeEvent } from '@mui/material';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from 'redux/lib/hooks';
import { useAppDateTime } from 'lib/hooks';
import { fetchDataSetStructure } from 'redux/thunks';
import { ColumnsIcon } from 'components/shared/icons';
import {
  AppMenuItem,
  AppSelect,
  Button,
  Input,
  NumberFormatted,
} from 'components/shared/elements';
import {
  datasetStructureComparePath,
  datasetStructurePath,
  useDataEntityRouteParams,
} from 'routes';
import useStructure from '../../lib/useStructure';
import DatasetStructureTypeCounts from './DatasetStructureTypeCounts/DatasetStructureTypeCounts';
import DatasetStructureTagFilters from './DatasetStructureTagFilters/DatasetStructureTagFilters';

const DatasetStructureHeader: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { versionId, dataEntityId } = useDataEntityRouteParams();
  const { t } = useTranslation();
  const { datasetStructureVersionFormattedDateTime } = useAppDateTime();
  const {
    handleSearch,
    searchQuery,
    setSearchQuery,
    datasetFieldTypesCount,
    datasetFieldFieldsCount,
    datasetVersions,
    availableTags,
    filtersActive,
    clearFilters,
  } = useStructure();

  const [typesExpanded, setTypesExpanded] = useState(false);

  const sortedVersions = [...(datasetVersions || [])].sort(
    (a, b) => a.version - b.version
  );

  const handleRevisionChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      const newVersionId = event.target.value as number;
      // Reset the in-page filters: a new revision can drop a tag the filter references.
      clearFilters();
      dispatch(fetchDataSetStructure({ dataEntityId, versionId: newVersionId }));
      navigate(datasetStructurePath(dataEntityId, newVersionId));
    },
    [dataEntityId, clearFilters]
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

  return (
    <Grid p={2} item container direction='column' rowGap={1}>
      <Grid
        item
        container
        justifyContent='space-between'
        alignItems='center'
        flexWrap='nowrap'
      >
        <Grid item>
          <Typography variant='h5' sx={{ display: 'flex' }}>
            <ColumnsIcon />
            <NumberFormatted sx={{ mx: 0.5 }} value={datasetFieldFieldsCount} />
            <Typography variant='body2' color='texts.hint'>
              {t('columns')}
            </Typography>
          </Typography>
        </Grid>
        <Grid
          item
          container
          flexWrap='nowrap'
          alignItems='center'
          justifyContent='flex-end'
          sx={{ flexShrink: 0 }}
        >
          <Input
            name='search'
            variant='search-m'
            placeholder={t('Search')}
            sx={{ minWidth: '250px', mr: 1 }}
            onKeyDown={handleKeyDown}
            onChange={handleOnChange}
            value={searchQuery}
            handleSearchClick={onSearchClick}
          />
          <AppSelect
            name='select-revision'
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
            text={t('Revision compare')}
            buttonType='secondary-m'
            sx={{ ml: 1 }}
            onClick={handleCompareClick}
            disabled={datasetVersions.length < 2}
          />
        </Grid>
      </Grid>
      <Grid
        item
        container
        flexWrap='wrap'
        alignItems={typesExpanded ? 'flex-start' : 'center'}
      >
        <Typography
          variant='body2'
          color='texts.hint'
          sx={{ mr: 0.5, whiteSpace: 'nowrap' }}
        >
          {t('Filter by type')}
        </Typography>
        <DatasetStructureTypeCounts
          fieldsCount={datasetFieldFieldsCount}
          typesCount={datasetFieldTypesCount}
          expanded={typesExpanded}
          setExpanded={setTypesExpanded}
        />
      </Grid>
      {(availableTags.length > 0 || filtersActive) && (
        <Grid item container flexWrap='wrap' alignItems='center'>
          {availableTags.length > 0 && (
            <Typography
              variant='body2'
              color='texts.hint'
              sx={{ mr: 0.5, whiteSpace: 'nowrap' }}
            >
              {t('Filter by tag')}
            </Typography>
          )}
          <DatasetStructureTagFilters />
          {filtersActive && (
            <Button
              text={t('Clear All')}
              buttonType='tertiary-m'
              onClick={clearFilters}
              sx={{ ml: 0.5 }}
            />
          )}
        </Grid>
      )}
    </Grid>
  );
};

export default DatasetStructureHeader;
