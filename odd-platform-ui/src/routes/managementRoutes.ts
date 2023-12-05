import { generatePath, useParams } from 'react-router-dom';

const BASE_PATH = '/management';
const ManagementRoutes = {
  NAMESPACES: 'namespaces',
  DATASOURCES: 'datasources',
  INTEGRATIONS: 'integrations',
  COLLECTORS: 'collectors',
  OWNERS: 'owners',
  TAGS: 'tags',
  ASSOCIATIONS: 'associations',
  ROLES: 'roles',
  POLICIES: 'policies',
} as const;
type ManagementRoutesType = typeof ManagementRoutes;

export function managementPath(path?: ManagementRoutesType[keyof ManagementRoutesType]) {
  if (!path) return generatePath(BASE_PATH);
  return generatePath(`${BASE_PATH}/${path}`);
}

const AssociationsRoutes = {
  NEW: 'new',
  RESOLVED: 'resolved',
} as const;

type AssociationsRoutesType = typeof AssociationsRoutes;

export function associationsPath(
  path: AssociationsRoutesType[keyof AssociationsRoutesType]
) {
  return generatePath(`${managementPath(ManagementRoutes.ASSOCIATIONS)}/${path}`);
}

const INTEGRATION_ID_PARAM = ':integrationId';
const INTEGRATION_ID = 'integrationId';

interface IntegrationRouteParams {
  [INTEGRATION_ID]: string;
}

export const useIntegrationRouteParams = (): IntegrationRouteParams =>
  useParams<keyof IntegrationRouteParams>() as IntegrationRouteParams;

export function integrationsPath(integrationId: string, path?: string) {
  if (!path)
    return generatePath(
      `${managementPath(ManagementRoutes.INTEGRATIONS)}/${INTEGRATION_ID_PARAM}`,
      { integrationId }
    );
  return generatePath(
    `${managementPath(ManagementRoutes.INTEGRATIONS)}/${INTEGRATION_ID_PARAM}/${path}`,
    { integrationId }
  );
}
