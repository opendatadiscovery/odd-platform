import { combineReducers } from 'redux';
import { RootState } from 'redux/interfaces';
import loader from './loader-reducer';
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

export default combineReducers<RootState>({
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
});
