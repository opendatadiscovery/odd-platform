import styled from 'styled-components';
import { toolbarHeight } from 'lib/constants';

export default styled('div')<{ $sxHeight?: number }>(({ theme, $sxHeight = 13.75 }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: `calc(100vh - ${toolbarHeight}px - ${theme.spacing($sxHeight)})`,
  overflowY: 'scroll',
}));
