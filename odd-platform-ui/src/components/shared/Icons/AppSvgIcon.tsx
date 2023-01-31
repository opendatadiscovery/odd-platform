import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';
import styled from 'styled-components';

const AppSvgIcon = styled(SvgIcon)<SvgIconProps>(({ width, height }) => ({
  width: width || '16px',
  height: height || '16px',
}));

export default AppSvgIcon;
