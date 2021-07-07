export const searchPath = (searchId?: string) =>
  `/search${searchId ? `/${searchId}` : ''}`;

export const dataSourcesPath = () => '/datasources';

export const tagsPath = () => '/tags';

export const dataEntityDetailsPath = (entityId: number) =>
  `/dataentities/${entityId}`;

export const dataEntityMetadataPath = (entityId: number) =>
  `${dataEntityDetailsPath(entityId)}/metadata`;

export const dataEntityOverviewPath = (datasetId: number) =>
  `${dataEntityDetailsPath(datasetId)}/overview`;

export const dataEntityLineagePath = (datasetId: number) =>
  `${dataEntityDetailsPath(datasetId)}/lineage`;

// Entity type specific paths
export const datasetStructurePath = (
  datasetId: number,
  versionId?: number
) =>
  `${dataEntityDetailsPath(datasetId)}/structure${
    versionId ? `/${versionId}` : ''
  }`;
