package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestActivityList;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatusParam;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestActivityType;
import org.opendatadiscovery.oddplatform.mapper.OwnerAssociationRequestActivityMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestActivityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerAssociationRequestActivityRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OwnerAssociationRequestActivityServiceImpl implements OwnerAssociationRequestActivityService {
    private final ReactiveOwnerAssociationRequestActivityRepository activityRepository;
    private final OwnerAssociationRequestActivityMapper mapper;

    @Override
    public Mono<OwnerAssociationRequestActivityList>
        getOwnerAssociationRequestList(final Integer page,
                                       final Integer size,
                                       final String query,
                                       final OwnerAssociationRequestStatusParam status) {
        return activityRepository.getDtoList(page, size, query, status)
            .map(mapper::mapPage);
    }

    @Override
    public Mono<OwnerAssociationRequestActivityPojo> createOwnerAssociationRequestActivity(
        final OwnerAssociationRequestPojo pojo,
        final String updateBy,
        final OwnerAssociationRequestActivityType eventType) {
        return activityRepository.create(mapper.mapToPojo(pojo, updateBy, eventType.name()));
    }
}
