package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

public interface NamespaceMapper
    extends CRUDMapper<Namespace, NamespaceList, NamespaceFormData, NamespaceUpdateFormData, NamespacePojo> {
}
