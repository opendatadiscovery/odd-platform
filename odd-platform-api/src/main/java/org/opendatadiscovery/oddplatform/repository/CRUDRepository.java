package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface CRUDRepository<P> {
    Optional<P> get(final long id);

    List<P> list();

    List<P> list(final String query);

    Page<P> list(final int page, final int size, final String query);

    P create(final P pojo);

    P update(final P pojo);

    List<P> bulkCreate(final Collection<P> pojos);

    List<P> bulkUpdate(final Collection<P> pojos);

    void delete(final long id);

    void delete(final List<Long> id);
}
