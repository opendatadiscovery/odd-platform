import { combineReducers } from '@reduxjs/toolkit';
import legacyLoader from './loader-reducer';
import loader from './loader.slice';
import namespaces from './namespace.reducer';
import dataSources from './datasources.reducer';
import dataEntities from './dataentities.slice';
import tags from './tags.reducer';
import labels from './labels.reducer';
import search from './dataentitiesSearch.reducer';
import metaData from './metadata.slice';
import owners from './owners.slice';
import datasetStructure from './datasetStructure.reducer';
import dataEntityLineage from './dataentityLineage.reducer';
import profile from './profile.reducer';
import dataQualityTest from './dataQualityTest.reducer';
import alerts from './alerts.reducer';
import dataEntityGroupLinkedList from './dataEntityGroupLinkedList.slice';
import appInfo from './appInfo.reducer';
import collectors from './collectors.reducer';

export default combineReducers({
  namespaces,
  dataSources,
  dataEntities,
  search,
  loader,
  legacyLoader,
  tags,
  metaData,
  owners,
  datasetStructure,
  labels,
  dataEntityLineage,
  profile,
  dataQualityTest,
  alerts,
  dataEntityGroupLinkedList,
  appInfo,
  collectors,
});
