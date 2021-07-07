package com.provectus.oddplatform.dto;

import com.provectus.oddplatform.ingestion.contract.model.DataEntity;
import com.provectus.oddplatform.ingestion.contract.model.DataSetField;
import com.provectus.oddplatform.utils.JSONSerDeUtils;
import com.provectus.oddplatform.utils.Pair;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static com.provectus.oddplatform.dto.DataEntityType.*;
import static java.util.Collections.emptyList;

@Data
@Builder
@AllArgsConstructor
@Slf4j
public class DataEntityIngestionDto {
    private final static List<Pair<Predicate<DataEntity>, DataEntityType>> TYPE_DICT_DISCRIMINATOR = List.of(
        Pair.of(de -> de.getDataset() != null, DATA_SET),
        Pair.of(de -> de.getDataTransformer() != null, DATA_TRANSFORMER),
        Pair.of(de -> de.getDataTransformerRun() != null, DATA_TRANSFORMER_RUN),
        Pair.of(de -> de.getDataConsumer() != null, DATA_CONSUMER)
    );

    private Long id;
    private String name;
    private String oddrn;
    private long dataSourceId;
    private String externalDescription;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Set<DataEntityType> types;
    private DataEntitySubtype subType;
    private Map<String, Object> metadata;

    private String parentDatasetOddrn;
    private List<DataSetField> fieldList;
    private String structureHash;
    private Long rowsCount;

    private List<String> sourceList;
    private List<String> targetList;

    private List<String> inputList;

    private String specificAttributes;

    public static DataEntityIngestionDto fromDataEntity(
        final long dataSourceId,
        final DataEntity dataEntity
    ) {
        // TODO: validate subtype
        final Set<DataEntityType> types = defineTypes(dataEntity);
        final DataEntitySubtype subType = DataEntitySubtype.valueOf(dataEntity.getType().toString());

        DataEntityIngestionDtoBuilder dtoBuilder = DataEntityIngestionDto.builder()
            .name(dataEntity.getName())
            .oddrn(dataEntity.getOddrn().toLowerCase())
            .externalDescription(dataEntity.getDescription())
            .dataSourceId(dataSourceId)
            .createdAt(dataEntity.getCreatedAt())
            .updatedAt(dataEntity.getUpdatedAt())
            .types(types)
            .subType(subType)
            .metadata(flattenMetadata(dataEntity.getMetadata().get(0).getMetadata()))
            .specificAttributes(specificAttributesAsString(types, dataEntity));

        if (types.contains(DATA_SET)) {
            final List<DataSetField> fieldList = dataEntity.getDataset().getFieldList();

            dtoBuilder = dtoBuilder
                .rowsCount(dataEntity.getDataset().getRowsNumber())
                .fieldList(fieldList)
                .structureHash(fieldList != null ? structureHash(fieldList) : null)
                .parentDatasetOddrn(dataEntity.getDataset().getParentOddrn());
        }

        if (types.contains(DATA_TRANSFORMER)) {
            final List<String> inputs = dataEntity.getDataTransformer().getInputs();
            final List<String> outputs = dataEntity.getDataTransformer().getOutputs();

            dtoBuilder = dtoBuilder
                .sourceList(inputs != null ? inputs : emptyList())
                .targetList(outputs != null ? outputs : emptyList());
        }

        if (types.contains(DATA_CONSUMER)) {
            final List<String> inputs = dataEntity.getDataConsumer().getInputs();

            dtoBuilder = dtoBuilder
                .inputList(inputs != null ? inputs : emptyList());
        }

        return dtoBuilder.build();
    }

    public static List<DataEntityIngestionDto> fromDataEntityList(final long dataSourceId,
                                                                  final List<DataEntity> dataEntityList) {
        return dataEntityList.stream()
            .map(e -> fromDataEntity(dataSourceId, e))
            .collect(Collectors.toList());
    }

    private static Set<DataEntityType> defineTypes(final DataEntity dataEntity) {
        final Set<DataEntityType> types = TYPE_DICT_DISCRIMINATOR.stream()
            .map(disc -> disc.getLeft().test(dataEntity) ? disc.getRight() : null)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        if (types.size() == 0) {
            throw new IllegalArgumentException("no supported type");
        }

        return types;
    }

    private static String structureHash(final List<DataSetField> fields) {
        final MessageDigest md;
        try {
            md = MessageDigest.getInstance("SHA-256");
        } catch (final NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        final StringBuilder sb = new StringBuilder();

        for (final byte b : md.digest(JSONSerDeUtils.serializeJson(fields).getBytes())) {
            sb.append(Integer.toString((b & 0xff) + 0x100, 16).substring(1));
        }

        return sb.toString();
    }

    private static Map<String, Object> flattenMetadata(final Map<String, Object> metadata) {
        return flattenMetadata(metadata, null);
    }

    private static Map<String, Object> flattenMetadata(final Map<String, Object> metadata, final String prefix) {
        final HashMap<String, Object> result = new HashMap<>();

        for (final var entry : metadata.entrySet()) {
            final String k = entry.getKey();
            final Object v = entry.getValue();
            final String p = prefix != null ? String.format("%s.%s", prefix, k) : k;
            if (v instanceof Map) {
                result.putAll(flattenMetadata((Map<String, Object>) v, p));
            } else {
                result.put(p, v);
            }
        }

        return result;
    }

    private static String specificAttributesAsString(final Collection<DataEntityType> types,
                                                     final DataEntity dataEntity) {
        return JSONSerDeUtils.serializeJson(defineSpecificAttributes(types, dataEntity));
    }

    private static Map<DataEntityType, Map<String, ?>> defineSpecificAttributes(
        final Collection<DataEntityType> types,
        final DataEntity dataEntity
    ) {
        return types.stream()
            .map(t -> defineSpecificAttributes(dataEntity, t))
            .filter(Objects::nonNull)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }

    private static Pair<DataEntityType, Map<String, ?>> defineSpecificAttributes(
        final DataEntity dataEntity,
        final DataEntityType type
    ) {
        switch (type) {
            case DATA_SET:
                return Pair.of(type, createMap(
                    Pair.of("rows_count", dataEntity.getDataset().getRowsNumber()),
                    Pair.of("fields_count", dataEntity.getDataset().getFieldList().size()),
                    Pair.of("consumers_count", 0)
                ));

            case DATA_TRANSFORMER:
                return Pair.of(type, createMap(
                    Pair.of("source_list", dataEntity.getDataTransformer().getInputs()),
                    Pair.of("target_list", dataEntity.getDataTransformer().getOutputs()),
                    Pair.of("source_code_url", dataEntity.getDataTransformer().getSourceCodeUrl())
                ));
            case DATA_CONSUMER:
                return Pair.of(type, createMap(
                    Pair.of("input_list", dataEntity.getDataConsumer().getInputs())
                ));

            default:
                return null;
        }
    }

    private static <K, V> Map<K, V> createMap(final Pair<K, V>... pairs) {
        return Arrays.stream(pairs)
            .filter(p -> p.getRight() != null && p.getLeft() != null)
            .collect(Collectors.toMap(Pair::getLeft, Pair::getRight));
    }
}
