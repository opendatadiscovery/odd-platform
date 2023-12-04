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
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import {
  datasetStructureComparePath,
  datasetStructurePath,
  useDataEntityRouteParams,
} from 'routes';
import useStructure from '../../lib/useStructure';
import DatasetStructureTypeCounts from './DatasetStructureTypeCounts/DatasetStructureTypeCounts';

const DatasetStructureHeader: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { versionId, dataEntityId } = useDataEntityRouteParams();
  const { t } = useTranslation();
  const { updatePath } = useIsEmbeddedPath();
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
      navigate(updatePath(datasetStructurePath(dataEntityId, newVersionId)));
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
    navigate(
      updatePath(
        datasetStructureComparePath(dataEntityId, firstVersionId, secondVersionId)
      )
    );
  }, [dataEntityId]);

  const onSearchClick = useCallback(() => {
    handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  return (
    <Grid
      p={2}
      item
      justifyContent='space-between'
      alignItems={typesExpanded ? 'flex-start' : 'center'}
      container
      flexWrap='nowrap'
    >
      <Grid item>
        <Typography variant='h5' sx={{ display: 'flex' }}>
          <ColumnsIcon />
          <NumberFormatted sx={{ mx: 0.5 }} value={datasetFieldFieldsCount} />
          <Typography variant='body2' color='texts.hint'>
            columns
          </Typography>
        </Typography>
      </Grid>
      <Grid item container flexWrap='nowrap' ml={1}>
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
