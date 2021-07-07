import React from 'react';
import { withStyles, IconButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { styles, StylesType } from './AddButtonStyles';

interface AddButtonProps extends StylesType {
  onClick: () => void;
}

const AddButton: React.FC<AddButtonProps> = ({ classes, onClick }) => (
  <IconButton
    className={classes.container}
    onClick={onClick}
    disableRipple
  >
    <AddCircleOutlineIcon className={classes.icon} />
  </IconButton>
);

export default withStyles(styles)(AddButton);
