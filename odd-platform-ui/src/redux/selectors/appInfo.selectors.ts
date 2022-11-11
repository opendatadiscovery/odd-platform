import { AppInfoState, RootState } from 'redux/interfaces';
import { createSelector } from '@reduxjs/toolkit';
import { emptyArr } from 'lib/constants';

const appInfoState = ({ appInfo }: RootState): AppInfoState => appInfo;

export const getVersion = createSelector(
  appInfoState,
  appInfo => appInfo.appInfo?.projectVersion
);

export const getActiveFeatures = createSelector(
  appInfoState,
  appInfo => appInfo.activeFeatures || emptyArr
);
