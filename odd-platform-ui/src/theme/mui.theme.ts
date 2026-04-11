import { createTheme } from '@mui/material/styles';
import { breakpoints } from 'theme/breakpoints';
import { components } from 'theme/overrides';
import { palette } from 'theme/palette';
import { shadows } from 'theme/shadows';
import { typography } from 'theme/typography';

const theme = createTheme({
  palette,
  breakpoints,
  typography,
  shadows,
  components,
});

export default theme;
