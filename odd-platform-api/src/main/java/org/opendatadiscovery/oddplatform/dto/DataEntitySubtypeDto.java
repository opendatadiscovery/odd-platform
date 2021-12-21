package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;

import static java.util.function.Function.identity;

public enum DataEntitySubtypeDto {
    TABLE(1),
    FILE(2),
    FEATURE_GROUP(3),
    KAFKA_TOPIC(4),
    JOB(5),
    ML_EXPERIMENT(6),
    ML_MODEL_TRAINING(7),
    ML_MODEL_INSTANCE(8),
    DASHBOARD(9),
    ML_MODEL_ARTIFACT(10),
    VIEW(11),
    JOB_RUN(12),
    MICROSERVICE(13),
    API_CALL(16),
    DAG(17),
    GRAPH_NODE(18),
    DATABASE_SERVICE(19),
    API_SERVICE(20),
    KAFKA_SERVICE(21);

    @Getter
    private final int id;

    private static final Map<Integer, DataEntitySubtypeDto> MAP = Arrays
        .stream(DataEntitySubtypeDto.values())
        .collect(Collectors.toMap(DataEntitySubtypeDto::getId, identity()));

    DataEntitySubtypeDto(final int id) {
        this.id = id;
    }

    public static Optional<DataEntitySubtypeDto> findById(final int id) {
        return Optional.ofNullable(MAP.get(id));
    }
}
