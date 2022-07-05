import { combineReducers } from '@reduxjs/toolkit';
import legacyLoader from './loader-reducer';
import loader from './loader.slice';
import namespaces from './namespace.slice';
import dataSources from './datasources.slice';
import dataEntities from './dataentities.slice';
import tags from './tags.slice';
import labels from './labels.slice';
import search from './dataentitiesSearch.reducer';
import searchSlice from './dataEntitySearch.slice';
import metaData from './metadata.slice';
import owners from './owners.slice';
import datasetStructure from './datasetStructure.reducer';
import dataEntityLineage from './dataEntityLineage/dataEntityLineage.slice';
import profile from './profile.reducer';
import dataQualityTest from './dataQualityTest.reducer';
import alerts from './alerts.slice';
import dataEntityGroupLinkedList from './dataEntityGroupLinkedList.slice';
import termLinkedList from './termLinkedList.slice';
import appInfo from './appInfo.reducer';
import collectors from './collectors.slice';
import terms from './terms.slice';
import termSearch from './termSearch.reducer';
import activities from './activity.slice';

export default combineReducers({
  namespaces,
  dataSources,
  dataEntities,
  search,
  searchSlice,
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
  termLinkedList,
  appInfo,
  collectors,
  terms,
  termSearch,
  activities,
});
