package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetFields;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetKind;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.dto.AssetFieldDto;
import org.opendatadiscovery.oddplatform.dto.AssetRefDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataInputAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.mapper.AssetFieldsMapper;
import org.opendatadiscovery.oddplatform.mapper.AssetFieldsMapper.DataEntityExtras;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.QueryExampleMapper;
import org.opendatadiscovery.oddplatform.mapper.TermMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.CONSUMERS_COUNT;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.ENTITIES_COUNT;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.GROUPS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.INPUTS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.OUTPUTS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.SOURCES;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.TAGS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.TARGETS;

/**
 * Resolves polymorphic catalog-asset references {@code (asset_kind, asset_id)} into renderable per-kind refs,
 * inheriting each kind's canonical visibility — a deleted/hollow asset simply resolves to nothing (issue
 * #1815 / ADR D3 "no title denormalization", D4 "order-then-semi-join"). Composes each kind's existing
 * resolver + ref mapper rather than re-querying or caching titles.
 *
 * <p>Shared by the personal, ownership-free navigation surfaces: Favorites ({@link FavoriteAssetResolver})
 * and Recently-Viewed ({@link RecentlyViewedAssetResolver}). Each adapter calls {@link #resolveByKey} once
 * for its page and then preserves its own ordering and attaches its own per-row metadata.
 *
 * <p>The cross-kind search ({@link SearchAssetResolver}) may additionally ask for the result-column values the
 * refs do not carry ({@code Asset.fields} — CTRIB-073 / #1847 ST-13a, ADR D2 + D7): {@link #resolveByKey(Collection,
 * Set)} projects them from the SAME reads (a data entity's dimensions row already carries its namespace,
 * datasource, owners, dates, counters and class attributes; a term's batched read its namespace + ownership) and
 * fetches the per-page extras a column needs — parent groups, tags, the lineage-list refs, the two aggregate
 * counts — with ONE batched query each, and ONLY when that column was asked for. With no columns asked the
 * two-argument overload is exactly the one-argument one: same refs, no extras, so the other two surfaces are
 * unaffected. Every kind is resolved with one query per page (the term and query-example reads used to be one
 * per id).
 *
 * <p>Visibility is the CALLER's policy on one axis (ST-11 / #1845): a search whose facet state carries a positive
 * {@code DELETED} status ({@link org.opendatadiscovery.oddplatform.dto.FacetStateDto#isDeletedRequested()}) has
 * already admitted the deleted data entities in its ranked query and its count, so it resolves them too
 * ({@link #resolveByKey(Collection, Set, boolean)}); every other caller keeps the default — a deleted entity
 * resolves to nothing. A hollow entity is never resolved.
 */
@Component
@RequiredArgsConstructor
public class AssetRefResolver {
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final DataEntityMapper dataEntityMapper;
    private final ReactiveTermRepository termRepository;
    private final TermMapper termMapper;
    private final ReactiveQueryExampleRepository queryExampleRepository;
    private final QueryExampleMapper queryExampleMapper;
    private final ReactiveTagRepository tagRepository;
    private final ReactiveLineageRepository lineageRepository;
    private final AssetFieldsMapper assetFieldsMapper;

    /**
     * One resolved asset — exactly one of the per-kind refs is populated, selected by {@link #assetKind()};
     * {@link #fields()} is null unless result columns were requested.
     */
    public record ResolvedAsset(AssetKind assetKind, DataEntityRef dataEntity, TermRef term,
                                QueryExampleRef queryExample, AssetFields fields) {
        public ResolvedAsset(final AssetKind assetKind, final DataEntityRef dataEntity, final TermRef term,
                             final QueryExampleRef queryExample) {
            this(assetKind, dataEntity, term, queryExample, null);
        }
    }

    /**
     * Resolves the given references into a map keyed by {@link #key(String, Long)}. Assets that are not
     * visible (deleted/hollow data entities, soft-deleted query examples) are absent from the map, so the
     * caller's semi-join drops them. Callers preserve their own ordering by iterating their source page and
     * looking each entry up by key.
     */
    public Mono<Map<String, ResolvedAsset>> resolveByKey(final Collection<AssetRefDto> refs) {
        return resolveByKey(refs, Set.of());
    }

    /**
     * {@link #resolveByKey(Collection)} plus the result-column values in {@code fields} projected onto each
     * resolved asset; an empty set yields the exact same refs with {@code fields == null}.
     */
    public Mono<Map<String, ResolvedAsset>> resolveByKey(final Collection<AssetRefDto> refs,
                                                         final Set<AssetFieldDto> fields) {
        return resolveByKey(refs, fields, false);
    }

