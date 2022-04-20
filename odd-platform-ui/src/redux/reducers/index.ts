import { combineReducers } from 'redux';
import { RootState } from 'redux/interfaces';
import loader from './loader-reducer';
import namespaces from './namespace.reducer';
import dataSources from './datasources.reducer';
import dataEntities from './dataentities.reducer';
import tags from './tags.reducer';
import labels from './labels.reducer';
import search from './dataentitiesSearch.reducer';
import metaData from './metadata.reducer';
import owners from './owners.reducer';
import datasetStructure from './datasetStructure.reducer';
import dataEntityLineage from './dataentityLineage.reducer';
import profile from './profile.reducer';
import dataQualityTest from './dataQualityTest.reducer';
import alerts from './alerts.reducer';
import dataEntityGroupLinkedList from './dataentityLinkedList.reducer';
import appInfo from './appInfo.reducer';
import collectors from './collectors.reducer';
import terms from './terms.reducer';
import termSearch from './termSearch.reducer';
import termDetails from './termDetails.reducer';

export default combineReducers<RootState>({
  namespaces,
  dataSources,
  dataEntities,
  search,
  loader,
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
  terms,
  termSearch,
  termDetails,
});
