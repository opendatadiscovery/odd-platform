package org.opendatadiscovery.oddplatform.repository.mapper;

import lombok.RequiredArgsConstructor;
import org.jooq.Record;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldTermsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.util.JooqRecordHelper;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.Tables.DATASET_FIELD;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_ENTITY;
import static org.opendatadiscovery.oddplatform.model.Tables.DATA_SOURCE;
import static org.opendatadiscovery.oddplatform.model.Tables.NAMESPACE;

@Component
@RequiredArgsConstructor
public class DatasetFieldTermsDtoMapper {
    public static final String DATASET_FIELD_CTE_NAME = "dataset_field_cte";

    private final JooqRecordHelper jooqRecordHelper;
    private final DataEntityDtoMapper dataEntityDtoMapper;

    public DatasetFieldTermsDto mapRecordToDto(final Record record) {
        final Record deRecord = jooqRecordHelper.remapCte(record, DATASET_FIELD_CTE_NAME, DATASET_FIELD);

        final DatasetFieldPojo datasetFieldPojo
            = jooqRecordHelper.extractRelation(deRecord, DATASET_FIELD, DatasetFieldPojo.class);

        final DataEntityPojo dataEntityPojo =
            jooqRecordHelper.extractRelation(record, DATA_ENTITY, DataEntityPojo.class);

        return DatasetFieldTermsDto.builder()
            .id(datasetFieldPojo.getId())
            .isKey(datasetFieldPojo.getIsKey())
            .name(datasetFieldPojo.getName())
            .internalName(datasetFieldPojo.getInternalName())
            .oddrn(datasetFieldPojo.getOddrn())
            .defaultValue(datasetFieldPojo.getDefaultValue())
            .internalDescription(datasetFieldPojo.getInternalDescription())
            .externalDescription(datasetFieldPojo.getExternalDescription())
            .isValue(datasetFieldPojo.getIsValue())
            .type(datasetFieldPojo.getType())
            .isSortKey(datasetFieldPojo.getIsSortKey())
            .isPrimaryKey(datasetFieldPojo.getIsPrimaryKey())
            .dataSource(jooqRecordHelper.extractRelation(record, DATA_SOURCE, DataSourcePojo.class))
            .ownership(dataEntityDtoMapper.extractOwnershipRelation(record))
            .namespace(jooqRecordHelper.extractRelation(record, NAMESPACE, NamespacePojo.class))
            .dataEntityName(dataEntityPojo.getExternalName())
            .dataEntityId(dataEntityPojo.getId())
            .build();
    }
}
