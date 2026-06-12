package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusParam;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestActivityDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestActivityPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveOwnerAssociationRequestActivityRepository
    extends ReactiveCRUDRepository<OwnerAssociationRequestActivityPojo> {
    Mono<Page<OwnerAssociationRequestActivityDto>> getDtoList(final Integer page, final Integer size,
                                                              final String query,
                                                              final OwnerAssociationRequestStatusParam status);
}
