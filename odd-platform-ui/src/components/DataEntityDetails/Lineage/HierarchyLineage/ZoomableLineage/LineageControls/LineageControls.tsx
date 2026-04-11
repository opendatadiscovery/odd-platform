import React from 'react';
import { FormControlLabel, type SelectChangeEvent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Checkbox, AppSelect, AppTabs, Button } from 'components/shared/elements';
import { TargetIcon } from 'components/shared/icons';
import { useQueryParams } from 'lib/hooks';
import { expandAllGroups } from 'redux/slices/dataEntityLineage/dataEntityLineage.slice';
import { useAppDispatch } from 'redux/lib/hooks';
import type { LineageQueryParams } from '../../lineageLib/interfaces';
import * as S from './LineageControlsStyles';
import { defaultLineageQuery, lineageDepth } from '../../lineageLib/constants';

interface LineageControlsProps {
  handleCenterRoot: () => void;
  rootNodeId: number;
}
const LineageControls = React.memo<LineageControlsProps>(
  ({ handleCenterRoot, rootNodeId }) => {
    const { t } = useTranslation();

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
        setQueryParams(prev => ({ ...prev, full: newViewIndex <= 0 })),
      [setQueryParams]
    );

    return (
      <S.ControlsContainer>
        <FormControlLabel
          sx={{ mr: 0 }}
          control={
            <Checkbox
              value={eag}
              checked={eag}
              onChange={handleExpandGroupsChange}
              sx={{ mr: 1 }}
            />
          }
          label={
            <Typography variant='body1' color='texts.info'>
              {t('Expand all nested items')}
            </Typography>
          }
        />
        <FormControlLabel
          sx={{ mr: 0 }}
          control={
            <Checkbox
              value={fn}
              checked={fn}
              onChange={handleFullNamesChange}
              sx={{ mr: 1 }}
            />
          }
          label={
            <Typography variant='body1' color='texts.info'>
              {t('Show full names')}
            </Typography>
          }
        />
        <Button
          text={t('Main')}
          buttonType='secondary-m'
          startIcon={<TargetIcon />}
          onClick={handleCenterRoot}
        />
        <AppTabs
          type='secondarySmall'
          orientation='horizontal'
          items={[{ name: t('Full') }, { name: t('Compact') }]}
          selectedTab={full ? 0 : 1}
          handleTabChange={handleViewChange}
        />
        <Typography variant='subtitle2'>{t('Depth')}:</Typography>
        <AppSelect
          sx={{ width: 48, backgroundColor: 'white' }}
          native
          fullWidth={false}
          size='small'
          type='number'
          value={d}
          onChange={handleDepthChange}
        >
          {lineageDepth.map(depth => (
            <option key={depth} value={depth}>
              {depth}
            </option>
          ))}
        </AppSelect>
      </S.ControlsContainer>
    );
  }
);

export default LineageControls;
