import React, { HTMLAttributes } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Theme,
  Typography,
} from '@mui/material';
import { MessageChannel, MessageRequest } from 'generated-sources';
import { createFilterOptions, FilterOptionsState } from '@mui/material/useAutocomplete';
import { AppInput } from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchSlackChannels } from 'redux/thunks';
import { SxProps } from '@mui/system';
import { ControllerRenderProps } from 'react-hook-form';

type MessageFormData = Omit<MessageRequest, 'dataEntityId'>;

interface SlackChannelsAutocompleteProps {
  field: ControllerRenderProps<MessageFormData, 'channelId'>;
  sx?: SxProps<Theme>;
}

const SlackChannelsAutocomplete: React.FC<SlackChannelsAutocompleteProps> = ({
  sx,
  field,
}) => {
  const dispatch = useAppDispatch();
  const searchSlackChannels = fetchSlackChannels;

  type ChannelFilterOption = Omit<MessageChannel, 'channelId' | 'name'> &
    Partial<MessageChannel>;
  const [channelsOptions, setChannelsOptions] = React.useState<ChannelFilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [channelsLoading, setChannelsLoading] = React.useState(false);
  const [channelName, setChannelName] = React.useState('');
  const channelsFilter = createFilterOptions<ChannelFilterOption>();

  const handleChannelsSearch = React.useCallback(
    useDebouncedCallback(() => {
      setChannelsLoading(true);
      dispatch(searchSlackChannels({ channelName }))
        .unwrap()
        .then(items => {
          setChannelsLoading(false);
          setChannelsOptions(items);
        });
    }, 500),
    [searchSlackChannels, setChannelsLoading, setChannelsOptions, channelName]
  );

  const onChannelsSearchInputChange = React.useCallback(
    (_: React.ChangeEvent<unknown>, inputQuery: string) => {
      setChannelName(inputQuery);
    },
    [setChannelName]
  );

  React.useEffect(() => {
    setChannelsLoading(autocompleteOpen);
    if (autocompleteOpen) handleChannelsSearch();
  }, [autocompleteOpen, handleChannelsSearch]);

  const getOptionLabel = React.useCallback((option: ChannelFilterOption | string) => {
    if (typeof option === 'string') return option;
    if ('name' in option && option.name) return option.name;
    return '';
  }, []);

  const onAutocompleteChange = (
    _: React.SyntheticEvent,
    data: ChannelFilterOption | null
  ): void => {
    if (!data) return;
    field.onChange(data.channelId);
  };

  const getChannelFilterOptions = (
    filterOptions: ChannelFilterOption[],
    params: FilterOptionsState<ChannelFilterOption>
  ) => {
    const filtered = channelsFilter(filterOptions, params);
    if (
      channelName !== '' &&
      !channelsLoading &&
      !filterOptions.some(option => option.name === channelName)
    ) {
      return [...filtered, { name: channelName }];
    }
    return filtered;
  };

  const handleOpen = () => setAutocompleteOpen(true);
  const handleClose = () => setAutocompleteOpen(false);

  const isOptionEqualToValue = (
    option: ChannelFilterOption,
    value: ChannelFilterOption
  ) => option.name === value.name;

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <AppInput
      {...params}
      ref={params.InputProps.ref}
      label='Channel'
      placeholder='Search by name'
      customEndAdornment={{
        variant: 'loader',
        showAdornment: channelsLoading,
        position: { mr: 4 },
      }}
    />
  );

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    option: ChannelFilterOption
  ) =>
    option.channelId ? (
      <li {...props}>
        <Typography variant='body1'>{option.name}</Typography>
      </li>
    ) : undefined;

  return (
    <Autocomplete
      {...field}
      sx={sx}
      fullWidth
      value={{ name: channelName }}
      open={autocompleteOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={onAutocompleteChange}
      onInputChange={onChannelsSearchInputChange}
      getOptionLabel={getOptionLabel}
      options={channelsOptions}
      filterOptions={getChannelFilterOptions}
      loading={channelsLoading}
      isOptionEqualToValue={isOptionEqualToValue}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      clearIcon={<ClearIcon />}
      renderInput={renderInput}
      renderOption={renderOption}
    />
  );
};

export default SlackChannelsAutocomplete;
