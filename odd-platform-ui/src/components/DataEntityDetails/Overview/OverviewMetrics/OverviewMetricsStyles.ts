import styled from 'styled-components';
import { Button, AppPaper } from 'components/shared/elements';

export const Container = styled(AppPaper)<{
  $open: boolean;
  $visibleHeight: string;
  $showBtn: boolean;
}>(({ $open, $visibleHeight, $showBtn, theme }) => ({
  position: 'relative',
  height: $visibleHeight,
  overflow: 'hidden',
  padding: theme.spacing(2, 2, $showBtn ? 4 : 2, 2),

  '&::after': {
    display: $open || !$showBtn ? 'none' : 'block',
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '1px',
    width: '99.6%',
    height: '90px',
    background:
      'linear-gradient(to bottom,rgba(255,255,255,0) 0,rgba(255,255,255,0) -130%, #fff 60%);',
  },
}));

export const ViewButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(0.75),
  width: 'fit-content',
  position: 'absolute',
  bottom: '16px',
  left: '16px',
  zIndex: 2,
}));
