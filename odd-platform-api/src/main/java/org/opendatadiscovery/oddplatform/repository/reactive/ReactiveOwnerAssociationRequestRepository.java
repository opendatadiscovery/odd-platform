package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Mono;

public interface ReactiveOwnerAssociationRequestRepository extends ReactiveCRUDRepository<OwnerAssociationRequestPojo> {

    Mono<OwnerAssociationRequestDto> getDto(final long id);

    Mono<Page<OwnerAssociationRequestDto>> getDtoList(final int page,
                                                      final int size,
                                                      final String query,
                                                      final Boolean active);

    Mono<OwnerAssociationRequestDto> getLastRequestForUsername(final String username);
}
