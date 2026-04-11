import { Switch, switchClasses } from '@mui/material';
import styled from 'styled-components';

export const StyledSwitch = styled(Switch)(({ theme }) => ({
  [`&.${switchClasses.root}`]: {
    padding: 0,
    alignItems: 'center',
    width: 'auto',
    marginRight: theme.spacing(1),
  },
  [`& .${switchClasses.thumb}`]: {
    width: '14px',
    height: '14px',
    backgroundColor: theme.palette.switch.thumb,
  },
  [`& .${switchClasses.track}`]: {
    width: '34px',
    height: '20px',
    backgroundColor: theme.palette.switch.track,
    borderRadius: '10px',
    opacity: 1,
  },
  [`& .${switchClasses.checked}`]: {
    transform: 'translateX(14px)',
  },
  [`& .${switchClasses.switchBase}`]: {
    padding: 0,
    top: '12px',
    left: '3px',
    '&.Mui-checked + .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: theme.palette.switch.checked,
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.5,
    },
  },
}));
