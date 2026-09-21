package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.AssetFields;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.dto.AssetFieldDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataInputAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataQualityTestAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataSetAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.CONSUMERS_COUNT;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.CREATED_AT;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.DATASOURCE;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.DESCRIPTION;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.ENTITIES_COUNT;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.FIELDS_COUNT;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.GROUPS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.INPUTS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.LAST_INGESTED_AT;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.NAMESPACE;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.OUTPUTS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.OWNERS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.POPULARITY;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.ROWS_COUNT;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.SOURCES;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.SUITE_URL;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.TAGS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.TARGETS;
import static org.opendatadiscovery.oddplatform.dto.AssetFieldDto.UPDATED_AT;

/**
 * Projects the extra result-column values a row carries ({@code Asset.fields}) from what the search's live
 * semi-join already loaded, for exactly the columns the request named (CTRIB-073 / #1847 ST-13a, ADR D2 + D7).
 *
 * <p>Two rules, both the contract's: a property is set ONLY when its column was requested AND the row's kind (or
 * data-entity class) carries the value — the rest stay absent, which is how the UI tells "not applicable" from
 * "no value"; and nothing here re-queries — a data entity's namespace / datasource / owners / dates / counters /
 * class attributes come from the dimensions row the resolver already has, a term's from its batched read, and the
 * per-page extras (groups, tags, the four lineage lists, the two aggregate counts) are handed in by the resolver,
 * which fetched each with ONE batched query and only because its column was on. The sub-mappers are the ones the
 * rest of the API uses, so a namespace / owner / tag / ref renders here exactly as it does elsewhere.
 */
@Component
@RequiredArgsConstructor
public class AssetFieldsMapper {
    private final NamespaceMapper namespaceMapper;
    private final DataSourceSafeMapper dataSourceSafeMapper;
    private final OwnershipMapper ownershipMapper;
    private final TagMapper tagMapper;
    private final DateTimeMapper dateTimeMapper;
    private final DataEntityMapper dataEntityMapper;

    /**
     * The per-page extras the resolver batch-fetched for the requested columns. Every map is keyed as its
     * repository keys it (tags by entity id, the rest by oddrn); a missing key simply means "none".
     */
    public record DataEntityExtras(Map<String, Set<DataEntityPojo>> parentGroups,
                                   Map<Long, List<TagPojo>> tags,
                                   Map<String, DataEntityPojo> lineageByOddrn,
                                   Map<String, Long> consumersCount,
                                   Map<String, Long> groupMembersCount,
                                   Map<String, Long> groupChildrenCount) {
        public static final DataEntityExtras NONE =
            new DataEntityExtras(Map.of(), Map.of(), Map.of(), Map.of(), Map.of(), Map.of());
    }

    public AssetFields forDataEntity(final DataEntityDimensionsDto dto,
                                     final Set<AssetFieldDto> requested,
                                     final DataEntityExtras extras) {
        final DataEntityPojo pojo = dto.getDataEntity();
        final AssetFields fields = new AssetFields();
        if (requested.contains(NAMESPACE) && dto.getNamespace() != null) {
            fields.setNamespace(namespaceMapper.mapPojo(dto.getNamespace()));
        }
        if (requested.contains(DATASOURCE) && dto.getDataSource() != null) {
            fields.setDataSource(dataSourceSafeMapper.mapDto(
                new DataSourceDto(dto.getDataSource(), dto.getNamespace(), null)));
        }
        if (requested.contains(OWNERS) && dto.getOwnership() != null && !dto.getOwnership().isEmpty()) {
            fields.setOwners(ownershipMapper.mapDtos(dto.getOwnership()));
        }
        if (requested.contains(CREATED_AT)) {
            fields.setCreatedAt(dateTimeMapper.mapUTCDateTime(pojo.getSourceCreatedAt()));
        }
        if (requested.contains(UPDATED_AT)) {
            fields.setUpdatedAt(dateTimeMapper.mapUTCDateTime(pojo.getSourceUpdatedAt()));
        }
        if (requested.contains(LAST_INGESTED_AT)) {
            fields.setLastIngestedAt(dateTimeMapper.mapUTCDateTime(pojo.getLastIngestedAt()));
        }
        if (requested.contains(DESCRIPTION)) {
            // The platform-authored text first, the source's when none was written (CTRIB-073 OQ1).
            fields.setDescription(StringUtils.isNotBlank(pojo.getInternalDescription())
                ? pojo.getInternalDescription()
                : StringUtils.defaultIfBlank(pojo.getExternalDescription(), null));
        }
        if (requested.contains(POPULARITY)) {
            fields.setViewCount(pojo.getViewCount());
        }
        if (requested.contains(TAGS)) {
            final List<TagPojo> tags = extras.tags().get(pojo.getId());
            if (tags != null && !tags.isEmpty()) {
                fields.setTags(tags.stream().map(tagMapper::mapToTag).toList());
            }
        }
        if (requested.contains(GROUPS)) {
            final Set<DataEntityPojo> parents = extras.parentGroups().get(pojo.getOddrn());
            if (parents != null && !parents.isEmpty()) {
                fields.setGroups(parents.stream().map(dataEntityMapper::mapRef).toList());
            }
        }

        final Map<DataEntityClassDto, DataEntityAttributes> attributes =
            Optional.ofNullable(dto.getSpecificAttributes()).orElse(Map.of());
        final Set<DataEntityClassDto> classes = DataEntityClassDto.findByIds(pojo.getEntityClassIds());

        if (classes.contains(DataEntityClassDto.DATA_SET)) {
            final DataSetAttributes dsa = (DataSetAttributes) attributes.get(DataEntityClassDto.DATA_SET);
            if (requested.contains(ROWS_COUNT) && dsa != null) {
                fields.setRowsCount(dsa.getRowsCount());
            }
            if (requested.contains(FIELDS_COUNT) && dsa != null) {
                fields.setFieldsCount(dsa.getFieldsCount());
            }
            if (requested.contains(CONSUMERS_COUNT)) {
                fields.setConsumersCount(extras.consumersCount().getOrDefault(pojo.getOddrn(), 0L));
            }
        }
        if (classes.contains(DataEntityClassDto.DATA_QUALITY_TEST) && requested.contains(SUITE_URL)) {
            final DataQualityTestAttributes dqta =
                (DataQualityTestAttributes) attributes.get(DataEntityClassDto.DATA_QUALITY_TEST);
            if (dqta != null) {
                fields.setSuiteUrl(StringUtils.defaultIfBlank(dqta.getSuiteUrl(), null));
            }
        }
        if (classes.contains(DataEntityClassDto.DATA_TRANSFORMER)) {
            final DataTransformerAttributes dta =
                (DataTransformerAttributes) attributes.get(DataEntityClassDto.DATA_TRANSFORMER);
            if (dta != null) {
                if (requested.contains(SOURCES)) {
                    fields.setSources(refs(dta.getSourceOddrnList(), extras));
                }
                if (requested.contains(TARGETS)) {
                    fields.setTargets(refs(dta.getTargetOddrnList(), extras));
                }
            }
        }
        if (classes.contains(DataEntityClassDto.DATA_CONSUMER) && requested.contains(INPUTS)) {
            final DataConsumerAttributes dca =
                (DataConsumerAttributes) attributes.get(DataEntityClassDto.DATA_CONSUMER);
            if (dca != null) {
                fields.setInputs(refs(dca.getInputListOddrn(), extras));
            }
        }
        if (classes.contains(DataEntityClassDto.DATA_INPUT) && requested.contains(OUTPUTS)) {
            final DataInputAttributes dia = (DataInputAttributes) attributes.get(DataEntityClassDto.DATA_INPUT);
            if (dia != null) {
                fields.setOutputs(refs(dia.getOutputListOddrn(), extras));
            }
        }
        if (classes.contains(DataEntityClassDto.DATA_ENTITY_GROUP) && requested.contains(ENTITIES_COUNT)) {
            // Direct members + nested child groups — the number the legacy Entities column showed (itemsCount).
            fields.setEntitiesCount(extras.groupMembersCount().getOrDefault(pojo.getOddrn(), 0L)
                + extras.groupChildrenCount().getOrDefault(pojo.getOddrn(), 0L));
        }
        return fields;
    }

