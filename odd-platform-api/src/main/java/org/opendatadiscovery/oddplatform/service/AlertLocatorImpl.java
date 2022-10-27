package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.SetUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityTestRelationRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyList;
import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunStatus;
import static org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunType;

@Component
@RequiredArgsConstructor
public class AlertLocatorImpl implements AlertLocator {
    private final DatasetStructureService datasetStructureService;

    private final ReactiveDataQualityTestRelationRepository dataQualityTestRelationRepository;

    private static final Set<IngestionTaskRunStatus> TASK_RUN_BAD_STATUSES = Set.of(
        IngestionTaskRunStatus.BROKEN,
        IngestionTaskRunStatus.FAILED
    );

    @Override
    public Flux<AlertPojo> locateAlerts(final IngestionRequest request) {
        return Mono.fromCallable(() -> request.getExistingEntities()
                .stream()
                .filter(dto -> BooleanUtils.isTrue(dto.getDatasetSchemaChanged()))
                .map(EnrichedDataEntityIngestionDto::getId)
                .toList())
            .flatMapMany(changedDatasetIds -> Flux.concat(
                locateDataEntityRunFailed(request.getTaskRuns()),
                locateBackIncSchemaChanged(changedDatasetIds, request.getSpecificAttributesDeltas())
            ));
    }

    public Flux<AlertPojo> locateBackIncSchemaChanged(final List<Long> changedDatasetIds,
                                                      final List<DataEntitySpecificAttributesDelta> deltas) {
        if (CollectionUtils.isEmpty(changedDatasetIds)) {
            return Flux.just();
        }

        final Flux<AlertPojo> datasetAlerts = datasetStructureService
            .getLastDatasetStructureVersionDelta(changedDatasetIds)
            .flatMapMany(delta -> Flux.fromStream(delta.entrySet()
                .stream()
                .flatMap(this::locateAlertsInDSDelta)));

        final Flux<AlertPojo> transformerAlerts = Flux.fromStream(deltas.stream()
            .filter(d -> d.entityClasses().contains(DataEntityClassDto.DATA_TRANSFORMER))
            .flatMap(this::locateAlertsInDTDelta));

        final Flux<AlertPojo> consumerAlerts = Flux.fromStream(deltas.stream()
            .filter(d -> d.entityClasses().contains(DataEntityClassDto.DATA_CONSUMER))
            .flatMap(this::locateAlertsInDCDelta));

        return Flux.concat(datasetAlerts, transformerAlerts, consumerAlerts);
    }

    private Flux<AlertPojo> locateDataEntityRunFailed(final List<IngestionTaskRun> taskRuns) {
        final Map<IngestionTaskRunType, List<IngestionTaskRun>> failedTaskRunsMap = taskRuns.stream()
            .filter(tr -> TASK_RUN_BAD_STATUSES.contains(tr.getStatus()))
            .collect(Collectors.groupingBy(IngestionTaskRun::getType));

        if (failedTaskRunsMap.isEmpty()) {
            return Flux.just();
        }

        return Flux.concat(
            locateDataQualityTestAlerts(failedTaskRunsMap.get(IngestionTaskRunType.DATA_QUALITY_TEST_RUN)),
            locateDataTransformerAlerts(failedTaskRunsMap.get(IngestionTaskRunType.DATA_TRANSFORMER_RUN))
        );
    }

    private Flux<AlertPojo> locateDataTransformerAlerts(final List<IngestionTaskRun> failedDataTransformerRuns) {
        if (CollectionUtils.isEmpty(failedDataTransformerRuns)) {
            return Flux.just();
        }

        return Flux.fromStream(failedDataTransformerRuns.stream().map(tr -> buildAlert(
            tr.getTaskOddrn(),
            AlertTypeEnum.FAILED_JOB,
            tr.getOddrn(),
            String.format("Job %s failed with status %s", tr.getTaskRunName(), tr.getStatus())
        )));
    }

    private Flux<AlertPojo> locateDataQualityTestAlerts(final List<IngestionTaskRun> failedDQTestRuns) {
        if (CollectionUtils.isEmpty(failedDQTestRuns)) {
            return Flux.just();
        }

        final List<String> failedDQTestRunOddrns =
            failedDQTestRuns.stream().map(IngestionTaskRun::getTaskOddrn).toList();

        return dataQualityTestRelationRepository.getRelations(failedDQTestRunOddrns)
            .collect(Collectors.groupingBy(DataQualityTestRelationsPojo::getDataQualityTestOddrn))
            .flatMapMany(relationsMap -> Flux.fromStream(failedDQTestRuns.stream()
                .flatMap(tr -> {
                    final List<DataQualityTestRelationsPojo> relatedPojos =
                        relationsMap.getOrDefault(tr.getTaskOddrn(), emptyList());

                    return relatedPojos.stream().map(p -> buildAlert(
                        p.getDatasetOddrn(),
                        AlertTypeEnum.FAILED_DQ_TEST,
                        tr.getOddrn(),
                        String.format("Test %s failed with status %s", tr.getTaskRunName(), tr.getStatus())
                    ));
                })));
    }

