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
        IngestionTaskRun.IngestionTaskRunStatus.FAILED,
        IngestionTaskRun.IngestionTaskRunStatus.UNKNOWN
    );

    @Override
    public List<AlertPojo> locateDatasetBIS(final Map<String, DatasetStructureDelta> structureDeltas) {
        return structureDeltas.entrySet()
            .stream()
            .flatMap(this::mapAlerts)
            .collect(Collectors.toList());
    }

    @Override
    public List<AlertPojo> locateDQF(final List<IngestionTaskRun> taskRuns) {
        return taskRuns.stream()
            .filter(tr -> tr.getType().equals(IngestionTaskRun.IngestionTaskRunType.DATA_QUALITY_TEST_RUN))
            .filter(tr -> TASK_RUN_BAD_STATUSES.contains(tr.getStatus()))
            .map(tr -> new AlertPojo()
                .setDataEntityOddrn(tr.getDataEntityOddrn())
                .setDescription(
                    String.format("Failed DQ test: test %s failed with status %s", tr.getName(), tr.getStatus()))
                .setType(AlertType.FAILED_DQ_TEST.getValue())
                .setStatus(AlertStatus.OPEN.getValue())
                .setStatusUpdatedAt(LocalDateTime.now()))
            .collect(Collectors.toList());
    }

    private Stream<AlertPojo> mapAlerts(final Map.Entry<String, DatasetStructureDelta> e) {
        final Map<DatasetFieldKey, DatasetFieldPojo> latestVersionFields = e.getValue().getLatest()
            .stream()
            .collect(Collectors.toMap(f -> new DatasetFieldKey(f.getOddrn(), f.getType().data()), identity()));

        return e.getValue().getPenultimate()
            .stream()
            .filter(f -> !latestVersionFields.containsKey(new DatasetFieldKey(f.getOddrn(), f.getType().data())))
            .map(df -> new AlertPojo()
                .setDataEntityOddrn(e.getKey())
                .setDescription(String.format("Backwards Incompatible schema: missing field: %s", df.getName()))
                .setType(AlertType.BACKWARDS_INCOMPATIBLE_SCHEMA.getValue())
                .setStatus(AlertStatus.OPEN.getValue())
                .setStatusUpdatedAt(LocalDateTime.now()))
            .filter(Objects::nonNull);
    }

    @Data
    private static class DatasetFieldKey {
        private final String oddrn;
        private final String typeJson;
    }
}
