import React from 'react';
import { AppButton, AppTabs, AppSelect } from 'components/shared';
import { TargetIcon } from 'components/shared/Icons';
import { type SelectChangeEvent, Typography } from '@mui/material';
import * as S from './LineageControlsStyles';
import LineageContext from '../../lineageLib/LineageContext/LineageContext';

interface LineageControlsProps {
  handleCenterRoot: () => void;
  lineageDepth: number;
  handleDepthChange: (e: SelectChangeEvent<unknown>) => void;
}
const LineageControls = React.memo<LineageControlsProps>(
  ({ handleCenterRoot, lineageDepth, handleDepthChange }) => {
    const { compact, setCompactView } = React.useContext(LineageContext);

    return (
      <S.ControlsContainer>
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
          selectedTab={compact ? 1 : 0}
          handleTabChange={(newViewIndex: number) => setCompactView(newViewIndex > 0)}
        />
        <Typography variant='subtitle2'>Depth:</Typography>
        <AppSelect
          sx={{ width: 48 }}
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
