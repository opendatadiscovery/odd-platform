import { generatePath } from 'react-router-dom';

const BASE_PATH = 'management';
export const ManagementRoutes = {
  BASE_PATH,
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

export const IntegrationsRoutes = {
  ID: ':integrationId',
  OVERVIEW: 'overview',
  CONFIGURE: 'configure',
} as const;

export function integrationsPath(integrationId: string, path?: string) {
  if (!path)
    return generatePath(
      `${managementPath(ManagementRoutes.INTEGRATIONS)}/${IntegrationsRoutes.ID}`,
      { integrationId }
    );
  return generatePath(
    `${managementPath(ManagementRoutes.INTEGRATIONS)}/${IntegrationsRoutes.ID}/${path}`,
    { integrationId }
  );
}

export const PoliciesRoutes = {
  ID: ':policyId',
  CREATE_POLICY: 'createPolicy',
} as const;

export function policyPath(policyId: string) {
  return generatePath(`${managementPath(ManagementRoutes.POLICIES)}/${policyId}`);
}
