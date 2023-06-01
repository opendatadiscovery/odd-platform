package org.opendatadiscovery.oddplatform.service.term;

import java.util.HashSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.service.DataEntityFilledService;
import org.opendatadiscovery.oddplatform.service.NamespaceService;
import org.opendatadiscovery.oddplatform.service.TagService;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.FieldTermAssigned;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.FieldTermAssignmentDeleted;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.TermAssigned;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.TermAssignmentDeleted;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.DATASET_FIELD_TERMS;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.TERMS;

@Service
@Slf4j
@RequiredArgsConstructor
public class TermServiceImpl implements TermService {

    private final ReactiveTermRepository termRepository;
    private final NamespaceService namespaceService;
    private final TagService tagService;
    private final ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    private final DataEntityFilledService dataEntityFilledService;
    private final TermMapper termMapper;
    private final TagMapper tagMapper;

    @Override
    public Mono<TermRefList> getTerms(final Integer page, final Integer size, final String query) {
        return termRepository.listTermRefDtos(page, size, query)
            .map(termMapper::mapToRefPage);
    }

    @Override
    @ReactiveTransactional
    public Mono<TermDetails> createTerm(final TermFormData formData) {
        final Mono<TermDetails> createTermMono = namespaceService.getOrCreate(formData.getNamespaceName())
            .flatMap(namespace -> create(formData, namespace));

        return termRepository.existsByNameAndNamespace(formData.getName(), formData.getNamespaceName())
            .flatMap(exists -> {
                if (exists) {
                    return Mono.error(
                        () -> new BadUserRequestException("Term with name %s and namespace %s already exists"
                            .formatted(formData.getName(), formData.getNamespaceName()))
                    );
                }
                return createTermMono;
            })
            .flatMap(this::updateSearchVectors);
    }

    @Override
    @ReactiveTransactional
    public Mono<TermDetails> updateTerm(final Long id, final TermFormData formData) {
        return termRepository.getTermRefDto(id)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Term", id)))
            .flatMap(termRefDto -> namespaceService.getOrCreate(formData.getNamespaceName())
                .flatMap(namespace -> {
                    final TermPojo termPojo = termMapper.applyToPojo(formData, namespace, termRefDto.getTerm());
                    return update(termPojo);
                })
            )
            .flatMap(this::updateSearchVectors);
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
            .doOnNext(pojo -> log.debug("Deleted relation between term {} and data entity {}",
                pojo.getTermId(), pojo.getDataEntityId()))
            .then(termRepository.delete(id).map(TermPojo::getId));
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.TERM_ASSIGNED)
    public Mono<TermRef> linkTermWithDataEntity(final Long termId,
                                                @ActivityParameter(TermAssigned.DATA_ENTITY_ID)
                                                final Long dataEntityId) {
        return termRepository.createRelationWithDataEntity(dataEntityId, termId)
            .switchIfEmpty(Mono.error(() -> new BadUserRequestException("Term already assigned to data entity")))
            .flatMap(relation -> termRepository.getTermRefDto(relation.getTermId()))
            .flatMap(termRefDto -> dataEntityFilledService.markEntityFilled(dataEntityId, TERMS).thenReturn(termRefDto))
            .map(termMapper::mapToRef);
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.TERM_ASSIGNMENT_DELETED)
    public Mono<Void> removeTermFromDataEntity(final Long termId,
                                               @ActivityParameter(TermAssignmentDeleted.DATA_ENTITY_ID)
                                               final Long dataEntityId) {
        return termRepository.deleteRelationWithDataEntity(dataEntityId, termId)
            .flatMap(pojo -> termRepository.getDataEntityTerms(pojo.getDataEntityId()).collectList())
            .flatMap(termDtos -> {
                if (CollectionUtils.isEmpty(termDtos)) {
                    return dataEntityFilledService.markEntityUnfilled(dataEntityId, TERMS);
                }
                return Mono.just(termDtos);
            })
            .then();
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_TERM_ASSIGNED)
    public Mono<TermRef> linkTermWithDatasetField(final Long termId,
                                                  @ActivityParameter(FieldTermAssigned.DATASET_FIELD_ID)
                                                  final Long datasetFieldId) {
        return termRepository.createRelationWithDatasetField(datasetFieldId, termId)
            .flatMap(relation -> termRepository.getTermRefDto(relation.getTermId()))
            .flatMap(termRefDto -> dataEntityFilledService.markEntityFilledByDatasetFieldId(datasetFieldId,
                DATASET_FIELD_TERMS).thenReturn(termRefDto))
            .map(termMapper::mapToRef);
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_TERM_ASSIGNMENT_DELETED)
    public Mono<Void> removeTermFromDatasetField(final Long termId,
                                                 @ActivityParameter(FieldTermAssignmentDeleted.DATASET_FIELD_ID)
                                                 final Long datasetFieldId) {
        return termRepository.deleteRelationWithDatasetField(datasetFieldId, termId)
            .then(termRepository.getDatasetFieldTerms(datasetFieldId).collectList())
            .flatMap(termDtos -> {
                if (CollectionUtils.isEmpty(termDtos)) {
                    return dataEntityFilledService.markEntityUnfilledByDatasetFieldId(datasetFieldId,
                        DATASET_FIELD_TERMS);
                }
                return Mono.just(termDtos);
            })
            .then();
    }

    @Override
    @ReactiveTransactional
    public Flux<Tag> upsertTags(final Long termId, final TagsFormData tagsFormData) {
        final Set<String> names = new HashSet<>(tagsFormData.getTagNameList());
        return tagService.deleteRelationsWithTerm(termId, names)
            .then(tagService.getOrCreateTagsByName(names))
            .flatMap(tagsToLink -> tagService.createRelationsWithTerm(termId, tagsToLink)
                .ignoreElements().thenReturn(tagsToLink))
            .flatMap(tags -> termSearchEntrypointRepository.updateTagVectorsForTerm(termId)
                .thenReturn(tags))
            .flatMapIterable(tags -> tags.stream().map(tagMapper::mapToTag).toList());
    }

    private Mono<TermDetails> update(final TermPojo pojo) {
        return termRepository.update(pojo)
            .flatMap(term -> termRepository.getTermDetailsDto(term.getId()))
            .map(termMapper::mapToDetails);
    }

    private Mono<TermDetails> create(final TermFormData formData,
                                     final NamespacePojo namespace) {
        final TermPojo pojo = termMapper.mapToPojo(formData, namespace);
        return termRepository
            .create(pojo)
            .map(term -> TermRefDto.builder().term(term).namespace(namespace).build())
            .map(termRefDto -> termMapper.mapToDetails(new TermDetailsDto(termRefDto)));
    }

    private Mono<TermDetails> updateSearchVectors(final TermDetails details) {
        return Mono.zip(
            termSearchEntrypointRepository.updateTermVectors(details.getId()),
            termSearchEntrypointRepository.updateNamespaceVectorsForTerm(details.getId())
        ).thenReturn(details);
    }
}