    /**
     * {@link #resolveByKey(Collection, Set)} with the data-entity visibility the caller decided: with
     * {@code includeDeletedDataEntities} a {@code DELETED} data entity resolves like any other (the search page under
     * {@code Statuses = DELETED}); without it, as before, it resolves to nothing. Hollow entities never resolve.
     */
    public Mono<Map<String, ResolvedAsset>> resolveByKey(final Collection<AssetRefDto> refs,
                                                         final Set<AssetFieldDto> fields,
                                                         final boolean includeDeletedDataEntities) {
        if (refs.isEmpty()) {
            return Mono.just(Map.of());
        }
        return Mono.zip(
                resolveDataEntities(idsForKind(refs, AssetKind.DATA_ENTITY), fields, includeDeletedDataEntities),
                resolveTerms(idsForKind(refs, AssetKind.TERM), fields),
                resolveQueryExamples(idsForKind(refs, AssetKind.QUERY_EXAMPLE), fields))
            .map(resolvedByKind -> {
                final Map<String, ResolvedAsset> resolved = new HashMap<>();
                resolved.putAll(resolvedByKind.getT1());
                resolved.putAll(resolvedByKind.getT2());
                resolved.putAll(resolvedByKind.getT3());
                return resolved;
            });
    }

    public static String key(final String assetKind, final Long assetId) {
        return assetKind + ":" + assetId;
    }

