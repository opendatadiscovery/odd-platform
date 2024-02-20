import styled from 'styled-components';
import { toolbarHeight } from 'lib/constants';

export default styled('div')<{ $offsetY?: number }>(({ $offsetY = 130 }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  height: `calc(100vh - ${toolbarHeight}px - ${$offsetY}px)`,
  overflow: 'auto',
}));
