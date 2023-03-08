import type { Policy } from 'generated-sources';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { ManagementRoutes } from './shared';

export const useManagementPaths = () => {
  const { updatePath } = useIsEmbeddedPath();

  const baseManagementPath = () => updatePath(`/${ManagementRoutes.management}`);
  const managementPath = (
    viewType: ManagementRoutes = ManagementRoutes.managementViewType
  ) => `${baseManagementPath()}/${viewType}`;

  const managementOwnerAssociationsPath = (
    associationsViewType: ManagementRoutes = ManagementRoutes.associationsViewType
  ) => `${managementPath(ManagementRoutes.associations)}/${associationsViewType}`;

  const policyDetailsPath = (
    policyId: Policy['id'] | string = ManagementRoutes.policyId
  ) => `${managementPath(ManagementRoutes.policies)}/${policyId}`;

  const createPolicyPath = () =>
    `${managementPath(ManagementRoutes.policies)}/${ManagementRoutes.createPolicy}`;

  return {
    baseManagementPath,
    managementPath,
    managementOwnerAssociationsPath,
    policyDetailsPath,
    createPolicyPath,
  };
};
