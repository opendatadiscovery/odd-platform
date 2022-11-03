package org.opendatadiscovery.oddplatform.dto;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;

import static java.util.Collections.emptySet;
import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.API_CALL;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.API_SERVICE;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.DAG;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.DASHBOARD;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.DATABASE_SERVICE;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.DOMAIN;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.FEATURE_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.FILE;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.GRAPH_NODE;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.JOB;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.JOB_RUN;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.KAFKA_SERVICE;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.KAFKA_TOPIC;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.MICROSERVICE;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.ML_EXPERIMENT;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.ML_MODEL_ARTIFACT;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.ML_MODEL_INSTANCE;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.ML_MODEL_TRAINING;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.TABLE;
import static org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto.VIEW;

@Getter
public enum DataEntityClassDto {
    DATA_SET(1, Set.of(TABLE, FILE, FEATURE_GROUP, KAFKA_TOPIC, VIEW, GRAPH_NODE)),
    DATA_TRANSFORMER(2, Set.of(JOB, ML_MODEL_TRAINING, ML_MODEL_INSTANCE, VIEW, MICROSERVICE)),
    DATA_TRANSFORMER_RUN(3, JOB_RUN),
    DATA_QUALITY_TEST(4, JOB),
    DATA_QUALITY_TEST_RUN(5, JOB_RUN),
    DATA_CONSUMER(6, Set.of(ML_MODEL_ARTIFACT, DASHBOARD)),
    DATA_INPUT(7, API_CALL),
    DATA_ENTITY_GROUP(8, Set.of(ML_EXPERIMENT, DAG, DATABASE_SERVICE, API_SERVICE, KAFKA_SERVICE, DOMAIN));

    private static final Map<Integer, DataEntityClassDto> MAP = Arrays.stream(DataEntityClassDto.values())
        .collect(Collectors.toMap(DataEntityClassDto::getId, identity()));
    private final int id;
    private final Set<DataEntityTypeDto> types;

    DataEntityClassDto(final int id, final DataEntityTypeDto types) {
        this(id, Set.of(types));
    }

    DataEntityClassDto(final int id, final Set<DataEntityTypeDto> types) {
        this.id = id;
        this.types = types;
    }

    public static Optional<DataEntityClassDto> findById(final int id) {
        return Optional.ofNullable(MAP.get(id));
    }

    public static Set<DataEntityClassDto> findByIds(final Set<Integer> ids) {
        return MAP.values().stream()
            .filter(t -> ids.contains(t.id))
            .collect(Collectors.toSet());
    }

    public static Set<DataEntityClassDto> findByIds(final Integer[] ids) {
        if (ids == null) {
            return emptySet();
        }

        return findByIds(Arrays.stream(ids).collect(Collectors.toSet()));
    }

    public String resolveName() {
        return Stream.of(name().split("_"))
            .map(String::toLowerCase)
            .map(StringUtils::capitalize)
            .collect(Collectors.joining(" "));
    }
}
