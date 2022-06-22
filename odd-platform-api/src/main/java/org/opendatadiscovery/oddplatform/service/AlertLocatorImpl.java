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
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.repository.DataQualityTestRelationRepository;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
public class AlertLocatorImpl implements AlertLocator {
    private final DataQualityTestRelationRepository dataQualityTestRelationRepository;

    private static final Set<IngestionTaskRun.IngestionTaskRunStatus> TASK_RUN_BAD_STATUSES = Set.of(
        IngestionTaskRun.IngestionTaskRunStatus.BROKEN,
        IngestionTaskRun.IngestionTaskRunStatus.FAILED
    );

    @Override
    public List<AlertPojo> locateDatasetBackIncSchema(final Map<String, DatasetStructureDelta> structureDeltas) {
        return structureDeltas.entrySet()
            .stream()
            .flatMap(this::locateAlertsInDSDelta)
            .collect(Collectors.toList());
    }

    @Override
    public List<AlertPojo> locateDataEntityRunFailed(final List<IngestionTaskRun> taskRuns) {
        final Map<IngestionTaskRun.IngestionTaskRunType, List<IngestionTaskRun>> failedTaskRunsMap = taskRuns.stream()
            .filter(tr -> TASK_RUN_BAD_STATUSES.contains(tr.getStatus()))
            .collect(Collectors.groupingBy(IngestionTaskRun::getType));
        if (failedTaskRunsMap.isEmpty()) {
            return List.of();
        }
        final List<AlertPojo> dqAlerts = locateDataQualityTestAlerts(
            failedTaskRunsMap.get(IngestionTaskRun.IngestionTaskRunType.DATA_QUALITY_TEST_RUN));
        final List<AlertPojo> jobAlerts = locateDataTransformerAlerts(
            failedTaskRunsMap.get(IngestionTaskRun.IngestionTaskRunType.DATA_TRANSFORMER_RUN));
        return Stream.concat(dqAlerts.stream(), jobAlerts.stream()).toList();
    }

    @Override
    public List<AlertPojo> locateEarlyBackIncSchema(final List<DataEntitySpecificAttributesDelta> deltas) {
        final Stream<AlertPojo> transformerAlerts = deltas.stream()
            .filter(d -> d.entityClasses().contains(DataEntityClassDto.DATA_TRANSFORMER))
            .flatMap(this::locateAlertsInDTDelta);

        final Stream<AlertPojo> consumerAlerts = deltas.stream()
            .filter(d -> d.entityClasses().contains(DataEntityClassDto.DATA_CONSUMER))
            .flatMap(this::locateAlertsInDCDelta);

        return Stream.concat(transformerAlerts, consumerAlerts).collect(Collectors.toList());
    }

    private List<AlertPojo> locateDataTransformerAlerts(final List<IngestionTaskRun> failedDataTransformerRuns) {
        if (CollectionUtils.isEmpty(failedDataTransformerRuns)) {
            return List.of();
        }
        return failedDataTransformerRuns.stream()
            .map(tr -> buildAlert(
                tr.getDataEntityOddrn(),
                AlertTypeEnum.FAILED_JOB,
                tr.getOddrn(),
                String.format("Job %s failed with status %s", tr.getTaskName(), tr.getStatus())
            )).toList();
    }

    private List<AlertPojo> locateDataQualityTestAlerts(final List<IngestionTaskRun> failedDQTestRuns) {
        if (CollectionUtils.isEmpty(failedDQTestRuns)) {
            return List.of();
        }
        final Map<String, List<DataQualityTestRelationsPojo>> relationsMap = dataQualityTestRelationRepository
            .getRelations(failedDQTestRuns.stream().map(IngestionTaskRun::getDataEntityOddrn).toList())
            .stream()
            .collect(Collectors.groupingBy(DataQualityTestRelationsPojo::getDataQualityTestOddrn));
        return failedDQTestRuns.stream()
            .flatMap(tr -> {
                final List<DataQualityTestRelationsPojo> relatedPojos =
                    relationsMap.getOrDefault(tr.getDataEntityOddrn(), List.of());
                return relatedPojos.stream().map(p -> buildAlert(
                    p.getDatasetOddrn(),
                    AlertTypeEnum.FAILED_DQ_TEST,
                    tr.getOddrn(),
                    String.format("Test %s failed with status %s", tr.getTaskName(), tr.getStatus())
                ));
            }).toList();
    }

    private Stream<AlertPojo> locateAlertsInDSDelta(final Map.Entry<String, DatasetStructureDelta> e) {
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
