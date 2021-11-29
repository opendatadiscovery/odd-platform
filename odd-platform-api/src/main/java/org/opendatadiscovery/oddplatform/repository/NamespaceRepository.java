package org.opendatadiscovery.oddplatform.repository;

import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

public interface NamespaceRepository extends CRUDRepository<NamespacePojo> {
    NamespacePojo createIfNotExists(final NamespacePojo namespacePojo);
}
