package org.opendatadiscovery.oddplatform.service.term;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Ownership;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.OwnershipMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermOwnershipPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermOwnershipRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.OwnerService;
import org.opendatadiscovery.oddplatform.service.TitleService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class TermOwnershipServiceImpl implements TermOwnershipService {

    private final ReactiveTermOwnershipRepository termOwnershipRepository;
    private final ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    private final OwnerService ownerService;
    private final TitleService titleService;
    private final OwnershipMapper ownershipMapper;

    @Override
    @ReactiveTransactional
    public Mono<Ownership> create(final long termId, final OwnershipFormData formData) {
        return Mono.zip(ownerService.getOrCreate(formData.getOwnerName()),
                titleService.getOrCreate(formData.getTitleName()))
            .map(function((owner, title) -> Tuples.of(owner, title, new TermOwnershipPojo()
                .setTermId(termId)
                .setOwnerId(owner.getId())
                .setTitleId(title.getId())
            )))
            .flatMap(function((owner, title, ownership) -> termOwnershipRepository.create(ownership)
                .map(pojo -> Tuples.of(owner, title, pojo))))
            .flatMap(function((owner, title, ownership) -> termSearchEntrypointRepository
                .updateChangedOwnershipVectors(ownership.getId())
                .thenReturn(new TermOwnershipDto(ownership, owner, title))))
            .map(ownershipMapper::mapDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> delete(final long termOwnershipId) {
        return termOwnershipRepository.delete(termOwnershipId)
            .flatMap(pojo -> termSearchEntrypointRepository.updateChangedOwnershipVectors(pojo.getId()))
            .then();
    }

    @Override
    @ReactiveTransactional
    public Mono<Ownership> update(final long termOwnershipId, final OwnershipUpdateFormData formData) {
        return termOwnershipRepository.get(termOwnershipId)
            .switchIfEmpty(Mono.error(new NotFoundException("Ownership with id = [%s] was not found", termOwnershipId)))
            .then(titleService.getOrCreate(formData.getTitleName()))
            .flatMap(titlePojo -> termOwnershipRepository.updateTitle(termOwnershipId, titlePojo.getId()))
            .then(termOwnershipRepository.get(termOwnershipId))
            .flatMap(dto -> termSearchEntrypointRepository.updateChangedOwnershipVectors(dto.owner().getId())
                .thenReturn(dto))
            .map(ownershipMapper::mapDto);
    }
}
