import type { ConfigurationParameters } from 'generated-sources';
import {
  ActivityApi,
  AlertApi,
  AppInfoApi,
  CollectorApi,
  Configuration,
  DataCollaborationApi,
  DataEntityApi,
  DataEntityRunApi,
  DataEntityAttachmentApi,
  DataQualityApi,
  DataSetApi,
  DatasetFieldApi,
  DataSourceApi,
  FeatureApi,
  IdentityApi,
  LinksApi,
  MetadataApi,
  NamespaceApi,
  OwnerApi,
  OwnerAssociationRequestApi,
  PermissionApi,
  PolicyApi,
  RoleApi,
  SearchApi,
  TagApi,
  TermApi,
  TitleApi,
  IntegrationApi,
  DirectoryApi,
  DataQualityRunsApi,
  QueryExampleApi,
  ReferenceDataApi,
  RelationshipApi,
} from 'generated-sources';

const HEADERS: ConfigurationParameters = {
  headers: { 'Content-Type': 'application/json' },
};

const BASE_PARAMS: ConfigurationParameters = {
  basePath: import.meta.env.VITE_API_URL || '',
  credentials: 'same-origin',
};

const apiConf = new Configuration({ ...BASE_PARAMS, ...HEADERS });
const fileUploadConf = new Configuration({ ...BASE_PARAMS });

export const activityApi = new ActivityApi(apiConf);
export const alertApi = new AlertApi(apiConf);
export const dataEntityApi = new DataEntityApi(apiConf);
export const appInfoApi = new AppInfoApi(apiConf);
export const featureApi = new FeatureApi(apiConf);
export const linksApi = new LinksApi(apiConf);
export const collectorApi = new CollectorApi(apiConf);
export const dataCollaborationApi = new DataCollaborationApi(apiConf);
export const searchApi = new SearchApi(apiConf);
export const dataEntityRunApi = new DataEntityRunApi(apiConf);
export const dataQualityApi = new DataQualityApi(apiConf);
export const datasetApiClient = new DataSetApi(apiConf);
export const datasetFieldApiClient = new DatasetFieldApi(apiConf);
export const dataSourceApi = new DataSourceApi(apiConf);
export const metadataApi = new MetadataApi(apiConf);
export const namespaceApi = new NamespaceApi(apiConf);
export const ownerAssociationRequestApi = new OwnerAssociationRequestApi(apiConf);
export const ownerApi = new OwnerApi(apiConf);
export const titleApi = new TitleApi(apiConf);
export const termApi = new TermApi(apiConf);
export const permissionApi = new PermissionApi(apiConf);
export const policyApi = new PolicyApi(apiConf);
export const identityApi = new IdentityApi(apiConf);
export const roleApi = new RoleApi(apiConf);
export const tagApi = new TagApi(apiConf);
export const integrationApi = new IntegrationApi(apiConf);
export const dataEntityAttachmentApi = new DataEntityAttachmentApi(apiConf);
export const dataEntityFileUploadApi = new DataEntityAttachmentApi(fileUploadConf);
export const directoryApi = new DirectoryApi(apiConf);
export const dataQualityRunsApi = new DataQualityRunsApi(apiConf);
export const queryExampleApi = new QueryExampleApi(apiConf);
export const referenceDataApi = new ReferenceDataApi(apiConf);
export const relationshipApi = new RelationshipApi(apiConf);
