export const dateTimePaperPropsStyles = {
  sx: {
    '.MuiCalendarOrClockPicker-root': { width: '290px' },
    '.MuiClockPicker-root': { width: '290px' },
    '.MuiCalendarOrClockPicker-root > div': { width: '290px' },
    '.MuiCalendarPicker-root': { width: '250px' },
    '.MuiPickersCalendarHeader-root': {
      display: 'flex',
      alignItems: 'center',
      justifyItems: 'center',
    },
    '.MuiClockPicker-arrowSwitcher': { width: '220px', left: '34px' },
    '.MuiPickersArrowSwitcher-root': { display: 'inline-flex' },
    '.MuiPickersCalendarHeader-label': { textAlign: 'center' },
    '.MuiPickersArrowSwitcher-spacer': { width: '160px' },
    '.MuiPickersCalendarHeader-switchViewButton': { display: 'none' },
    '.MuiPickersCalendarHeader-labelContainer .MuiPickersFadeTransitionGroup-root': {
      width: '150px',
      position: 'absolute',
      marginLeft: 'auto',
      marginRight: 'auto',
      left: '-2px',
      right: 0,
      textAlign: 'center',
    },
    '.css-9reuh9-MuiPickersArrowSwitcher-root': { marginLeft: '-8px' },
    '.MuiPickersArrowSwitcher-button': { padding: '12px', color: 'black' },
    '.MuiDayPicker-weekDayLabel': {
      padding: '4px 5.5px',
      height: 'auto',
      color: '#7A869A',
      fontWeight: 400,
      fontSize: '12px',
      lineHeight: '16px',
    },
    '.MuiPickersDay-root': {
      width: '32px',
      height: '32px',
      color: 'black',
      fontWeight: 400,
      fontSize: '14px',
      lineHeight: '20px',

      '&:hover': { backgroundColor: '#B3D1FF' },
    },
    '.css-b0ubwu-MuiButtonBase-root-MuiPickersDay-root.Mui-selected': {
      color: 'white',
      backgroundColor: '#0A58FF',
      border: 'none',
    },
    '.Mui-selected': {
      color: 'white',
      backgroundColor: '#0A58FF',
      border: 'none',
    },
    '.Mui-disabled': { color: '#A8B0BD' },
    '.MuiClock-clock': { backgroundColor: 'white' },
    '.MuiClock-squareMask': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      height: '100%',
      width: '100%',
      borderRadius: '50%',
      background:
        'radial-gradient(ellipse at center, rgba(255, 255, 255, 1) 47%, rgba(229, 238, 255, 1) 40%)',
    },
    '.MuiClock-pin': { display: 'none' },
    '.MuiClockPointer-root': { display: 'none' },
  },
};
