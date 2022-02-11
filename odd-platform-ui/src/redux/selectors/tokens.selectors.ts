import { createSelector } from 'reselect';
import { RootState, TokensState } from 'redux/interfaces';

const tokensState = ({ tokens }: RootState): TokensState => tokens;

export const getTokensList = createSelector(tokensState, tokens =>
  tokens.allIds.map(id => tokens.byId[id])
);
