package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface ReadOnlyCRUDMapperWithList<E, EL, P> extends ReadOnlyCRUDMapper<E, P> {
    EL mapPojos(final List<P> pojos);

    EL mapPojos(final Page<P> pojos);

    default List<E> mapPojoList(final List<P> pojos) {
        return pojos.stream().map(this::mapPojo).collect(Collectors.toList());
    }

    default PageInfo pageInfo(final long total) {
        return new PageInfo().total(total).hasNext(false);
    }

    default PageInfo pageInfo(final Page<?> page) {
        return new PageInfo().total(page.getTotal()).hasNext(page.isHasNext());
    }
}
