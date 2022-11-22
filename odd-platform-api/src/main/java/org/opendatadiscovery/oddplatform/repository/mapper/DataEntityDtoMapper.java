package org.opendatadiscovery.oddplatform.repository.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.attributes.DataEntityAttributes;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnershipPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.Collections.emptyMap;
import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toList;
import static org.jooq.impl.DSL.field;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_OWNERSHIP_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_OWNER_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_TAGS_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_TAGS_RELATION_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.AGG_TITLE_FIELD;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.DATA_ENTITY_CTE_NAME;
import static org.opendatadiscovery.oddplatform.repository.util.DataEntityQueryConfig.HAS_ALERTS_FIELD;

@Component
@RequiredArgsConstructor
public class DataEntityDtoMapper {
    private static final TypeReference<Map<String, ?>> SPECIFIC_ATTRIBUTES_TYPE_REFERENCE = new TypeReference<>() {
    };

    private final JooqRecordHelper jooqRecordHelper;

    public DataEntityDto mapDtoRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);

        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDto.builder()
            .dataEntity(dataEntity)
            .hasAlerts(r.get(field(HAS_ALERTS_FIELD), Boolean.TYPE))
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .build();
    }

    public DataEntityDimensionsDto mapDimensionRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDimensionsDto.dimensionsBuilder()
            .dataEntity(dataEntity)
            .hasAlerts(r.get(field(HAS_ALERTS_FIELD), Boolean.TYPE))
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .tags(extractTags(r))
            .build();
    }

    public DataEntityDetailsDto mapDetailsRecord(final Record r) {
        final Record deRecord = jooqRecordHelper.remapCte(r, DATA_ENTITY_CTE_NAME, DATA_ENTITY);
        final DataEntityPojo dataEntity = jooqRecordHelper.extractRelation(deRecord, DATA_ENTITY, DataEntityPojo.class);

        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(dataEntity)
            .hasAlerts(r.get(field(HAS_ALERTS_FIELD), Boolean.TYPE))
            .dataSource(jooqRecordHelper.extractRelation(r, DATA_SOURCE, DataSourcePojo.class))
            .specificAttributes(extractSpecificAttributes(dataEntity))
            .namespace(jooqRecordHelper.extractRelation(r, NAMESPACE, NamespacePojo.class))
            .ownership(extractOwnershipRelation(r))
            .tags(extractTags(r))
            .build();
    }

    private List<TagDto> extractTags(final Record r) {
        final Set<TagPojo> tagPojos = jooqRecordHelper.extractAggRelation(r, AGG_TAGS_FIELD, TagPojo.class);
        final Map<Long, TagToDataEntityPojo> tagRelations = jooqRecordHelper.extractAggRelation(r,
                AGG_TAGS_RELATION_FIELD, TagToDataEntityPojo.class).stream()
            .collect(Collectors.toMap(TagToDataEntityPojo::getTagId, identity()));
        return tagPojos.stream()
            .map(pojo -> new TagDto(pojo, null, tagRelations.get(pojo.getId()).getExternal()))
            .toList();
    }

    private List<OwnershipDto> extractOwnershipRelation(final Record r) {
        final Map<Long, OwnerPojo> ownerDict = jooqRecordHelper.extractAggRelation(r, AGG_OWNER_FIELD, OwnerPojo.class)
            .stream()
            .collect(Collectors.toMap(OwnerPojo::getId, identity()));

        final Map<Long, TitlePojo> titleDict = jooqRecordHelper.extractAggRelation(r, AGG_TITLE_FIELD, TitlePojo.class)
            .stream()
            .collect(Collectors.toMap(TitlePojo::getId, identity()));

        return jooqRecordHelper.extractAggRelation(r, AGG_OWNERSHIP_FIELD, OwnershipPojo.class)
            .stream()
            .map(os -> {
                final OwnerPojo owner = ownerDict.get(os.getOwnerId());
                if (owner == null) {
                    throw new IllegalArgumentException(
                        String.format("There's no owner with id %s found in ownerDict", os.getOwnerId()));
                }

                final TitlePojo title = titleDict.get(os.getTitleId());
                if (title == null) {
                    throw new IllegalArgumentException(
                        String.format("There's no title with id %s found in titleDict", os.getTitleId()));
                }

                return OwnershipDto.builder()
                    .ownership(os)
                    .owner(owner)
                    .title(title)
                    .build();
            })
            .collect(toList());
    }

    private Map<DataEntityClassDto, DataEntityAttributes> extractSpecificAttributes(final DataEntityPojo dataEntity
    ) {
        if (dataEntity.getHollow() || dataEntity.getSpecificAttributes() == null) {
            return emptyMap();
        }

        final Map<String, ?> specificAttributes = JSONSerDeUtils.deserializeJson(
            dataEntity.getSpecificAttributes().data(),
            SPECIFIC_ATTRIBUTES_TYPE_REFERENCE
        );

        return DataEntityClassDto.findByIds(dataEntity.getEntityClassIds())
            .stream()
            .map(t -> Pair.of(t, JSONSerDeUtils.deserializeJson(
                specificAttributes.get(t.toString()),
                DataEntityAttributes.TYPE_TO_ATTR_CLASS.get(t)
            )))
            .filter(p -> p.getRight() != null)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }
}
