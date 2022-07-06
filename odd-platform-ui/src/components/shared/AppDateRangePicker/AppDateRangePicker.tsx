import React from 'react';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';

// import 'react-date-range/dist/styles.css';
// import 'react-date-range/dist/theme/default.css';
import CalendarIcon from 'components/shared/Icons/CalendarIcon';
import { DateRange } from 'rsuite/esm/DateRangePicker/types';
import 'rsuite/dist/rsuite.min.css';
import * as S from './AppDateRangePickerStyles';

interface AppDateRangePickerProps {
  defaultRange: { beginDate: Date; endDate: Date };
  label: string;
}

const AppDateRangePicker: React.FC<AppDateRangePickerProps> = ({
  defaultRange,
  label,
}) => {
  const defineds = {
    startOf3Days: startOfDay(addDays(new Date(), -2)),
    startOfLast1Week: startOfDay(addDays(new Date(), -6)),
    startOfLast2Week: startOfDay(addDays(new Date(), -13)),
    startOfLastMonth: startOfDay(addDays(new Date(), -30)),
    endOfToday: endOfDay(new Date()),
  };

  const locale = {
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    ok: 'Done',
  };

  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const rsMenuHeader = document.querySelector(
      '.rs-picker-daterange-header'
    ) as HTMLElement;
    const rsMenu = document.querySelector(
      '.rs-picker-menu'
    ) as HTMLElement;
    if (rsMenuHeader) {
      rsMenuHeader.style.display = 'none';
    }
  }, [menuOpen]);

  return (
    <>
      <S.DateRangePickerLabel>{label}</S.DateRangePickerLabel>
      <S.AppDateRangePicker
        format="d MMM yyyy"
        character=" - "
        locale={locale}
        onEnter={() => setMenuOpen(prevState => !prevState)}
        // menuStyle={{ display: 'none' }}
        // defaultValue={[
        //   format(defaultRange.beginDate, 'd MMM y'),
        //   format(defaultRange.endDate, 'd MMM y'),
        // ]}
        size="sm"
        cleanable={false}
        defaultValue={[defaultRange.beginDate, defaultRange.endDate]}
        caretAs={CalendarIcon}
        renderValue={([beginDate, endDate]: DateRange) =>
          `${format(beginDate, 'd MMM')} - ${format(endDate, 'd MMM')}`
        }
      />
    </>
    // <div className="calendarWrap">
    //   <AppTextField
    //     value={`${format(range[0].startDate, 'MM/dd/yyyy')} to ${format(
    //       range[0].endDate,
    //       'MM/dd/yyyy'
    //     )}`}
    //     // readOnly
    //     // className="inputBox"
    //     onClick={() => setOpen(prevState => !prevState)}
    //   />
    //
    //   <div ref={refOne}>
    //     {open && (
    //       <StyledDateRangePicker
    //       // onChange={item => {
    //       //   const { startDate, endDate, key } = item.selection;
    //       //   if (startDate && endDate && key) {
    //       //     setRange([{ startDate, endDate, key }]);
    //       //   }
    //       // }}
    //       // // editableDateInputs
    //       // // moveRangeOnFirstSelection={false}
    //       // ranges={range}
    //       // months={2}
    //       // direction="horizontal"
    //       // // className="calendarElement"
    //       // showDateDisplay={false}
    //       // showMonthAndYearPickers={false}
    //       // inputRanges={[]}
    //       // staticRanges={staticRanges}
    //       // showMonthArrow={false}
    //       // showPreview={false}
    //       />
    //     )}
    //   </div>
    // </div>
  );
};

export default AppDateRangePicker;
