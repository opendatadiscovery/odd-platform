import styled from 'styled-components';

// The bar strip above the slider: one bar per rail stop, heights sqrt-scaled relative to the largest count. Bars inside the
// current selection use the platform's element colour; the rest stay neutral, so the selected bands read at a glance.
export const Bars = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  gap: theme.spacing(0.25),
  height: 28,
  width: '100%',
  padding: theme.spacing(0, 1.25), // aligns the bars with the slider's thumb centres (MUI's default 10px padding)
  boxSizing: 'border-box',
}));

export const Bar = styled('span')<{ $active: boolean; $heightPct: number }>(
  ({ theme, $active, $heightPct }) => ({
    flex: 1,
    minWidth: 2,
    // a zero band keeps a 2px sliver so the rail still reads as a distribution, not as a gap
    height: `${Math.max(2, Math.round($heightPct))}%`,
    borderRadius: '1px 1px 0 0',
    backgroundColor: $active
      ? theme.palette.backgrounds.element
      : theme.palette.backgrounds.secondary,
  })
);

export const SliderRow = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1.25),
  boxSizing: 'border-box',
  width: '100%',
}));
