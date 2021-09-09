import { createMuiTheme } from '@material-ui/core/styles';
import { shadows } from 'theme/shadows';
import { palette } from 'theme/palette';
import { overrides } from 'theme/overrides';
import { typography } from 'theme/typography';
import { breakpoints } from 'theme/breakpoints';
import { ODDThemeOptions } from 'theme/interfaces';

const theme = createMuiTheme(({
  palette,
  breakpoints,
  typography,
  shadows,
  overrides,
} as unknown) as ODDThemeOptions);

export default theme;
