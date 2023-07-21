import React, { cloneElement, type FC, useCallback, useState } from 'react';
import { useAppDateTime, useAppParams, useUpdateDataEntityStatus } from 'lib/hooks';
import { Controller, useForm } from 'react-hook-form';
import { Box, Typography } from '@mui/material';
import type { DataEntityStatusEnum } from 'generated-sources';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import Button from 'components/shared/elements/Button/Button';
import AppDateTimePicker from 'components/shared/elements/AppDateTimePicker/AppDateTimePicker';
import { updateEntityStatus } from 'redux/slices/dataentities.slice';
import { useAppDispatch } from 'redux/lib/hooks';
import Option from './Option/Option';

interface StatusSettingsFormProps {
  openBtnEl: JSX.Element;
  status: DataEntityStatusEnum;
  handleMenuClose?: () => void;
}

interface FormData {
  switchTime: Date | string;
}

const StatusSettingsForm: FC<StatusSettingsFormProps> = ({
  openBtnEl,
  status,
  handleMenuClose,
}) => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const { add, entityStatusFormattedDateTime } = useAppDateTime();
  const {
    mutateAsync: updateStatus,
    isLoading: isStatusUpdating,
    isSuccess: isStatusUpdated,
  } = useUpdateDataEntityStatus();

  const settingsMap = {
    '1 day': add(new Date(), { days: 1 }),
    '3 days': add(new Date(), { days: 3 }),
    '1 week': add(new Date(), { weeks: 1 }),
    '2 weeks': add(new Date(), { weeks: 2 }),
    '1 month': add(new Date(), { months: 1 }),
  };

  type SelectedOption = keyof typeof settingsMap;

  const formId = 'entity-status-settings-form';
  const [selectedOption, setSelectedOption] = useState<SelectedOption | ''>('1 day');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { handleSubmit, control, reset, setValue } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { switchTime: '1 day' },
  });

  const clearState = useCallback(() => {
    reset();
    setSelectedDate(null);
    setSelectedOption('1 day');
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    const statusSwitchTime =
      typeof data.switchTime === 'string'
        ? settingsMap[data.switchTime as SelectedOption]
        : data.switchTime;

    const params = { dataEntityId, dataEntityStatus: { status, statusSwitchTime } };
    const updatedStatus = await updateStatus(params);
    dispatch(updateEntityStatus({ dataEntityId, status: updatedStatus }));
    handleMenuClose?.();
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedOption('');
      setSelectedDate(date);
      setValue('switchTime', date);
    }
  };

  const handleOptionClick = (option: string) => {
    setSelectedDate(null);
    setSelectedOption(option as SelectedOption);
    setValue('switchTime', option);
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Entity status settings
    </Typography>
  );

  const formContent = () => (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='body1' color='texts.info'>
        Change to status “Deleted” after
      </Typography>
      <Controller
        name='switchTime'
        control={control}
        render={() => (
          <Box sx={{ mt: 1 }}>
            {Object.keys(settingsMap).map(option => (
              <Option
                key={option}
                value={option}
                selected={option === selectedOption}
                onClick={() => handleOptionClick(option)}
              />
            ))}
          </Box>
        )}
      />
      <Typography variant='body1' color='texts.info' my={1.5}>
        or choose exact time
      </Typography>
      <Controller
        name='switchTime'
        control={control}
        render={() => (
          <AppDateTimePicker
            value={selectedDate}
            minDateTime={new Date()}
            onChange={handleDateChange}
          />
        )}
      />
      <Box sx={{ mt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant='subtitle2' mt={1.5}>
          {`On ${entityStatusFormattedDateTime(
            selectedDate?.getTime() ??
              settingsMap[selectedOption as SelectedOption].getTime()
          )}, entity will move to Deleted status`}
        </Typography>
      </Box>
    </form>
  );

  const formActionButtons = () => (
    <Button text='Apply' buttonType='main-lg' type='submit' form={formId} fullWidth />
  );

  return (
    <DialogWrapper
      maxWidth='sm'
      renderOpenBtn={({ handleOpen }) => cloneElement(openBtnEl, { onClick: handleOpen })}
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isStatusUpdated}
      isLoading={isStatusUpdating}
      clearState={clearState}
    />
  );
};

export default StatusSettingsForm;
