package org.opendatadiscovery.oddplatform.service.activity.handler;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityContextInfo;
import org.opendatadiscovery.oddplatform.dto.activity.OwnershipActivityStateDto;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static reactor.function.TupleUtils.function;

@RequiredArgsConstructor
public abstract class AbstractOwnershipActivityHandler {
    private final ReactiveOwnershipRepository ownershipRepository;

    protected Mono<String> getDataEntityOwnerships(final long dataEntityId) {
        return ownershipRepository.getOwnershipsByDataEntityId(dataEntityId)
            .map(dto -> new OwnershipActivityStateDto(dto.getOwner().getName(), dto.getRole().getName()))
            .collectList()
            .map(this::getState);
    }

    protected Mono<ActivityContextInfo> getContextInfoByOwnership(final long ownershipId) {
        return ownershipRepository.get(ownershipId)
            .flatMapMany(dto -> ownershipRepository.getOwnershipsByDataEntityId(dto.getOwnership().getDataEntityId()))
            .collectList()
            .map(list -> {
                final List<OwnershipActivityStateDto> stateList = list.stream()
                    .map(dto -> new OwnershipActivityStateDto(dto.getOwner().getName(), dto.getRole().getName()))
                    .toList();
                return Tuples.of(getState(stateList), list.get(0).getOwnership().getDataEntityId());
            })
            .map(function((state, dataEntityId) -> ActivityContextInfo.builder()
                .dataEntityId(dataEntityId)
                .oldState(state)
                .build()
            ));
    }

    private String getState(final List<OwnershipActivityStateDto> state) {
        return JSONSerDeUtils.serializeJson(state);
    }
}
