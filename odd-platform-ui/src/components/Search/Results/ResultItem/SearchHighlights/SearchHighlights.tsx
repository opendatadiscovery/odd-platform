import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntitySearchHighlights,
  getDataEntitySearchHighlightsFetchingStatuses,
  getSearchId,
} from 'redux/selectors';
import { fetchDataEntitySearchHighlights } from 'redux/thunks';
import { Grid, Typography } from '@mui/material';
import parse from 'html-react-parser';
import { AppCircularProgress, LabeledInfoItem } from 'components/shared';
import type { SearchHighlightsTitlesKey } from 'lib/constants';
import { searchHighlightsTitlesMap } from 'lib/constants';
import * as S from './SearchHighlightsStyles';

interface SearchHighlightsProps {
  dataEntityId: number;
}
const SearchHighlights: React.FC<SearchHighlightsProps> = ({ dataEntityId }) => {
  const dispatch = useAppDispatch();

  const highlights = useAppSelector(getDataEntitySearchHighlights(dataEntityId));
  const searchId = useAppSelector(getSearchId);
  const { isLoading: isHighlightsFetching } = useAppSelector(
    getDataEntitySearchHighlightsFetchingStatuses
  );

  React.useEffect(() => {
    if (!highlights)
      dispatch(fetchDataEntitySearchHighlights({ dataEntityId, searchId }));
  }, []);

  if (isHighlightsFetching)
    return (
      <S.Container container>
        <Grid container justifyContent='center'>
          <AppCircularProgress
            background='transparent'
            progressBackground='dark'
            size={50}
          />
        </Grid>
      </S.Container>
    );

  return highlights ? (
    <S.Container container>
      {highlights?.dataEntity && (
        <Grid container flexDirection='column'>
          <Typography variant='h4'>Data Entity</Typography>
          {Object.entries(highlights.dataEntity).map(([key, val]) => (
            <LabeledInfoItem
              inline
              label={searchHighlightsTitlesMap.get(key as SearchHighlightsTitlesKey)}
              labelWidth={3}
            >
              <S.HighlightText variant='body1'> {parse(val)}</S.HighlightText>
            </LabeledInfoItem>
          ))}
        </Grid>
      )}
    </S.Container>
  ) : null;
};

export default SearchHighlights;
