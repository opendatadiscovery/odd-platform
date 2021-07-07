import React from 'react';
import TextField from '@material-ui/core/TextField';
import { TextFieldProps, withStyles } from '@material-ui/core';
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
