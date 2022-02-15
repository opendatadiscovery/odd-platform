package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

public interface NamespaceRepository extends CRUDRepository<NamespacePojo> {
    NamespacePojo createIfNotExists(final NamespacePojo namespacePojo);

    Optional<NamespacePojo> getByName(final String name);
}
