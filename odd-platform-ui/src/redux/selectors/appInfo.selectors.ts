import { createSelector } from '@reduxjs/toolkit';
import type { AppInfoState, RootState } from 'redux/interfaces';
import { emptyArr } from 'lib/constants';

const appInfoState = ({ appInfo }: RootState): AppInfoState => appInfo;

export const getActiveFeatures = createSelector(
  appInfoState,
  appInfo => appInfo.activeFeatures || emptyArr
);
