package org.opendatadiscovery.oddplatform.service.term;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTerm;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTermList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.dto.activity.ActivityEventTypeDto;
import org.opendatadiscovery.oddplatform.dto.term.DescriptionParsedTerms;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermBaseInfoDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityDescriptionUnhandledTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldDescriptionUnhandledTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldToTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermDefinitionUnhandledTermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermToTermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.DataEntityDescriptionUnhandledTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.DatasetFieldDescriptionUnhandledTermRepositoryImpl;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.TermDefinitionUnhandledTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.TermRelationsRepository;
import org.opendatadiscovery.oddplatform.service.DataEntityFilledService;
import org.opendatadiscovery.oddplatform.service.NamespaceService;
import org.opendatadiscovery.oddplatform.service.TagService;
import org.opendatadiscovery.oddplatform.service.activity.ActivityLog;
import org.opendatadiscovery.oddplatform.service.activity.ActivityParameter;
import org.opendatadiscovery.oddplatform.service.ingestion.util.DateTimeUtil;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.FieldTermAssignment;
import org.opendatadiscovery.oddplatform.utils.ActivityParameterNames.TermAssignment;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.DATASET_FIELD_TERMS;
import static org.opendatadiscovery.oddplatform.dto.DataEntityFilledField.TERMS;

@Service
@Slf4j
@RequiredArgsConstructor
public class TermServiceImpl implements TermService {
    private static final Pattern PATTERN = Pattern.compile("\\[\\[([^:]*?):([^\\]]*?)\\]\\]");

    private final NamespaceService namespaceService;
    private final TagService tagService;
    private final DataEntityFilledService dataEntityFilledService;

    private final ReactiveTermRepository termRepository;
    private final TermRelationsRepository termRelationsRepository;
    private final TermDefinitionUnhandledTermRepository termDefinitionUnhandledTermRepository;
    private final ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;
    private final DataEntityDescriptionUnhandledTermRepository dataEntityDescriptionUnhandledTermRepository;
    private final DatasetFieldDescriptionUnhandledTermRepositoryImpl datasetFieldDescriptionUnhandledTermRepository;

    private final TermMapper termMapper;
    private final TagMapper tagMapper;

    @Override
    public Mono<TermRefList> getTerms(final Integer page, final Integer size, final String query,
                                      final OffsetDateTime updatedAtRangeStartDateTime,
                                      final OffsetDateTime updatedAtRangeEndDateTime) {
        return termRepository.listTermRefDtos(page, size, query, updatedAtRangeStartDateTime, updatedAtRangeEndDateTime)
            .map(termMapper::mapToRefPage);
    }

    @Override
    public Mono<TermRef> getTermByNamespaceAndName(final String namespaceName, final String name) {
        return termRepository.getByNameAndNamespace(namespaceName, name)
            .switchIfEmpty(Mono.error(
                new NotFoundException("Term in namespace %s with name %s not found".formatted(namespaceName, name))))
            .map(termMapper::mapToRef);
    }

    @Override
    @ReactiveTransactional
    public Mono<TermDetails> createTerm(final TermFormData formData) {
        final Mono<TermDetails> createTermMono = Mono.defer(() -> namespaceService
            .getOrCreate(formData.getNamespaceName())
            .zipWith(findTermsInDescription(formData.getDefinition()))
            .flatMap(tuple -> create(formData, tuple.getT1(), tuple.getT2())));

        return termRepository.getByNameAndNamespace(formData.getNamespaceName(), formData.getName())
            .handle((dto, sink) -> {
                if (dto != null) {
                    sink.error(new BadUserRequestException("Term with name %s in namespace %s already exists"
                        .formatted(formData.getName(), formData.getNamespaceName())));
                }
            })
            .then(createTermMono)
            .flatMap(this::updateSearchVectors)
            .flatMap(term -> resolveUnhandledDescriptionMentions(term).thenReturn(term));
    }

