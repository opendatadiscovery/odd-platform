import React from 'react';
import { Box, Grid } from '@mui/material';
import Button from 'components/shared/elements/Button/Button';

interface AppDateRangePickerFooterProps {
  // eslint-disable-next-line react/no-unused-prop-types
  position: string;
  onClickDoneBtn: () => void;
  ranges: Array<{ label: string; value: Date[] }>;
  setRange: ([beginDate, endDate]: Date[]) => void;
  isRangeCorrect: boolean;
}

const DateRangePickerFooter: React.FC<AppDateRangePickerFooterProps> = ({
  onClickDoneBtn,
  ranges,
  setRange,
  isRangeCorrect,
}) => (
  <Grid
    sx={{ p: 2, pt: 1 }}
    container
    justifyContent='space-between'
    alignItems='center'
    flexWrap='nowrap'
  >
    <Box display='flex' flexWrap='nowrap'>
      {ranges.map(range => (
        <Box key={range.label} sx={{ mr: 0.5, px: 1.5, py: 0.25 }}>
          <Button
            text={range.label}
            key={range.label}
            buttonType='link-m'
            onClick={() => setRange(range.value)}
          />
        </Box>
      ))}
    </Box>
    <Button
      text='Done'
      buttonType='main-lg'
      onClick={onClickDoneBtn}
      disabled={!isRangeCorrect}
    />
  </Grid>
);

export default DateRangePickerFooter;
