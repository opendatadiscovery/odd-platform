import { combineReducers } from '@reduxjs/toolkit';
import policies from './policy.slice';
import loader from './loader.slice';
import namespaces from './namespace.slice';
import dataSources from './datasources.slice';
import dataEntities from './dataentities.slice';
import tags from './tags.slice';
import dataEntitySearch from './dataEntitySearch.slice';
import metaData from './metadata.slice';
import owners from './owners.slice';
import datasetStructure from './datasetStructure.slice';
import dataEntityLineage from './dataEntityLineage/dataEntityLineage.slice';
import profile from './profile.slice';
import dataQualityTest from './dataQualityTest.slice';
import alerts from './alerts.slice';
import dataEntityGroupLinkedList from './dataEntityGroupLinkedList.slice';
import termLinkedList from './termLinkedList.slice';
import appInfo from './appInfo.slice';
import collectors from './collectors.slice';
import terms from './terms.slice';
import termSearch from './termSearch.slice';
import activities from './activity.slice';
import dataEntityRuns from './dataEntityRuns.slice';
import dataCollaboration from './dataCollaboration.slice';
import roles from './roles.slice';

export default combineReducers({
  namespaces,
  dataSources,
  dataEntities,
  dataEntitySearch,
  loader,
  tags,
  metaData,
  owners,
  datasetStructure,
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
  dataEntityRuns,
  activities,
  roles,
  policies,
  dataCollaboration,
});
