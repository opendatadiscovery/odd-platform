import React, { useCallback } from 'react';
import { Container, Section } from 'components/shared/styled-components';
import { Box, Typography } from '@mui/material';
import { NumberFormatted, SearchInput } from 'components/shared/elements';
import { useSearchParams } from 'react-router-dom';
import { useSearchRelationships } from '../../lib/hooks/api/dataModelling/relatioships';

const Relationships = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const { data, isLoading } = useSearchRelationships({
    query: q,
    size: 30,
    type: 'ALL',
  });

  const handleSearch = useCallback(
    (v?: string) => setSearchParams({ ...searchParams, q: v }),
    [searchParams, setSearchParams]
  );

  return (
    <Container $flexDirection='column'>
      <Section $flexDirection='column'>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h1'>Relationships</Typography>
          <Typography variant='subtitle1' color='texts.info'>
            <NumberFormatted value={0} /> relationships overall
          </Typography>
        </Box>
        <Box>
          <SearchInput
            id='relationships-search'
            placeholder='Search relationships'
            onSearch={handleSearch}
            isLoading={isLoading}
            value={q}
          />
        </Box>
      </Section>
    </Container>
  );
};

export default Relationships;
