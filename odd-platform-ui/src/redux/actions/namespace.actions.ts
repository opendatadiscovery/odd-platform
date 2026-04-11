import { createActionType } from 'redux/lib/helpers';

export const namespaceActionTypePrefix = 'namespaces';

export const fetchNamespacesActionType = createActionType(
  namespaceActionTypePrefix,
  'fetchNamespaces'
);

export const createNamespaceActionType = createActionType(
  namespaceActionTypePrefix,
  'createNamespace'
);

export const updateNamespaceActionType = createActionType(
  namespaceActionTypePrefix,
  'updateNamespace'
);

export const deleteNamespaceActionType = createActionType(
  namespaceActionTypePrefix,
  'deleteNamespace'
);
