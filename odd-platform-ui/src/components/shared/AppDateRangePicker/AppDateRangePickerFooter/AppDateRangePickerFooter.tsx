import React from 'react';
import AppButton from 'components/shared/AppButton/AppButton';
import { Grid } from '@mui/material';

interface AppDateRangePickerFooterProps {
  position: string;
  onClickDoneBtn: () => void;
  ranges: Array<{ label: string; value: Date[] }>;
  setRange: ([beginDate, endDate]: Date[]) => void;
}

const DateRangePickerFooter: React.FC<AppDateRangePickerFooterProps> = ({
  position,
  onClickDoneBtn,
  ranges,
  setRange,
}) => (
  <Grid
    sx={{ p: 2, pt: 1 }}
    container
    justifyContent='space-between'
    alignItems='center'
    flexWrap='nowrap'
  >
    <Grid>
      {ranges.map(range => (
        <AppButton
          key={range.label}
          sx={{ mr: 0.5 }}
          color='secondary'
          size='medium'
          onClick={() => setRange(range.value)}
        >
          {range.label}
        </AppButton>
      ))}
    </Grid>
    <AppButton color='primary' size='large' onClick={onClickDoneBtn}>
      Done
    </AppButton>
  </Grid>
);

export default DateRangePickerFooter;
