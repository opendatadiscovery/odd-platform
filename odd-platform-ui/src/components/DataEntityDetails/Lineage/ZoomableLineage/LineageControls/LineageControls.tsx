import React from 'react';
import { AppButton, AppSelect, AppTabs, AppCheckbox } from 'components/shared';
import { TargetIcon } from 'components/shared/Icons';
import { Grid, type SelectChangeEvent, Typography } from '@mui/material';
import { useQueryParams } from 'lib/hooks';
import type { LineageQueryParams } from '../../lineageLib/interfaces';
import * as S from './LineageControlsStyles';
import LineageContext from '../../lineageLib/LineageContext/LineageContext';
import { defaultLineageQuery } from '../../lineageLib/constants';

interface LineageControlsProps {
  handleCenterRoot: () => void;
  lineageDepth: number;
  handleDepthChange: (e: SelectChangeEvent<unknown>) => void;
}
const LineageControls = React.memo<LineageControlsProps>(
  ({ handleCenterRoot, lineageDepth, handleDepthChange }) => {
    const { fullTitles, setFullTitlesView, expandGroups, setExpandGroups } =
      React.useContext(LineageContext);

    const {
      queryParams: { full },
      setQueryParams,
    } = useQueryParams<LineageQueryParams>(defaultLineageQuery);

    const handleFullTitlesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setFullTitlesView(event.target.checked);
    };

    const handleExpandGroupsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setExpandGroups(event.target.checked);
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
            value={expandGroups}
            onChange={handleExpandGroupsChange}
            sx={{ mr: 1 }}
          />
          <Typography variant='body1' color='texts.info'>
            Expand all nested items
          </Typography>
        </Grid>
        <Grid display='flex' flexWrap='nowrap'>
          <AppCheckbox
            value={fullTitles}
            onChange={handleFullTitlesChange}
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
          value={lineageDepth}
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
