package org.opendatadiscovery.oddplatform.repository.reactive;

import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusParam;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveOwnerAssociationRequestRepository extends ReactiveCRUDRepository<OwnerAssociationRequestPojo> {

    Mono<OwnerAssociationRequestDto> getDto(final long id);

    Mono<Page<OwnerAssociationRequestDto>> getDtoList(final int page,
                                                      final int size,
                                                      final String query,
                                                      final OwnerAssociationRequestStatusParam status);

    Mono<OwnerAssociationRequestDto> getLastRequestForUsername(final String username);

    Flux<OwnerAssociationRequestPojo> cancelAssociationByOwnerId(final long id, final String updateBy);

    Flux<OwnerAssociationRequestPojo> cancelAssociationByUsername(final String username, final String updateBy);

    Flux<OwnerAssociationRequestPojo> cancelCollisionAssociationById(final OwnerAssociationRequestPojo pojo);
}
