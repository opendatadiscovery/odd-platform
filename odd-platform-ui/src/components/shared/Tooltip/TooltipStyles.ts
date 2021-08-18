import { createStyles, Theme, WithStyles } from '@material-ui/core';

export const styles = (theme: Theme) =>
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
        color: '#42526E',
        maxWidth: '320px',
        borderRadius: '4px',
        padding: theme.spacing(1),
        border: '1px solid #EBECF0',
        backgroundColor: '#FFFFFF',
      },
      '& .__react_component_tooltip.type-dark': {
        color: '#EBECF0',
        maxWidth: '320px',
        borderRadius: '4px',
        padding: theme.spacing(0.25, 0.5),
        backgroundColor: '#253858',
      },
    },
    childrenContainer: {},
    cursor: { cursor: 'pointer' },
  });

export type StylesType = WithStyles<typeof styles>;