    public AssetFields forTerm(final TermDto dto, final Set<AssetFieldDto> requested, final List<TagPojo> tags) {
        final TermPojo pojo = dto.getTermRefDto().getTerm();
        final AssetFields fields = new AssetFields();
        if (requested.contains(NAMESPACE) && dto.getTermRefDto().getNamespace() != null) {
            fields.setNamespace(namespaceMapper.mapPojo(dto.getTermRefDto().getNamespace()));
        }
        if (requested.contains(OWNERS) && dto.getOwnerships() != null && !dto.getOwnerships().isEmpty()) {
            fields.setOwners(ownershipMapper.mapTermDtos(dto.getOwnerships()));
        }
        if (requested.contains(CREATED_AT)) {
            fields.setCreatedAt(dateTimeMapper.mapUTCDateTime(pojo.getCreatedAt()));
        }
        if (requested.contains(UPDATED_AT)) {
            fields.setUpdatedAt(dateTimeMapper.mapUTCDateTime(pojo.getUpdatedAt()));
        }
        if (requested.contains(DESCRIPTION)) {
            fields.setDescription(StringUtils.defaultIfBlank(pojo.getDefinition(), null));
        }
        if (requested.contains(TAGS) && tags != null && !tags.isEmpty()) {
            fields.setTags(tags.stream().map(tagMapper::mapToTag).toList());
        }
        return fields;
    }

    public AssetFields forQueryExample(final QueryExamplePojo pojo, final Set<AssetFieldDto> requested) {
        final AssetFields fields = new AssetFields();
        if (requested.contains(CREATED_AT)) {
            fields.setCreatedAt(dateTimeMapper.mapUTCDateTime(pojo.getCreatedAt()));
        }
        if (requested.contains(UPDATED_AT)) {
            fields.setUpdatedAt(dateTimeMapper.mapUTCDateTime(pojo.getUpdatedAt()));
        }
        if (requested.contains(DESCRIPTION)) {
            fields.setDescription(StringUtils.defaultIfBlank(pojo.getDefinition(), null));
        }
        return fields;
    }

    /**
     * The refs of the lineage oddrns the resolver could load (a missing / hollow / deleted one is skipped); an
     * empty result is ABSENT ({@code null}), the same "no value" posture owners / tags / groups have — a list
     * property is either a non-empty list or not there.
     */
    private List<DataEntityRef> refs(final Collection<String> oddrns, final DataEntityExtras extras) {
        if (oddrns == null || oddrns.isEmpty()) {
            return null;
        }
        final List<DataEntityRef> refs = oddrns.stream()
            .distinct()
            .map(extras.lineageByOddrn()::get)
            .filter(Objects::nonNull)
            .map(dataEntityMapper::mapRef)
            .toList();
        return refs.isEmpty() ? null : refs;
    }
}
