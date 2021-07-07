import React from 'react';
import { withStyles, IconButton } from '@material-ui/core';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { styles, StylesType } from './DeleteButtonStyles';

interface DeleteButtonProps extends StylesType {
  onClick: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  classes,
  onClick,
}) => (
  <IconButton className={classes.container} onClick={onClick}>
    <DeleteOutlinedIcon className={classes.icon} />
  </IconButton>
);

export default withStyles(styles)(DeleteButton);
