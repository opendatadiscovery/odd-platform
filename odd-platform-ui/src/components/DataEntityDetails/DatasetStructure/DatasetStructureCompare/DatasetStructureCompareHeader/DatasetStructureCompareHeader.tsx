import React, { type FC, useCallback } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import { Box, FormControlLabel, Grid, Typography } from '@mui/material';
import { Button, Checkbox, AppMenuItem, AppSelect } from 'components/shared/elements';
import { useAppDateTime, useAppParams, useAppPaths, useQueryParams } from 'lib/hooks';
import { useNavigate } from 'react-router-dom';
import type { DataSetVersion } from 'generated-sources';
import { useAtom } from 'jotai';
import { showOnlyChangesAtom } from '../lib/atoms';
import { defaultStructureCompareQuery } from '../lib/constants';
import type { StructureCompareQueryParams } from '../lib/interfaces';

interface DatasetStructureCompareHeaderProps {
  datasetVersions: DataSetVersion[];
}

const DatasetStructureCompareHeader: FC<DatasetStructureCompareHeaderProps> = ({
  datasetVersions,
}) => {
  const { DataEntityRoutes, datasetStructurePath } = useAppPaths();
  const { dataEntityId } = useAppParams();
  const { datasetStructureVersionFormattedDateTime } = useAppDateTime();
  const navigate = useNavigate();

  const [showOnlyChanges, setShowOnlyChanges] = useAtom(showOnlyChangesAtom);

  const {
    queryParams: { firstVersionId, secondVersionId },
    setQueryParams,
  } = useQueryParams<StructureCompareQueryParams>(defaultStructureCompareQuery);

  const handleCloseClick = useCallback(() => {
    navigate(datasetStructurePath(DataEntityRoutes.overview, dataEntityId));
  }, [dataEntityId]);

  const handleFirstRevisionChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      setQueryParams(prev => ({ ...prev, firstVersionId: e.target.value as string }));
    },
    [setQueryParams]
  );

  const handleSecondRevisionChange = useCallback(
    (e: SelectChangeEvent<unknown>) => {
      setQueryParams(prev => ({ ...prev, secondVersionId: e.target.value as string }));
    },
    [setQueryParams]
  );

  const handleShowOnlyChangesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setShowOnlyChanges(e.target.checked);
    },
    [setShowOnlyChanges]
  );

  const sortedDatasetVersions = [...(datasetVersions || [])].sort(
    (a, b) => a.version - b.version
  );

  return (
    <Grid container flexDirection='column' mt={1}>
      <Grid container justifyContent='space-between' alignItems='center' sx={{ py: 0.5 }}>
        <Box display='flex' flexWrap='nowrap'>
          <Typography variant='h1'>Revision compare</Typography>
          <FormControlLabel
            sx={{ ml: 1 }}
            control={
              <Checkbox
                value={showOnlyChanges}
                checked={showOnlyChanges}
                onChange={handleShowOnlyChangesChange}
                sx={{ mr: 1 }}
              />
            }
            label={
              <Typography variant='body1' color='texts.info'>
                Show changes only
              </Typography>
            }
          />
        </Box>
        <Button text='Close' buttonType='secondary-m' onClick={handleCloseClick} />
      </Grid>
      <Grid container mt={2}>
        <Grid item container xs={6} alignItems='center'>
          <Typography variant='body1' mr={1}>
            From
          </Typography>
          <AppSelect
            defaultValue={firstVersionId}
            value={firstVersionId}
            onChange={handleFirstRevisionChange}
            fullWidth={false}
          >
            {sortedDatasetVersions.map(rev => (
              <AppMenuItem
                key={rev.id}
                value={rev.id}
                disabled={rev.id === +secondVersionId}
              >
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
        <Grid item container xs={6} alignItems='center'>
          <Typography variant='body1' mr={1}>
            To
          </Typography>
          <AppSelect
            defaultValue={secondVersionId}
            value={secondVersionId}
            onChange={handleSecondRevisionChange}
            fullWidth={false}
          >
            {sortedDatasetVersions.map(rev => (
              <AppMenuItem
                key={rev.id}
                value={rev.id}
                disabled={rev.id === +firstVersionId}
              >
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
    </Grid>
  );
};

export default DatasetStructureCompareHeader;