    @Override
    @ReactiveTransactional
    public Mono<TermDetails> updateTerm(final Long id, final TermFormData formData) {
        return termRepository.getTermRefDto(id)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Term", id)))
            .flatMap(termRefDto -> {
                if (nameOrNamespaceHasChanged(formData, termRefDto)) {
                    return Mono.just(termRefDto);
                } else {
                    return termRepository.hasDescriptionRelations(id).handle((exists, sink) -> {
                        if (exists) {
                            sink.error(
                                new BadUserRequestException("Can't update term, which was mentioned in description"));
                        } else {
                            sink.next(termRefDto);
                        }
                    });
                }
            })
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
        return termRepository.hasDescriptionRelations(id)
            .handle((exists, sink) -> {
                if (exists) {
                    sink.error(new BadUserRequestException("Can't delete term, which was mentioned in description"));
                }
            })
            .thenMany(termRelationsRepository.deleteRelationsWithDataEntities(id))
            .thenMany(termRelationsRepository.deleteRelationsWithDatasetFields(id))
            .then(termRepository.delete(id).map(TermPojo::getId));
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.TERM_ASSIGNMENT_UPDATED)
    public Mono<LinkedTerm> linkTermWithDataEntity(final Long termId,
                                                   @ActivityParameter(TermAssignment.DATA_ENTITY_ID)
                                                   final Long dataEntityId) {
        return termRelationsRepository.createRelationWithDataEntity(dataEntityId, termId)
            .switchIfEmpty(Mono.error(() -> new BadUserRequestException("Term already assigned to data entity")))
            .flatMap(relation -> termRepository.getTermRefDto(relation.getTermId()))
            .map(termRefDto -> new LinkedTermDto(termRefDto, false))
            .flatMap(termRefDto -> dataEntityFilledService.markEntityFilled(dataEntityId, TERMS).thenReturn(termRefDto))
            .map(termMapper::mapToLinkedTerm);
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.TERM_ASSIGNMENT_UPDATED)
    public Mono<Void> removeTermFromDataEntity(final Long termId,
                                               @ActivityParameter(TermAssignment.DATA_ENTITY_ID)
                                               final Long dataEntityId) {
        return termRelationsRepository.deleteRelationWithDataEntity(dataEntityId, termId)
            .flatMap(pojo -> getDataEntityTerms(pojo.getDataEntityId()))
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
    @ActivityLog(event = ActivityEventTypeDto.TERM_ASSIGNMENT_UPDATED)
    public Mono<List<LinkedTermDto>> handleDataEntityDescriptionTerms(
        @ActivityParameter(TermAssignment.DATA_ENTITY_ID) final long dataEntityId,
        final String description) {
        return findTermsInDescription(description)
            .flatMap(parsedTerms -> updateDataEntityDescriptionTermsState(parsedTerms, dataEntityId))
            .then(getDataEntityTerms(dataEntityId));
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_TERM_ASSIGNMENT_UPDATED)
    public Mono<LinkedTerm> linkTermWithDatasetField(final Long termId,
                                                     @ActivityParameter(FieldTermAssignment.DATASET_FIELD_ID)
                                                     final Long datasetFieldId) {
        return termRelationsRepository.createRelationWithDatasetField(datasetFieldId, termId)
            .flatMap(relation -> termRepository.getTermRefDto(relation.getTermId()))
            .map(termRefDto -> new LinkedTermDto(termRefDto, false))
            .flatMap(termRefDto -> dataEntityFilledService.markEntityFilledByDatasetFieldId(datasetFieldId,
                DATASET_FIELD_TERMS).thenReturn(termRefDto))
            .map(termMapper::mapToLinkedTerm);
    }

    @Override
    @ReactiveTransactional
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_TERM_ASSIGNMENT_UPDATED)
    public Mono<Void> removeTermFromDatasetField(final Long termId,
                                                 @ActivityParameter(FieldTermAssignment.DATASET_FIELD_ID)
                                                 final Long datasetFieldId) {
        return termRelationsRepository.deleteRelationWithDatasetField(datasetFieldId, termId)
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
    @ActivityLog(event = ActivityEventTypeDto.DATASET_FIELD_TERM_ASSIGNMENT_UPDATED)
    public Mono<List<LinkedTermDto>> handleDatasetFieldDescriptionTerms(
        @ActivityParameter(FieldTermAssignment.DATASET_FIELD_ID) final long datasetFieldId,
        final String description) {
        return findTermsInDescription(description)
            .flatMap(parsedTerms -> updateDatasetFieldDescriptionTermsState(parsedTerms, datasetFieldId))
            .then(getDatasetFieldTerms(datasetFieldId));
    }

    @Override
    @ReactiveTransactional
    public Flux<Tag> upsertTags(final Long termId, final TagsFormData tagsFormData) {
        final Set<String> names = new HashSet<>(tagsFormData.getTagNameList());
        return tagService.deleteRelationsWithTerm(termId, names)
            .then(tagService.getOrCreateTagsByName(names)
                .collectList())
            .flatMap(tagsToLink -> tagService.createRelationsWithTerm(termId, tagsToLink)
                .ignoreElements().thenReturn(tagsToLink))
            .flatMap(tags -> termSearchEntrypointRepository.updateTagVectorsForTerm(termId)
                .thenReturn(tags))
            .flatMapIterable(tags -> tags.stream().map(tagMapper::mapToTag).toList());
    }

    @Override
    public Mono<List<LinkedTermDto>> getDataEntityTerms(final long dataEntityId) {
        final Flux<LinkedTermDto> dataEntityTerms = termRepository.getDataEntityTerms(dataEntityId);
        return removeDuplicateNonDescriptionTerms(dataEntityTerms).collectList();
    }

    @Override
    public Mono<List<LinkedTermDto>> getDatasetFieldTerms(final long datasetFieldId) {
        final Flux<LinkedTermDto> datasetFieldTerms = termRepository.getDatasetFieldTerms(datasetFieldId);
        return removeDuplicateNonDescriptionTerms(datasetFieldTerms).collectList();
    }

    @Override
    public Mono<LinkedTermList> listByTerm(final Long termId, final String query,
                                           final Integer page, final Integer size) {
        return termRepository.listByTerm(termId, query, page, size)
            .collectList()
            .map(item -> new LinkedTermList()
                .items(termMapper.mapListToLinkedTermList(item))
                .pageInfo(new PageInfo().total((long) item.size()).hasNext(false)));
    }

    @Override
    @ReactiveTransactional
    public Mono<LinkedTerm> linkTermWithTerm(final Long linkedTermId, final Long termId) {
        return termRelationsRepository.createRelationWithTerm(linkedTermId, termId)
            .flatMap(relation -> termRepository.getTermRefDto(relation.getAssignedTermId()))
            .map(termRefDto -> new LinkedTermDto(termRefDto, false))
            .map(termMapper::mapToLinkedTerm);
    }

    @Override
    @ReactiveTransactional
    public Mono<Void> removeTermToLinkedTermRelation(final Long termId, final Long linkedTermId) {
        return termRelationsRepository.deleteTermToLinkedTermRelation(linkedTermId, termId)
            .then();
    }

    private Mono<TermDetails> update(final TermPojo pojo) {
        return termRepository.update(pojo)
            .flatMap(term -> findTermsInDescription(term.getDefinition())
                .flatMap(linkedTerms -> updateTermDefinitionTermsState(linkedTerms, term.getId()))
                    .thenReturn(term))
            .flatMap(term -> termRepository.getTermDetailsDto(term.getId()))
            .map(termMapper::mapToDetails);
    }

    private Mono<TermDetails> create(final TermFormData formData,
                                     final NamespacePojo namespace,
                                     final DescriptionParsedTerms linkedTerms) {
        final TermPojo pojo = termMapper.mapToPojo(formData, namespace);
        return termRepository
            .create(pojo)
            .flatMap(term -> updateTermDefinitionTermsState(linkedTerms, term.getId())
                .thenReturn(TermRefDto.builder().term(term).namespace(namespace).build()))
            .map(termRefDto -> termMapper.mapToDetails(new TermDetailsDto(termRefDto)));
    }

    private Mono<TermDetails> updateSearchVectors(final TermDetails details) {
        return Mono.zip(
            termSearchEntrypointRepository.updateTermVectors(details.getId()),
            termSearchEntrypointRepository.updateNamespaceVectorsForTerm(details.getId())
        ).thenReturn(details);
    }

    private boolean nameOrNamespaceHasChanged(final TermFormData formData,
                                              final TermRefDto existingTerm) {
        return existingTerm.getNamespace().getName().equalsIgnoreCase(formData.getNamespaceName())
            && existingTerm.getTerm().getName().equalsIgnoreCase(formData.getName());
    }

    private Mono<DescriptionParsedTerms> findTermsInDescription(final String description) {
        if (StringUtils.isEmpty(description)) {
            return Mono.just(new DescriptionParsedTerms(List.of(), List.of()));
        }
        final Matcher matcher = PATTERN.matcher(description);
        final List<TermBaseInfoDto> parsedTerms = new ArrayList<>();
        while (matcher.find()) {
            final String namespaceName = matcher.group(1);
            final String name = matcher.group(2);
            if (StringUtils.isNotEmpty(namespaceName) && StringUtils.isNotEmpty(name)) {
                parsedTerms.add(new TermBaseInfoDto(namespaceName, name));
            }
        }
        return termRepository.getByNameAndNamespace(parsedTerms)
            .map(foundTerms -> {
                final List<TermBaseInfoDto> unknownTerms = parsedTerms.stream()
                    .filter(t -> isTermUnknown(foundTerms, t))
                    .toList();
                final List<TermPojo> termPojos = foundTerms.stream()
                    .map(TermRefDto::getTerm)
                    .toList();
                return new DescriptionParsedTerms(termPojos, unknownTerms);
            });
    }

    private Mono<Void> updateDataEntityDescriptionTermsState(final DescriptionParsedTerms terms,
                                                             final long dataEntityId) {
        final Mono<List<LinkedTermDto>> existingDescriptionRelations = termRepository.getDataEntityTerms(dataEntityId)
            .filter(LinkedTermDto::isDescriptionLink)
            .collectList();
        return existingDescriptionRelations.flatMap(existing -> {
            final List<DataEntityToTermPojo> relationsToDelete = existing.stream()
                .map(dto -> dto.term().getTerm())
                .filter(pojo -> !terms.foundTerms().contains(pojo))
                .map(pojo -> new DataEntityToTermPojo()
                    .setDataEntityId(dataEntityId)
                    .setTermId(pojo.getId())
                    .setIsDescriptionLink(true))
                .toList();

            final List<DataEntityToTermPojo> relations =
                buildDataEntityDescriptionTermRelations(terms.foundTerms(), dataEntityId);
            final List<DataEntityDescriptionUnhandledTermPojo> unknownPojos =
                buildDataEntityUnknownTerms(terms.unknownTerms(), dataEntityId);

            return termRelationsRepository.deleteTermDataEntityRelations(relationsToDelete)
                .thenMany(termRelationsRepository.createRelationsWithDataEntity(relations))
                .thenMany(dataEntityDescriptionUnhandledTermRepository
                    .deleteForDataEntityExceptSpecified(dataEntityId, terms.unknownTerms()))
                .thenMany(dataEntityDescriptionUnhandledTermRepository.createUnhandledTerms(unknownPojos))
                .then();
        });
    }

    private Mono<Void> updateDatasetFieldDescriptionTermsState(final DescriptionParsedTerms terms,
                                                               final long datasetFieldId) {
        final Mono<List<LinkedTermDto>> existingDescriptionRelations = termRepository
            .getDatasetFieldTerms(datasetFieldId)
            .filter(LinkedTermDto::isDescriptionLink)
            .collectList();

        return existingDescriptionRelations.flatMap(existing -> {
            final List<DatasetFieldToTermPojo> relationsToDelete = existing.stream()
                .map(dto -> dto.term().getTerm())
                .filter(pojo -> !terms.foundTerms().contains(pojo))
                .map(pojo -> new DatasetFieldToTermPojo()
                    .setDatasetFieldId(datasetFieldId)
                    .setTermId(pojo.getId())
                    .setIsDescriptionLink(true))
                .toList();
            final List<DatasetFieldToTermPojo> relations =
                buildDatasetFieldDescriptionTermRelations(terms.foundTerms(), datasetFieldId);
            final List<DatasetFieldDescriptionUnhandledTermPojo> unknownPojos =
                buildDatasetFieldUnknownTerms(terms.unknownTerms(), datasetFieldId);

            return termRelationsRepository.deleteTermDatasetFieldRelations(relationsToDelete)
                .thenMany(termRelationsRepository.createRelationsWithDatasetField(relations))
                .thenMany(datasetFieldDescriptionUnhandledTermRepository
                    .deleteForDatasetFieldExceptSpecified(datasetFieldId, terms.unknownTerms()))
                .thenMany(datasetFieldDescriptionUnhandledTermRepository.createUnhandledTerms(unknownPojos))
                .then();
        });
    }

    private Mono<Void> resolveUnhandledDescriptionMentions(final TermDetails details) {
        final TermBaseInfoDto termBaseInfo = new TermBaseInfoDto(details.getNamespace().getName(), details.getName());

        final Flux<DataEntityToTermPojo> dataEntityTerms = dataEntityDescriptionUnhandledTermRepository
            .deleteUnhandledTerm(termBaseInfo)
            .map(term -> new DataEntityToTermPojo()
                .setTermId(details.getId())
                .setDataEntityId(term.getDataEntityId())
                .setIsDescriptionLink(true))
            .collectList()
            .flatMapMany(termRelationsRepository::createRelationsWithDataEntity);

        final Flux<DatasetFieldToTermPojo> datasetFieldTerms = datasetFieldDescriptionUnhandledTermRepository
            .deleteUnhandledTerm(termBaseInfo)
            .map(term -> new DatasetFieldToTermPojo()
                .setTermId(details.getId())
                .setDatasetFieldId(term.getDatasetFieldId())
                .setIsDescriptionLink(true))
            .collectList()
            .flatMapMany(termRelationsRepository::createRelationsWithDatasetField);
        return Flux.merge(dataEntityTerms, datasetFieldTerms).then();
    }

    private Flux<LinkedTermDto> removeDuplicateNonDescriptionTerms(final Flux<LinkedTermDto> terms) {
        return terms
            .groupBy(dto -> dto.term().getTerm().getId())
            .flatMap(group -> group.reduce((dto1, dto2) -> dto1.isDescriptionLink() ? dto1 : dto2));
    }

    private Mono<Void> updateTermDefinitionTermsState(final DescriptionParsedTerms terms,
                                                      final long termId) {
        final Mono<List<LinkedTermDto>> existingDescriptionRelations = termRepository
            .getLinkedTermsByTargetTermId(termId)
            .filter(LinkedTermDto::isDescriptionLink)
            .collectList();

        return existingDescriptionRelations.flatMap(existing -> {
            final List<TermToTermPojo> relationsToDelete = existing.stream()
                .map(dto -> dto.term().getTerm())
                .filter(pojo -> !terms.foundTerms().contains(pojo))
                .map(pojo -> new TermToTermPojo()
                    .setTargetTermId(termId)
                    .setAssignedTermId(pojo.getId())
                    .setIsDescriptionLink(true))
                .toList();

            final List<TermToTermPojo> relations =
                buildTermDescriptionTermRelations(terms.foundTerms(), termId);
            final List<TermDefinitionUnhandledTermPojo> unknownPojos =
                buildTermUnknownTerms(terms.unknownTerms(), termId);

            return termRelationsRepository.deleteTermToTermRelations(relationsToDelete)
                .thenMany(termRelationsRepository.createRelationsWithTerm(relations))
                .thenMany(termDefinitionUnhandledTermRepository
                    .deleteForTermExceptSpecified(termId, terms.unknownTerms()))
                .thenMany(termDefinitionUnhandledTermRepository.createUnhandledTerms(unknownPojos))
                .then();
        });
    }

    private List<DataEntityToTermPojo> buildDataEntityDescriptionTermRelations(final List<TermPojo> terms,
                                                                               final long dataEntityId) {
        return terms.stream()
            .map(t -> new DataEntityToTermPojo()
                .setDataEntityId(dataEntityId)
                .setTermId(t.getId())
                .setIsDescriptionLink(true))
            .toList();
    }

    private List<DatasetFieldToTermPojo> buildDatasetFieldDescriptionTermRelations(final List<TermPojo> terms,
                                                                                   final long datasetFieldId) {
        return terms.stream()
            .map(t -> new DatasetFieldToTermPojo()
                .setDatasetFieldId(datasetFieldId)
                .setTermId(t.getId())
                .setIsDescriptionLink(true))
            .toList();
    }

    private List<DatasetFieldDescriptionUnhandledTermPojo> buildDatasetFieldUnknownTerms(
        final List<TermBaseInfoDto> terms,
        final long datasetFieldId) {
        return terms.stream()
            .map(t -> new DatasetFieldDescriptionUnhandledTermPojo()
                .setDatasetFieldId(datasetFieldId)
                .setTermName(t.name().toLowerCase())
                .setTermNamespaceName(t.namespaceName().toLowerCase())
                .setCreatedAt(DateTimeUtil.generateNow()))
            .toList();
    }

    private List<DataEntityDescriptionUnhandledTermPojo> buildDataEntityUnknownTerms(final List<TermBaseInfoDto> terms,
                                                                                     final long dataEntityId) {
        return terms.stream()
            .map(t -> new DataEntityDescriptionUnhandledTermPojo()
                .setDataEntityId(dataEntityId)
                .setTermName(t.name().toLowerCase())
                .setTermNamespaceName(t.namespaceName().toLowerCase())
                .setCreatedAt(DateTimeUtil.generateNow()))
            .toList();
    }

    private List<TermToTermPojo> buildTermDescriptionTermRelations(final List<TermPojo> terms,
                                                                   final long termId) {
        return terms.stream()
            .map(t -> new TermToTermPojo()
                .setTargetTermId(termId)
                .setAssignedTermId(t.getId())
                .setIsDescriptionLink(true))
            .toList();
    }

    private List<TermDefinitionUnhandledTermPojo> buildTermUnknownTerms(
        final List<TermBaseInfoDto> terms,
        final long datasetFieldId) {
        return terms.stream()
            .map(t -> new TermDefinitionUnhandledTermPojo()
                .setTargetTermId(datasetFieldId)
                .setTermName(t.name().toLowerCase())
                .setTermNamespaceName(t.namespaceName().toLowerCase())
                .setCreatedAt(DateTimeUtil.generateNow()))
            .toList();
    }

    private boolean isTermUnknown(final List<TermRefDto> existingTerms,
                                  final TermBaseInfoDto term) {
        return existingTerms.stream().noneMatch(t -> t.getTerm().getName().equalsIgnoreCase(term.name())
            && t.getNamespace().getName().equalsIgnoreCase(term.namespaceName()));
    }
}
