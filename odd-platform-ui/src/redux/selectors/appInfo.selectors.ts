import { createSelector } from 'reselect';
import { AppInfoState, RootState } from 'redux/interfaces';

const appInfoState = ({ appInfo }: RootState): AppInfoState => appInfo;

export const getVersion = createSelector(
  appInfoState,
  appInfo => appInfo.appInfo?.projectVersion
);
