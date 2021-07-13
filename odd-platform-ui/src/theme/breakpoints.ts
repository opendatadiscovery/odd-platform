import createBreakpoints, {
  BreakpointsOptions,
} from '@material-ui/core/styles/createBreakpoints';

const customBreakpointValues: BreakpointsOptions = {
  values: {
    xs: 480,
    sm: 600,
    md: 960,
    lg: 1201,
    xl: 1920,
  },
};

export const breakpoints = createBreakpoints({
  ...customBreakpointValues,
});
