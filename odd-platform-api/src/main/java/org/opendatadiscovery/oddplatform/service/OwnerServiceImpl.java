package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.BooleanUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnerMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnerRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OwnerServiceImpl implements OwnerService {

    private final ReactiveOwnerRepository ownerRepository;
    private final OwnerMapper ownerMapper;
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;
    private final ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    private final ReactiveTermOwnershipRepository termOwnershipRepository;
    private final ReactiveOwnershipRepository ownershipRepository;

    @Override
    public Mono<OwnerPojo> getOrCreate(final String name) {
        return ownerRepository.getByName(name)
            .switchIfEmpty(ownerRepository.create(new OwnerPojo().setName(name)));
    }

    @Override
    public Mono<Owner> get(final long id) {
        return ownerRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Owner with id %d hasn't been found".formatted(id))))
            .map(ownerMapper::mapToOwner);
    }

    @Override
    public Mono<OwnerList> list(final int page, final int size, final String query, final List<Long> ids) {
        return ownerRepository.list(page, size, query, ids).map(ownerMapper::mapToOwnerList);
    }

    @Override
    public Mono<Owner> create(final OwnerFormData createEntityForm) {
        return Mono.just(createEntityForm)
            .map(ownerMapper::mapToPojo)
            .flatMap(ownerRepository::create)
            .map(ownerMapper::mapToOwner);
    }

    @Override
    @ReactiveTransactional
    public Mono<Owner> update(final long id, final OwnerFormData updateEntityForm) {
        return ownerRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Owner with id %d hasn't been found".formatted(id))))
            .map(pojo -> ownerMapper.applyToPojo(updateEntityForm, pojo))
            .flatMap(ownerRepository::update)
            .flatMap(this::updateSearchVectors)
            .map(ownerMapper::mapToOwner);
    }

    @Override
    @ReactiveTransactional
    public Mono<Owner> delete(final long id) {
        return Mono.zip(termOwnershipRepository.existsByOwner(id), ownershipRepository.existsByOwner(id))
            .map(t -> BooleanUtils.toBoolean(t.getT1()) || BooleanUtils.toBoolean(t.getT2()))
            .filter(exists -> !exists)
            .switchIfEmpty(Mono.error(new IllegalStateException(
                "Owner with ID %d cannot be deleted: there are still resources attached".formatted(id))))
            .then(ownerRepository.delete(id))
            .map(ownerMapper::mapToOwner);
    }

    private Mono<OwnerPojo> updateSearchVectors(final OwnerPojo owner) {
        return Mono.zip(
            searchEntrypointRepository.updateChangedOwnerVectors(owner.getId()),
            termSearchEntrypointRepository.updateChangedOwnerVectors(owner.getId())
        ).thenReturn(owner);
    }
}
