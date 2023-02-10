import type { Policy } from 'generated-sources';
import React from 'react';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';

export const useManagementPaths = () => {
  enum ManagementRoutesEnum {
    viewType = ':viewType',
    namespaces = 'namespaces',
    datasources = 'datasources',
    collectors = 'collectors',
    owners = 'owners',
    tags = 'tags',
    labels = 'labels',
    associations = 'associations',
    associationsNew = 'New',
    associationsResolved = 'Resolved',
    roles = 'roles',
    policies = 'policies',
    createPolicy = 'createPolicy',
    policyId = ':policyId',
  }

  const { updatePath } = useIsEmbeddedPath();

  const baseManagementPath = () => updatePath(`/management`);
  const managementPath = (
    viewType: ManagementRoutesEnum = ManagementRoutesEnum.viewType
  ) => `${baseManagementPath()}/${viewType}`;

  const managementOwnerAssociationsPath = (
    associationsViewType: ManagementRoutesEnum = ManagementRoutesEnum.viewType
  ) => `${managementPath(ManagementRoutesEnum.associations)}/${associationsViewType}`;

  const policyDetailsPath = (
    policyId: Policy['id'] | string = ManagementRoutesEnum.policyId
  ) => `${managementPath(ManagementRoutesEnum.policies)}/${policyId}`;

  const createPolicyPath = () =>
    `${managementPath(ManagementRoutesEnum.policies)}/${
      ManagementRoutesEnum.createPolicy
    }`;

  return React.useMemo(
    () => ({
      ManagementRoutesEnum,
      baseManagementPath,
      managementPath,
      managementOwnerAssociationsPath,
      policyDetailsPath,
      createPolicyPath,
    }),
    []
  );
};
