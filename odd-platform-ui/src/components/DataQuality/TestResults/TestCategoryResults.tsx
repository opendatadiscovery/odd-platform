import { Typography } from '@mui/material';
import React, { useMemo } from 'react';
import type { DataQualityCategoryResults } from 'generated-sources';
import { DataEntityRunStatus } from 'generated-sources';
import * as S from './TestCategoryResults.styles';

interface TestCategoryResultsProps {
  categoryResults: DataQualityCategoryResults;
}

const TestCategoryResults = ({ categoryResults }: TestCategoryResultsProps) => {
  const { category, results } = categoryResults;

  const total = useMemo(
    () => results.reduce((acc, { count }) => acc + count, 0),
    [results]
  );

  const sortedResults = useMemo(
    () =>
      Object.values(DataEntityRunStatus)
        .map(status => results.find(result => result.status === status))
        .flatMap(f => (f ? [f] : [])),
    [results]
  );

  return (
    <S.TestCategoryResultsWrapper key={category}>
      <Typography variant='title' component='h4' align='center'>
        {category}
      </Typography>
      <S.TestCategoryResults>
        <Typography variant='h1' align='center'>
          {total}
        </Typography>
        {sortedResults.map(({ status, count }) => (
          <S.TestCategoryResultsItem key={status} $status={status}>
            <Typography color='inherit' variant='title'>
              {count > 0 ? count : '\u2013'}
            </Typography>
          </S.TestCategoryResultsItem>
        ))}
      </S.TestCategoryResults>
    </S.TestCategoryResultsWrapper>
  );
};

export default TestCategoryResults;
