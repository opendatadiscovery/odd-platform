package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;

public interface NamespaceService
    extends CRUDService<Namespace, NamespaceList, NamespaceFormData, NamespaceUpdateFormData> {
}
