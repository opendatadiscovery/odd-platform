import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles({
  informationIconContainer: {
    color: '#A8B0BD',
    '&:hover': {
      color: '#7A869A',
    },
  },
});

const InformationIcon: React.FC<SvgIconProps> = props => {
  const classes = useStyles();
  return (
    <SvgIcon
      viewBox="0 0 16 16"
      {...props}
      className={classes.informationIconContainer}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
        <path
          d="M8 8L8 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="4" r="1" fill="currentColor" />
      </svg>
    </SvgIcon>
  );
};

export default InformationIcon;
