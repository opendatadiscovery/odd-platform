import type { AppInfoState, RootState } from 'redux/interfaces';
import { createSelector } from '@reduxjs/toolkit';

const appInfoState = ({ appInfo }: RootState): AppInfoState => appInfo;

export const getVersion = createSelector(
  appInfoState,
  appInfo => appInfo.appInfo?.projectVersion
);
