package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;

import static java.util.function.Function.identity;

@RequiredArgsConstructor
public enum DataEntityTypeDto {
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
    KAFKA_SERVICE(21),
    DOMAIN(22),
    VECTOR_STORE(23),
    LOOKUP_TABLE(24),
    ENTITY_RELATIONSHIP(25),
    GRAPH_RELATIONSHIP(26);

    private static final Map<Integer, DataEntityTypeDto> MAP = Arrays
        .stream(DataEntityTypeDto.values())
        .collect(Collectors.toMap(DataEntityTypeDto::getId, identity()));
    @Getter
    private final int id;

    public String resolveName() {
        return Arrays.stream(name().split("_"))
            .map(String::toLowerCase)
            .map(StringUtils::capitalize)
            .collect(Collectors.joining(" "));
    }

    public static Optional<DataEntityTypeDto> findById(final int id) {
        return Optional.ofNullable(MAP.get(id));
    }
}
