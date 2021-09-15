import { createStyles, WithStyles } from '@material-ui/core';
import { ODDTheme } from 'theme/interfaces';

export const styles = (theme: ODDTheme) =>
  createStyles({
    container: {
      margin: 'auto 0',
      '& .__react_component_tooltip:after, .__react_component_tooltip:before': {
        content: 'none',
      },
      '& .__react_component_tooltip.show': {
        opacity: 1,
      },
      '& .__react_component_tooltip': {
        maxWidth: '320px',
        borderRadius: '4px',
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.body2.fontWeight,
        lineHeight: theme.typography.body2.lineHeight,
      },
      '& .__react_component_tooltip.type-light': {
        color: theme.palette.text.info,
        maxWidth: '320px',
        borderRadius: '4px',
        padding: theme.spacing(1),
        border: '1px solid',
        borderColor: theme.palette.divider,
        backgroundColor: theme.palette.background.default,
      },
      '& .__react_component_tooltip.type-dark': {
        color: theme.palette.divider,
        maxWidth: '320px',
        borderRadius: '4px',
        padding: theme.spacing(0.25, 0.5),
        backgroundColor: theme.palette.info.dark,
      },
    },
    childrenContainer: {},
    cursor: { cursor: 'pointer' },
  });

export type StylesType = WithStyles<typeof styles>;
