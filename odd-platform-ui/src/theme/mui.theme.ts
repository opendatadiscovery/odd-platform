import { createMuiTheme } from '@material-ui/core/styles';
import { shadows } from 'theme/shadows';
import { palette } from 'theme/palette';
import { overrides } from 'theme/overrides';
import { typography } from 'theme/typography';
import { breakpoints } from 'theme/breakpoints';

const theme = createMuiTheme({
  palette,
  breakpoints,
  typography,
  shadows,
  overrides,
});

export default theme;