    private Stream<AlertPojo> locateAlertsInDSDelta(final Map.Entry<String, DatasetStructureDelta> e) {
        if (CollectionUtils.isEmpty(e.getValue().getPenultimate())) {
            return Stream.empty();
        }

        final Map<DatasetFieldKey, DatasetFieldPojo> latestVersionFields = e.getValue().getLatest()
            .stream()
            .collect(Collectors.toMap(f -> new DatasetFieldKey(f.getOddrn(), f.getType().data()), identity()));

        return e.getValue().getPenultimate()
            .stream()
            .filter(f -> !latestVersionFields.containsKey(new DatasetFieldKey(f.getOddrn(), f.getType().data())))
            .map(df -> buildAlert(
                e.getKey(),
                AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Missing field: %s", df.getName()))
            )
            .filter(Objects::nonNull);
    }

    private Stream<AlertPojo> locateAlertsInDTDelta(final DataEntitySpecificAttributesDelta delta) {
        final DataTransformerAttributes oldAttr = extractDTAttributes(delta.oldAttrsJson());
        final DataTransformerAttributes newAttr = extractDTAttributes(delta.newAttrsJson());

        final Stream<AlertPojo> sourceAlerts = SetUtils
            .difference(oldAttr.getSourceOddrnList(), newAttr.getSourceOddrnList())
            .stream()
            .map(source -> buildAlert(
                delta.oddrn(),
                AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Missing source: %s", source)
            ));

        final Stream<AlertPojo> targetAlerts = SetUtils
            .difference(oldAttr.getTargetOddrnList(), newAttr.getTargetOddrnList())
            .stream()
            .map(source -> buildAlert(
                delta.oddrn(),
                AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Missing target: %s", source)
            ));

        return Stream.concat(sourceAlerts, targetAlerts);
    }

    private Stream<AlertPojo> locateAlertsInDCDelta(final DataEntitySpecificAttributesDelta delta) {
        return SetUtils
            .difference(
                extractDCAttributes(delta.oldAttrsJson()).getInputListOddrn(),
                extractDCAttributes(delta.newAttrsJson()).getInputListOddrn()
            )
            .stream()
            .map(source -> buildAlert(
                delta.oddrn(),
                AlertTypeEnum.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Missing input: %s", source)
            ));
    }

    private DataTransformerAttributes extractDTAttributes(final String json) {
        final Map<DataEntityClassDto, ?> specificAttributes =
            JSONSerDeUtils.deserializeJson(json, new TypeReference<Map<DataEntityClassDto, ?>>() {
            });

        return JSONSerDeUtils.deserializeJson(
            specificAttributes.get(DataEntityClassDto.DATA_TRANSFORMER),
            DataTransformerAttributes.class
        );
    }

    private DataConsumerAttributes extractDCAttributes(final String json) {
        final Map<DataEntityClassDto, ?> specificAttributes =
            JSONSerDeUtils.deserializeJson(json, new TypeReference<Map<DataEntityClassDto, ?>>() {
            });

        return JSONSerDeUtils.deserializeJson(
            specificAttributes.get(DataEntityClassDto.DATA_CONSUMER),
            DataConsumerAttributes.class
        );
    }

    private AlertPojo buildAlert(final String dataEntityOddrn,
                                 final AlertTypeEnum alertType,
                                 final String description) {
        return buildAlert(dataEntityOddrn, alertType, null, description);
    }

    private AlertPojo buildAlert(final String dataEntityOddrn,
                                 final AlertTypeEnum alertType,
                                 final String messengerOddrn,
                                 final String description) {
        return new AlertPojo()
            .setDataEntityOddrn(dataEntityOddrn)
            .setDescription(description)
            .setMessengerEntityOddrn(messengerOddrn)
            .setType(alertType.name())
            .setStatus(AlertStatusEnum.OPEN.name())
            .setStatusUpdatedAt(LocalDateTime.now());
    }

    private record DatasetFieldKey(String oddrn, String typeJson) {
    }
}
