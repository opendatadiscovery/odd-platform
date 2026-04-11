package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestActivityList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusParam;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestActivityType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import reactor.core.publisher.Mono;

public interface OwnerAssociationRequestActivityService {
    Mono<OwnerAssociationRequestActivityList>
        getOwnerAssociationRequestList(final Integer page,
                                       final Integer size,
                                       final String query,
                                       final OwnerAssociationRequestStatusParam status);

    Mono<OwnerAssociationRequestActivityPojo>
        createOwnerAssociationRequestActivity(final OwnerAssociationRequestPojo pojo,
                                              final String updateBy,
                                              final OwnerAssociationRequestActivityType eventType);
}
