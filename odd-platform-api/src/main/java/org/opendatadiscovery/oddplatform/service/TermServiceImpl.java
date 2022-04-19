package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class TermServiceImpl implements TermService {

    private final ReactiveTermRepository termRepository;
    private final ReactiveNamespaceRepository namespaceRepository;
    private final TermMapper termMapper;

    @Override
    public Mono<TermRefList> getTerms(final Integer page, final Integer size, final String query) {
        return termRepository.listTermRefDtos(page, size, query)
            .map(termMapper::mapToRefPage);
    }

    @Override
    @ReactiveTransactional
    public Mono<TermDetails> createTerm(final TermFormData formData) {
        final Mono<TermDetails> createTermMono = getOrCreateNamespace(formData.getNamespaceName())
            .flatMap(namespace -> create(formData, namespace));

        return termRepository.getTermRefDtoByNameAndNamespace(formData.getName(), formData.getNamespaceName())
            .hasElement()
            .flatMap(exists -> {
                if (exists) {
                    return Mono.error(
                        () -> new RuntimeException("Term with name %s and namespace %s already exists"
                            .formatted(formData.getName(), formData.getNamespaceName()))
                    );
                }
                return createTermMono;
            });
    }

    @Override
    @ReactiveTransactional
    public Mono<TermDetails> updateTerm(final Long id, final TermFormData formData) {
        return termRepository.getTermRefDto(id)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Term with id %s is not found".formatted(id))))
            .flatMap(termRefDto -> getOrCreateNamespace(formData.getNamespaceName())
                .flatMap(namespace -> {
                    final TermPojo termPojo = termMapper.applyToPojo(formData, namespace, termRefDto.getTerm());
                    return update(termPojo, namespace);
                })
            );
    }

    @Override
    public Mono<TermDetails> getTermDetails(final Long id) {
        return termRepository.getTermDetailsDto(id)
            .map(termMapper::mapToDetails);
    }

    @Override
    @ReactiveTransactional
    public Mono<Long> delete(final long id) {
        return termRepository.deleteRelationsWithDataEntities(id)
            .doOnNext(pojo -> log.info("Deleted relation between term {} and data entity {}",
                pojo.getTermId(), pojo.getDataEntityId()))
            .collectList()
            .flatMap(ignored -> termRepository.delete(id).map(TermPojo::getId));
    }

    @Override
    @ReactiveTransactional
    public Mono<TermRef> linkTermWithDataEntity(final Long termId, final Long dataEntityId) {
        return termRepository.createRelationWithDataEntity(dataEntityId, termId)
            .flatMap(relation -> termRepository.getTermRefDto(relation.getTermId()))
            .map(termMapper::mapToRef);
    }

    @Override
    @ReactiveTransactional
    public Mono<TermRef> removeTermFromDataEntity(final Long termId, final Long dataEntityId) {
        return termRepository.deleteRelationWithDataEntity(dataEntityId, termId)
            .flatMap(relation -> termRepository.getTermRefDto(relation.getTermId()))
            .map(termMapper::mapToRef);
    }

    private Mono<NamespacePojo> getOrCreateNamespace(final String namespaceName) {
        return namespaceRepository
            .getByName(namespaceName)
            .switchIfEmpty(namespaceRepository.createByName(namespaceName));
    }

    private Mono<TermDetails> update(final TermPojo pojo,
                                     final NamespacePojo namespace) {
        return termRepository.update(pojo)
            .map(term -> TermRefDto.builder().term(term).namespace(namespace).build())
            .map(termRefDto -> termMapper.mapToDetails(new TermDetailsDto(termRefDto)));
    }

    private Mono<TermDetails> create(final TermFormData formData,
                                     final NamespacePojo namespace) {
        final TermPojo pojo = termMapper.mapToPojo(formData, namespace);
        return termRepository
            .create(pojo)
            .map(term -> TermRefDto.builder().term(term).namespace(namespace).build())
            .map(termRefDto -> termMapper.mapToDetails(new TermDetailsDto(termRefDto)));
    }
}
