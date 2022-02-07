import { Autocomplete, autocompleteClasses } from '@mui/material';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Container = styled('div')(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  width: '100%',
  maxWidth: '640px',
}));

export const Search = styled('div')(({ theme }) => ({
  width: '100%',
}));

export const SuggestionItem = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
}));

export const SearchAutocomplete = styled(Autocomplete)(({ theme }) => ({
  color: theme.palette.common.black,
  width: '100%',
  boxSizing: 'border-box',
  [`& .${autocompleteClasses.endAdornment}`]: {
    right: '5px',
    top: 'auto',
  },
}));
