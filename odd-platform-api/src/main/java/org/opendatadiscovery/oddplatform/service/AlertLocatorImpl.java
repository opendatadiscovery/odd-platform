package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.SetUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.AlertType;
import org.opendatadiscovery.oddplatform.dto.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.dto.DataEntityType;
import org.opendatadiscovery.oddplatform.dto.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;

import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
public class AlertLocatorImpl implements AlertLocator {
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
    public List<AlertPojo> locateDataQualityTestRunFailed(final List<IngestionTaskRun> taskRuns) {
        return taskRuns.stream()
            .filter(tr -> tr.getType().equals(IngestionTaskRun.IngestionTaskRunType.DATA_QUALITY_TEST_RUN))
            .filter(tr -> TASK_RUN_BAD_STATUSES.contains(tr.getStatus()))
            .map(tr -> buildAlert(
                tr.getDataEntityOddrn(),
                AlertType.FAILED_DQ_TEST,
                tr.getOddrn(),
                String.format("Test %s failed with status %s", tr.getTaskName(), tr.getStatus())
            ))
            .collect(Collectors.toList());
    }

    @Override
    public List<AlertPojo> locateEarlyBackIncSchema(final List<DataEntitySpecificAttributesDelta> deltas) {
        final Stream<AlertPojo> transformerAlerts = deltas.stream()
            .filter(d -> d.getDataEntityTypes().contains(DataEntityType.DATA_TRANSFORMER))
            .flatMap(this::locateAlertsInDTDelta);

        final Stream<AlertPojo> consumerAlerts = deltas.stream()
            .filter(d -> d.getDataEntityTypes().contains(DataEntityType.DATA_CONSUMER))
            .flatMap(this::locateAlertsInDCDelta);

        return Stream.concat(transformerAlerts, consumerAlerts).collect(Collectors.toList());
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
                AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Missing field: %s", df.getName()))
            )
            .filter(Objects::nonNull);
    }

    private Stream<AlertPojo> locateAlertsInDTDelta(final DataEntitySpecificAttributesDelta delta) {
        final DataTransformerAttributes oldAttr = extractDTAttributes(delta.getOldAttrsJson());
        final DataTransformerAttributes newAttr = extractDTAttributes(delta.getNewAttrsJson());

        final Stream<AlertPojo> sourceAlerts = SetUtils
            .difference(oldAttr.getSourceOddrnList(), newAttr.getSourceOddrnList())
            .stream()
            .map(source -> buildAlert(
                delta.getDataEntityOddrn(),
                AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Missing source: %s", source)
            ));

        final Stream<AlertPojo> targetAlerts = SetUtils
            .difference(oldAttr.getTargetOddrnList(), newAttr.getTargetOddrnList())
            .stream()
            .map(source -> buildAlert(
                delta.getDataEntityOddrn(),
                AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Missing target: %s", source)
            ));

        return Stream.concat(sourceAlerts, targetAlerts);
    }

    private Stream<AlertPojo> locateAlertsInDCDelta(final DataEntitySpecificAttributesDelta delta) {
        return SetUtils
            .difference(
                extractDCAttributes(delta.getOldAttrsJson()).getInputListOddrn(),
                extractDCAttributes(delta.getNewAttrsJson()).getInputListOddrn()
            )
            .stream()
            .map(source -> buildAlert(
                delta.getDataEntityOddrn(),
                AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Missing input: %s", source)
            ));
    }

    private DataTransformerAttributes extractDTAttributes(final String json) {
        final Map<DataEntityType, ?> specificAttributes =
            JSONSerDeUtils.deserializeJson(json, new TypeReference<Map<DataEntityType, ?>>() {
            });

        return JSONSerDeUtils.deserializeJson(
            specificAttributes.get(DataEntityType.DATA_TRANSFORMER),
            DataTransformerAttributes.class
        );
    }

    private DataConsumerAttributes extractDCAttributes(final String json) {
        final Map<DataEntityType, ?> specificAttributes =
            JSONSerDeUtils.deserializeJson(json, new TypeReference<Map<DataEntityType, ?>>() {
            });

        return JSONSerDeUtils.deserializeJson(
            specificAttributes.get(DataEntityType.DATA_CONSUMER),
            DataConsumerAttributes.class
        );
    }

    private AlertPojo buildAlert(final String dataEntityOddrn,
                                 final AlertType alertType,
                                 final String description) {
        return buildAlert(dataEntityOddrn, alertType, null, description);
    }

    private AlertPojo buildAlert(final String dataEntityOddrn,
                                 final AlertType alertType,
                                 final String messengerOddrn,
                                 final String description) {
        return new AlertPojo()
            .setDataEntityOddrn(dataEntityOddrn)
            .setDescription(description)
            .setMessengerEntityOddrn(messengerOddrn)
            .setType(alertType.getValue())
            .setStatus(AlertStatus.OPEN.getValue())
            .setStatusUpdatedAt(LocalDateTime.now());
    }

    @Data
    private static class DatasetFieldKey {
        private final String oddrn;
        private final String typeJson;
    }
}
