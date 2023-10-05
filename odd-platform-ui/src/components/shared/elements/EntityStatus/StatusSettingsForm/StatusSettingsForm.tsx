import React, { cloneElement, type FC, useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { useAppDateTime, useAppParams, useUpdateDataEntityStatus } from 'lib/hooks';
import type {
  DataEntityStatusEnum,
  DataEntityApiUpdateStatusRequest,
} from 'generated-sources';
import DialogWrapper from 'components/shared/elements/DialogWrapper/DialogWrapper';
import Button from 'components/shared/elements/Button/Button';
import AppDateTimePicker from 'components/shared/elements/AppDateTimePicker/AppDateTimePicker';
import { updateEntityStatus } from 'redux/slices/dataentities.slice';
import { useAppDispatch } from 'redux/lib/hooks';
import Checkbox from 'components/shared/elements/Checkbox/Checkbox';
import DefaultEntityStatus from 'components/shared/elements/EntityStatus/DefaultEntityStatus/DefaultEntityStatus';
import Option from './Option/Option';

interface StatusSettingsFormProps {
  openBtnEl: JSX.Element;
  oldStatus: DataEntityStatusEnum;
  newStatus: DataEntityStatusEnum;
  isPropagatable: boolean;
  isTimeSensitive: boolean;
  handleMenuClose?: () => void;
}

interface FormData {
  switchTime: Date | string;
  propagate: boolean;
}

const StatusSettingsForm: FC<StatusSettingsFormProps> = ({
  openBtnEl,
  oldStatus,
  newStatus,
  handleMenuClose,
  isPropagatable,
  isTimeSensitive,
}) => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const { add } = useAppDateTime();
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
    const switchTime =
      typeof data.switchTime === 'string'
        ? settingsMap[data.switchTime as SelectedOption]
        : data.switchTime;

    const statusSwitchTime =
      newStatus === 'DRAFT' || newStatus === 'DEPRECATED' ? switchTime : undefined;

    const params: DataEntityApiUpdateStatusRequest = {
      dataEntityId,
      dataEntityStatusFormData: {
        status: { status: newStatus, statusSwitchTime },
        propagate: data.propagate,
      },
    };

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
      Status change settings
    </Typography>
  );

  const formContent = () => (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='body1' color='texts.info'>
        You are changing your status from
      </Typography>
      <Box display='flex' flexWrap='nowrap' alignItems='center' mt={0.5}>
        <DefaultEntityStatus entityStatus={{ status: oldStatus }} />
        <Box sx={{ mx: 0.5 }}>&gt;</Box>
        <DefaultEntityStatus entityStatus={{ status: newStatus }} />
      </Box>
      {isTimeSensitive && (
        <>
          <Typography variant='body1' color='texts.info' mt={1.5} mb={0.5}>
            Change to status “Deleted” after
          </Typography>
          <Controller
            name='switchTime'
            control={control}
            render={({ field }) => (
              <AppDateTimePicker
                {...field}
                value={selectedDate}
                minDateTime={new Date()}
                onChange={date => {
                  handleDateChange(date);
                  field.onChange(date);
                }}
              />
            )}
          />
          <Typography variant='body1' color='texts.info' my={1.5}>
            Or select time interval
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
        </>
      )}

      {isPropagatable && (
        <Box
          sx={{
            mt: 1.5,
            borderTop: '1px solid',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Controller
            name='propagate'
            defaultValue={false}
            control={control}
            render={({ field }) => (
              <FormControlLabel
                {...field}
                sx={{ ml: -0.25, my: 1.5 }}
                checked={field.value}
                control={<Checkbox sx={{ mr: 1 }} />}
                label='Propagate status to the whole group'
              />
            )}
          />
        </Box>
      )}
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
