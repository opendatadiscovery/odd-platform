import React from 'react';
import { Container, Section } from 'components/shared/styled-components';
import { Box, Typography } from '@mui/material';
import { NumberFormatted, SearchInput } from 'components/shared/elements';

const Relationships = () => {
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
            onSearch={v => console.log('Relationships onSearch', v)}
          />
        </Box>
      </Section>
    </Container>
  );
};

export default Relationships;