    private Mono<Map<String, ResolvedAsset>> resolveDataEntities(final Set<Long> ids,
                                                                 final Set<AssetFieldDto> fields,
                                                                 final boolean includeDeleted) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        return dataEntityRepository.getDimensionsByIds(ids)
            .map(dtos -> dtos.stream()
                .filter(dto -> isVisible(dto, includeDeleted))
                // The dimensions query LEFT JOINs the namespace by the entity's own id OR its datasource's, so an
                // entity whose two namespaces differ comes back as two rows; keep the one that is the entity's own.
                .collect(Collectors.toMap(dto -> dto.getDataEntity().getId(), Function.identity(),
                    AssetRefResolver::preferOwnNamespace)))
            .flatMap(byId -> fields.isEmpty()
                ? Mono.just(Map.<String, ResolvedAsset>of()).map(ignored -> resolvedDataEntities(byId, fields, null))
                : dataEntityExtras(byId.values(), fields).map(extras -> resolvedDataEntities(byId, fields, extras)));
    }

    private Map<String, ResolvedAsset> resolvedDataEntities(final Map<Long, DataEntityDimensionsDto> byId,
                                                            final Set<AssetFieldDto> fields,
                                                            final DataEntityExtras extras) {
        final Map<String, ResolvedAsset> resolved = new HashMap<>();
        byId.values().forEach(dto -> resolved.put(
            key(AssetKind.DATA_ENTITY.getValue(), dto.getDataEntity().getId()),
            new ResolvedAsset(AssetKind.DATA_ENTITY, dataEntityMapper.mapRef(dto), null, null,
                extras == null ? null : assetFieldsMapper.forDataEntity(dto, fields, extras))));
        return resolved;
    }

    /**
     * The per-page extras the requested columns need — each ONE batched query, fired only when its column is on.
     * Six independent Monos zipped: an absent column contributes {@code Map.of()} without a query.
     */
    private Mono<DataEntityExtras> dataEntityExtras(final Collection<DataEntityDimensionsDto> dtos,
                                                    final Set<AssetFieldDto> fields) {
        final Set<String> oddrns = dtos.stream().map(dto -> dto.getDataEntity().getOddrn()).collect(Collectors.toSet());
        final Set<Long> ids = dtos.stream().map(dto -> dto.getDataEntity().getId()).collect(Collectors.toSet());
        final Set<String> datasetOddrns = oddrnsOfClass(dtos, DataEntityClassDto.DATA_SET);
        final Set<String> groupOddrns = oddrnsOfClass(dtos, DataEntityClassDto.DATA_ENTITY_GROUP);
        final Set<String> lineageOddrns = fields.contains(SOURCES) || fields.contains(TARGETS)
            || fields.contains(INPUTS) || fields.contains(OUTPUTS) ? lineageOddrns(dtos, fields) : Set.of();

        final Mono<Map<String, Set<DataEntityPojo>>> parentGroups = fields.contains(GROUPS)
            ? dataEntityRepository.getParentDEGs(oddrns) : Mono.just(Map.of());
        final Mono<Map<Long, List<TagPojo>>> tags = fields.contains(TAGS)
            ? tagRepository.listTagsByDataEntityIds(ids) : Mono.just(Map.of());
        final Mono<Map<String, DataEntityPojo>> lineage = lineageOddrns.isEmpty()
            ? Mono.just(Map.of())
            : dataEntityRepository.listByOddrns(lineageOddrns, false, false)
                .collectMap(DataEntityPojo::getOddrn, Function.identity());
        final Mono<Map<String, Long>> consumersCount = fields.contains(CONSUMERS_COUNT) && !datasetOddrns.isEmpty()
            ? lineageRepository.getTargetsCount(datasetOddrns) : Mono.just(Map.of());
        final Mono<Map<String, Long>> groupMembersCount = fields.contains(ENTITIES_COUNT) && !groupOddrns.isEmpty()
            ? dataEntityRepository.getDEGEntitiesCount(groupOddrns) : Mono.just(Map.of());
        final Mono<Map<String, Long>> groupChildrenCount = fields.contains(ENTITIES_COUNT) && !groupOddrns.isEmpty()
            ? dataEntityRepository.getExperimentRunsCount(groupOddrns) : Mono.just(Map.of());

        return Mono.zip(parentGroups, tags, lineage, consumersCount, groupMembersCount, groupChildrenCount)
            .map(t -> new DataEntityExtras(t.getT1(), t.getT2(), t.getT3(), t.getT4(), t.getT5(), t.getT6()));
    }

    private Mono<Map<String, ResolvedAsset>> resolveTerms(final Set<Long> ids, final Set<AssetFieldDto> fields) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        final Mono<Map<Long, List<TagPojo>>> tags = fields.contains(TAGS)
            ? tagRepository.listTagsByTermIds(ids) : Mono.just(Map.of());
        return Mono.zip(termRepository.getTermDtosByIds(ids), tags)
            .map(t -> t.getT1().stream().collect(Collectors.toMap(
                dto -> key(AssetKind.TERM.getValue(), dto.getTermRefDto().getTerm().getId()),
                dto -> new ResolvedAsset(AssetKind.TERM, null, termMapper.mapToRef(dto.getTermRefDto()), null,
                    fields.isEmpty() ? null
                        : assetFieldsMapper.forTerm(dto, fields, t.getT2().get(dto.getTermRefDto().getTerm().getId()))),
                (existing, ignored) -> existing)));
    }

    private Mono<Map<String, ResolvedAsset>> resolveQueryExamples(final Set<Long> ids,
                                                                  final Set<AssetFieldDto> fields) {
        if (ids.isEmpty()) {
            return Mono.just(Map.of());
        }
        return queryExampleRepository.listByIds(ids)
            .map(pojos -> pojos.stream()
                .filter(pojo -> pojo.getDeletedAt() == null)
                .collect(Collectors.toMap(
                    pojo -> key(AssetKind.QUERY_EXAMPLE.getValue(), pojo.getId()),
                    pojo -> new ResolvedAsset(AssetKind.QUERY_EXAMPLE, null, null,
                        queryExampleMapper.mapToQueryExampleRef(pojo),
                        fields.isEmpty() ? null : assetFieldsMapper.forQueryExample(pojo, fields)),
                    (existing, ignored) -> existing)));
    }

    private boolean isVisible(final DataEntityDimensionsDto dto, final boolean includeDeleted) {
        final var dataEntity = dto.getDataEntity();
        return dataEntity.getStatus() != null
            && (includeDeleted || dataEntity.getStatus().intValue() != DataEntityStatusDto.DELETED.getId())
            && !Boolean.TRUE.equals(dataEntity.getHollow());
    }

    private static DataEntityDimensionsDto preferOwnNamespace(final DataEntityDimensionsDto first,
                                                              final DataEntityDimensionsDto second) {
        final Long own = second.getDataEntity().getNamespaceId();
        final boolean secondIsOwn = own != null && second.getNamespace() != null
            && own.equals(second.getNamespace().getId());
        return secondIsOwn ? second : first;
    }

    private static Set<String> oddrnsOfClass(final Collection<DataEntityDimensionsDto> dtos,
                                             final DataEntityClassDto entityClass) {
        return dtos.stream()
            .filter(dto -> DataEntityClassDto.findByIds(dto.getDataEntity().getEntityClassIds()).contains(entityClass))
            .map(dto -> dto.getDataEntity().getOddrn())
            .collect(Collectors.toSet());
    }

    /** The oddrns the requested lineage-list columns name across the page (the legacy dependencies fetch). */
    private static Set<String> lineageOddrns(final Collection<DataEntityDimensionsDto> dtos,
                                             final Set<AssetFieldDto> fields) {
        return dtos.stream()
            .flatMap(dto -> {
                final Map<DataEntityClassDto, DataEntityAttributes> attributes = dto.getSpecificAttributes();
                if (attributes == null) {
                    return Stream.empty();
                }
                final Stream.Builder<Collection<String>> lists = Stream.builder();
                if (attributes.get(DataEntityClassDto.DATA_TRANSFORMER) instanceof DataTransformerAttributes dta) {
                    if (fields.contains(SOURCES)) {
                        lists.add(dta.getSourceOddrnList());
                    }
                    if (fields.contains(TARGETS)) {
                        lists.add(dta.getTargetOddrnList());
                    }
                }
                if (fields.contains(INPUTS)
                    && attributes.get(DataEntityClassDto.DATA_CONSUMER) instanceof DataConsumerAttributes dca) {
                    lists.add(dca.getInputListOddrn());
                }
                if (fields.contains(OUTPUTS)
                    && attributes.get(DataEntityClassDto.DATA_INPUT) instanceof DataInputAttributes dia) {
                    lists.add(dia.getOutputListOddrn());
                }
                return lists.build().filter(Objects::nonNull).flatMap(Collection::stream);
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    }

    private static Set<Long> idsForKind(final Collection<AssetRefDto> refs, final AssetKind kind) {
        return refs.stream()
            .filter(ref -> kind.getValue().equals(ref.assetKind()))
            .map(AssetRefDto::assetId)
            .collect(Collectors.toSet());
    }
}
