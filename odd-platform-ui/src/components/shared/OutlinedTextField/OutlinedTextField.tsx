import React from 'react';
import TextField from '@mui/material/TextField';
import { TextFieldProps } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { styles, StylesType } from './OutlinedTextFieldStyles';

interface OutlinedTextFieldProps
  extends StylesType,
    Omit<TextFieldProps, 'classes'> {}

const OutlinedTextField: React.FC<OutlinedTextFieldProps> = React.forwardRef(
  ({ classes, ...props }, ref) => (
    <TextField
      {...props}
      InputLabelProps={{ shrink: true }}
      fullWidth
      variant="outlined"
      className={classes.container}
      ref={ref}
    />
  )
);

export default withStyles(styles)(OutlinedTextField);
