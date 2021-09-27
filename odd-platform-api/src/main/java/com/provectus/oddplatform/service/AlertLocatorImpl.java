package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.AlertStatus;
import com.provectus.oddplatform.api.contract.model.AlertType;
import com.provectus.oddplatform.dto.DatasetStructureDelta;
import com.provectus.oddplatform.dto.IngestionTaskRun;
import com.provectus.oddplatform.model.tables.pojos.AlertPojo;
import com.provectus.oddplatform.model.tables.pojos.DatasetFieldPojo;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Data;
import lombok.RequiredArgsConstructor;
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
    public List<AlertPojo> locateDatasetBIS(final Map<String, DatasetStructureDelta> structureDeltas) {
        return structureDeltas.entrySet()
            .stream()
            .flatMap(this::locateAlertsInDelta)
            .collect(Collectors.toList());
    }

    @Override
    public List<AlertPojo> locateDQF(final List<IngestionTaskRun> taskRuns) {
        return taskRuns.stream()
            .filter(tr -> tr.getType().equals(IngestionTaskRun.IngestionTaskRunType.DATA_QUALITY_TEST_RUN))
            .filter(tr -> TASK_RUN_BAD_STATUSES.contains(tr.getStatus()))
            .map(tr -> buildAlert(
                tr.getDataEntityOddrn(),
                AlertType.FAILED_DQ_TEST,
                tr.getOddrn(),
                String.format("Failed DQ test: test %s failed with status %s", tr.getTaskName(), tr.getStatus())
            ))
            .collect(Collectors.toList());
    }

    private Stream<AlertPojo> locateAlertsInDelta(final Map.Entry<String, DatasetStructureDelta> e) {
        final Map<DatasetFieldKey, DatasetFieldPojo> latestVersionFields = e.getValue().getLatest()
            .stream()
            .collect(Collectors.toMap(f -> new DatasetFieldKey(f.getOddrn(), f.getType().data()), identity()));

        return e.getValue().getPenultimate()
            .stream()
            .filter(f -> !latestVersionFields.containsKey(new DatasetFieldKey(f.getOddrn(), f.getType().data())))
            .map(df -> buildAlert(
                e.getKey(),
                AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA,
                String.format("Backwards Incompatible schema: missing field: %s", df.getName()))
            )
            .filter(Objects::nonNull);
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
