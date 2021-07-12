import { createMuiTheme } from '@material-ui/core/styles';
import { shadows } from 'theme/shadows';
import { palette } from 'theme/palette';
import { overrides } from 'theme/overrides';
import { typography } from 'theme/typography';

const theme = createMuiTheme({
  palette,
  typography,
  shadows,
  overrides,
});

export default theme;
