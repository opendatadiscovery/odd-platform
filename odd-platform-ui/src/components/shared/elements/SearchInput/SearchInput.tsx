import React, { useCallback, useEffect, useState } from 'react';
import type { InputProps } from 'components/shared/elements/Input/Input';
import Input from '../Input/Input';

interface SearchInputProps extends Omit<InputProps, 'variant'> {
  value?: string;
  onSearch: (value?: string) => void;
}

const SearchInput = ({
  value,
  onSearch,
  isLoading,
  placeholder,
  id,
}: SearchInputProps) => {
  const [query, setQuery] = useState(value ?? '');

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value);

  const handleSearch = useCallback(() => {
    onSearch(query);
  }, [query]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  return (
    <Input
      variant='search-lg'
      id={id}
      placeholder={placeholder}
      maxWidth={640}
      onKeyDown={handleKeyDown}
      onChange={handleInputChange}
      value={query}
      isLoading={isLoading}
    />
  );
};

export default SearchInput;
