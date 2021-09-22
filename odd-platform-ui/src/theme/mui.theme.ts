import { createMuiTheme } from '@material-ui/core/styles';
import { breakpoints } from 'theme/breakpoints';
import { overrides } from 'theme/overrides';
import { palette } from 'theme/palette';
import { shadows } from 'theme/shadows';
import { typography } from 'theme/typography';

const theme = createMuiTheme({
  palette,
  breakpoints,
  typography,
  shadows,
  overrides,
});

export default theme;
