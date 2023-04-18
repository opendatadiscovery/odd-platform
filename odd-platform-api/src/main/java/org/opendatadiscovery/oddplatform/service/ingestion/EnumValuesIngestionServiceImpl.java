package org.opendatadiscovery.oddplatform.service.ingestion;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.EnumValueDto;
import org.opendatadiscovery.oddplatform.dto.EnumValueOrigin;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldEnumValue;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DatasetFieldIngestionDto;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnumValuesIngestionServiceImpl implements EnumValuesIngestionService {
    private final ReactiveEnumValueRepository enumValueRepository;

    @Override
    public Mono<Void> ingestEnumValues(final IngestionRequest request) {
        final Map<String, DatasetFieldIngestionDto> requestState = request.getAllEntities()
            .stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .flatMap(entity -> entity.getDataSet().fieldList().stream())
            .collect(toMap(field -> field.field().getOddrn(), identity()));

        return enumValueRepository.getEnumState(requestState.keySet())
            .collectMap(EnumValueDto::fieldOddrn)
            .map(existingState -> prepareAccumulator(requestState, existingState))
            .flatMap(acc -> acc.apply(enumValueRepository));
    }

    private EnumValueStateAccumulator prepareAccumulator(final Map<String, DatasetFieldIngestionDto> requestState,
                                                         final Map<String, EnumValueDto> existingState) {
        final EnumValueStateAccumulator accumulator = new EnumValueStateAccumulator();

        for (final var reqStateEntry : requestState.entrySet()) {
            final List<DataSetFieldEnumValue> reqEnumValues = reqStateEntry.getValue().enumValues();

            if (CollectionUtils.isEmpty(reqEnumValues)) {
                continue;
            }

            final var curEnumValues = existingState.get(reqStateEntry.getKey()).enumValues();
            final long datasetFieldId = existingState.get(reqStateEntry.getKey()).fieldId();

            if (CollectionUtils.isEmpty(curEnumValues)) {
                final List<EnumValuePojo> enumValues = reqEnumValues
                    .stream()
                    .map(ev -> createPojo(ev, datasetFieldId))
                    .toList();

                accumulator.addToCreate(enumValues);
            } else {
                accumulator.addToDelete(forDelete(curEnumValues, reqEnumValues));
                accumulator.addToCreate(forCreate(curEnumValues, reqEnumValues));
                accumulator.addToUpdate(forUpdate(curEnumValues, reqEnumValues));
            }
        }

        return accumulator;
    }

    private List<EnumValuePojo> forCreate(final List<EnumValuePojo> cur, final List<DataSetFieldEnumValue> req) {
        final Set<String> curEnumValues = cur.stream().map(EnumValuePojo::getName).collect(Collectors.toSet());
        final long datasetFieldId = cur.stream().map(EnumValuePojo::getDatasetFieldId).findFirst().orElseThrow();

        return req.stream()
            .filter(ev -> !curEnumValues.contains(ev.getName()))
            .map(ev -> createPojo(ev, datasetFieldId))
            .toList();
    }

    private List<Long> forDelete(final List<EnumValuePojo> cur, final List<DataSetFieldEnumValue> req) {
        final Set<String> requestEnumValues = req.stream()
            .map(DataSetFieldEnumValue::getName)
            .collect(Collectors.toSet());

        return cur.stream()
            .filter(ev -> !requestEnumValues.contains(ev.getName()))
            .map(EnumValuePojo::getId)
            .toList();
    }

    private Map<Long, String> forUpdate(final List<EnumValuePojo> cur, final List<DataSetFieldEnumValue> req) {
        final Map<String, DataSetFieldEnumValue> reqDirectory = req
            .stream()
            .collect(toMap(DataSetFieldEnumValue::getName, identity()));

        return cur.stream()
            .map(ev -> Pair.of(ev, reqDirectory.get(ev.getName())))
            .filter(p -> p.getRight() != null)
            .filter(p -> StringUtils.isNotEmpty(p.getRight().getDescription()))
            .filter(p -> !p.getRight().getDescription().equals(p.getLeft().getExternalDescription()))
            .collect(Collectors.toMap(p -> p.getLeft().getId(), p -> p.getRight().getDescription()));
    }

    private EnumValuePojo createPojo(final DataSetFieldEnumValue enumValue, final long datasetFieldId) {
        return new EnumValuePojo()
            .setName(enumValue.getName())
            .setExternalDescription(StringUtils.defaultIfBlank(enumValue.getDescription(), null))
            .setDatasetFieldId(datasetFieldId)
            .setOrigin(EnumValueOrigin.EXTERNAL.getCode());
    }

    private static class EnumValueStateAccumulator {
        private final List<EnumValuePojo> entitiesToCreate = new ArrayList<>();
        private final List<Long> entitiesToDelete = new ArrayList<>();
        private final Map<Long, String> idsToUpdate = new HashMap<>();

        void addToCreate(final List<EnumValuePojo> entities) {
            this.entitiesToCreate.addAll(entities);
        }

        void addToUpdate(final Map<Long, String> entities) {
            this.idsToUpdate.putAll(entities);
        }

        void addToDelete(final List<Long> ids) {
            this.entitiesToDelete.addAll(ids);
        }

        Mono<Void> apply(final ReactiveEnumValueRepository repo) {
            return Flux.merge(
                    repo.bulkCreate(entitiesToCreate),
                    repo.delete(entitiesToDelete),
                    repo.updateDescriptions(idsToUpdate, true)
                )
                .then();
        }
    }
}