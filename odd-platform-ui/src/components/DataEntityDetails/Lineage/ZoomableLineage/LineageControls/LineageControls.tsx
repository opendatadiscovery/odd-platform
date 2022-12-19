import React from 'react';
import { AppButton, AppSelect, AppTabs, AppCheckbox } from 'components/shared';
import { TargetIcon } from 'components/shared/Icons';
import { Grid, type SelectChangeEvent, Typography } from '@mui/material';
import { useQueryParams } from 'lib/hooks';
import { expandAllGroups } from 'redux/slices/dataEntityLineage/dataEntityLineage.slice';
import { useAppDispatch } from 'redux/lib/hooks';
import type { LineageQueryParams } from '../../lineageLib/interfaces';
import * as S from './LineageControlsStyles';
import { defaultLineageQuery } from '../../lineageLib/constants';

interface LineageControlsProps {
  handleCenterRoot: () => void;
  rootNodeId: number;
}
const LineageControls = React.memo<LineageControlsProps>(
  ({ handleCenterRoot, rootNodeId }) => {
    const dispatch = useAppDispatch();
    const {
      queryParams: { full, fn, d, eag },
      setQueryParams,
    } = useQueryParams<LineageQueryParams>(defaultLineageQuery);

    React.useEffect(() => {
      if (eag) dispatch(expandAllGroups({ rootNodeId, isExpanded: eag }));
    }, []);

    const handleFullNamesChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setQueryParams(prev => ({ ...prev, fn: event.target.checked }));
      },
      [setQueryParams]
    );

    const handleDepthChange = React.useCallback(
      (event: SelectChangeEvent<unknown>) => {
        setQueryParams(prev => ({ ...prev, d: Number(event.target.value) }));
      },
      [setQueryParams]
    );

    const handleExpandGroupsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setQueryParams(prev => ({ ...prev, eag: event.target.checked }));
      dispatch(expandAllGroups({ rootNodeId, isExpanded: event.target.checked }));
    };

    const handleViewChange = React.useCallback(
      (newViewIndex: number) =>
        setQueryParams(prev => ({ ...prev, full: !(newViewIndex > 0) })),
      [setQueryParams]
    );

    return (
      <S.ControlsContainer>
        <Grid display='flex' flexWrap='nowrap'>
          <AppCheckbox
            value={eag}
            checked={eag}
            onChange={handleExpandGroupsChange}
            sx={{ mr: 1 }}
          />
          <Typography variant='body1' color='texts.info'>
            Expand all nested items
          </Typography>
        </Grid>
        <Grid display='flex' flexWrap='nowrap'>
          <AppCheckbox
            value={fn}
            checked={fn}
            onChange={handleFullNamesChange}
            sx={{ mr: 1 }}
          />
          <Typography variant='body1' color='texts.info'>
            Show full names
          </Typography>
        </Grid>
        <AppButton
          color='primaryLight'
          size='medium'
          startIcon={<TargetIcon />}
          onClick={handleCenterRoot}
        >
          Main
        </AppButton>

        <AppTabs
          type='secondarySmall'
          orientation='horizontal'
          items={[{ name: 'Full' }, { name: 'Compact' }]}
          selectedTab={full ? 0 : 1}
          handleTabChange={handleViewChange}
        />
        <Typography variant='subtitle2'>Depth:</Typography>
        <AppSelect
          sx={{ width: 48, backgroundColor: 'white' }}
          native
          fullWidth={false}
          size='small'
          type='number'
          value={d}
          onChange={handleDepthChange}
        >
          {new Array(20).fill(0).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </AppSelect>
      </S.ControlsContainer>
    );
  }
);

export default LineageControls;
