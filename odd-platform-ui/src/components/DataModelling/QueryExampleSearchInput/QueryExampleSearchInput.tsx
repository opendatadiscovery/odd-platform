import { Input } from 'components/shared/elements';
import React from 'react';

const QueryExampleSearchInput = () => (
  <Input
    variant='search-lg'
    id='query-example-search'
    placeholder='Search query examples...'
    maxWidth={640}
  />
);

export default QueryExampleSearchInput;
