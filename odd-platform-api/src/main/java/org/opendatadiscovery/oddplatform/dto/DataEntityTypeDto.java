package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;

import static java.util.Collections.emptySet;
import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.API_CALL;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.API_SERVICE;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.DAG;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.DASHBOARD;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.DATABASE_SERVICE;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.FEATURE_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.FILE;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.GRAPH_NODE;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.JOB;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.JOB_RUN;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.KAFKA_SERVICE;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.KAFKA_TOPIC;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.MICROSERVICE;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.ML_EXPERIMENT;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.ML_MODEL_ARTIFACT;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.ML_MODEL_INSTANCE;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.ML_MODEL_TRAINING;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.TABLE;
import static org.opendatadiscovery.oddplatform.dto.DataEntitySubtypeDto.VIEW;

@Getter
public enum DataEntityTypeDto {
    DATA_SET(1, Set.of(TABLE, FILE, FEATURE_GROUP, KAFKA_TOPIC, VIEW, GRAPH_NODE)),
    DATA_TRANSFORMER(2, Set.of(JOB, ML_MODEL_TRAINING, ML_MODEL_INSTANCE, VIEW, MICROSERVICE)),
    DATA_TRANSFORMER_RUN(3, JOB_RUN),
    DATA_QUALITY_TEST(4, JOB),
    DATA_QUALITY_TEST_RUN(5, JOB_RUN),
    DATA_CONSUMER(6, Set.of(ML_MODEL_ARTIFACT, DASHBOARD)),
    DATA_INPUT(7, API_CALL),
    DATA_ENTITY_GROUP(8, Set.of(ML_EXPERIMENT, DAG, DATABASE_SERVICE, API_SERVICE, KAFKA_SERVICE));

    private final int id;
    private final Set<DataEntitySubtypeDto> subtypes;

    private static final Map<Integer, DataEntityTypeDto> MAP = Arrays
        .stream(DataEntityTypeDto.values())
        .collect(Collectors.toMap(DataEntityTypeDto::getId, identity()));

    DataEntityTypeDto(final int id) {
        this(id, emptySet());
    }

    DataEntityTypeDto(final int id, final DataEntitySubtypeDto subtypes) {
        this(id, Set.of(subtypes));
    }

    DataEntityTypeDto(final int id, final Set<DataEntitySubtypeDto> subtypes) {
        this.id = id;
        this.subtypes = subtypes;
    }

    public static Optional<DataEntityTypeDto> findById(final int id) {
        return Optional.ofNullable(MAP.get(id));
    }

    public static Set<DataEntityTypeDto> findByIds(final Set<Integer> ids) {
        return MAP.values().stream()
            .filter(t -> ids.contains(t.id))
            .collect(Collectors.toSet());
    }

    public static Set<DataEntityTypeDto> findByIds(final Integer[] ids) {
        if (ids == null) {
            return emptySet();
        }

        return findByIds(Arrays.stream(ids).collect(Collectors.toSet()));
    }
}
