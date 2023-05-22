import React, { type HTMLAttributes } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  type Theme,
  Typography,
} from '@mui/material';
import { type MessageChannel } from 'generated-sources';
import {
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchDataEntityChannels } from 'redux/thunks';
import { type SxProps } from '@mui/system';
import Input from 'components/shared/elements/Input/Input';

interface DataEntityChannelsAutocompleteProps {
  dataEntityId: number;
  handleSetChannelId: (id: string | undefined) => void;
  sx?: SxProps<Theme>;
}

const DataEntityChannelsAutocomplete: React.FC<DataEntityChannelsAutocompleteProps> = ({
  dataEntityId,
  sx,
  handleSetChannelId,
}) => {
  const dispatch = useAppDispatch();
  const searchChannels = fetchDataEntityChannels;

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
      dispatch(searchChannels({ dataEntityId, channelName }))
        .unwrap()
        .then(items => {
          setChannelsLoading(false);
          setChannelsOptions(items);
        });
    }, 500),
    [searchChannels, setChannelsLoading, setChannelsOptions, dataEntityId, channelName]
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

  const onAutocompleteChange = (
    _: React.SyntheticEvent,
    data: ChannelFilterOption | null
  ): void => {
    handleSetChannelId(data ? data.channelId : undefined);
  };

  const handleOpen = () => setAutocompleteOpen(true);
  const handleClose = () => setAutocompleteOpen(false);

  const isOptionEqualToValue = (
    option: ChannelFilterOption,
    value: ChannelFilterOption
  ) => option.name === value.name;

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <Input
      sx={{ mt: 1.5 }}
      variant='main-m'
      inputContainerRef={params.InputProps.ref}
      inputProps={params.inputProps}
      label='Channels'
      placeholder='Search channel...'
      isLoading={channelsLoading}
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

export default DataEntityChannelsAutocomplete;
