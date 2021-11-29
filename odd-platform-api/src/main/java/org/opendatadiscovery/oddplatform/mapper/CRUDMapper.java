package org.opendatadiscovery.oddplatform.mapper;

public interface CRUDMapper<E, EL, CEF, UEF, P> extends ReadOnlyCRUDMapperWithList<E, EL, P> {
    P mapForm(final CEF form);

    P applyForm(final P pojo, UEF form);
}
