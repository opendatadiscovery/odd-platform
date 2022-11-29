package org.opendatadiscovery.oddplatform.service.ingestion.alert;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import org.apache.commons.collections4.MultiValuedMap;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.springframework.stereotype.Service;


@Service
public class AlertActionResolverImpl implements AlertActionResolver {
    @Override
    public Collection<AlertAction> resolveActions(final Map<String, Map<Short, AlertPojo>> alertState,
                                                  final MultiValuedMap<String, String> helperMap,
                                                  final List<IngestionTaskRun> runs) {
        final Map<String, PriorityQueue<IngestionTaskRun>> dtr = new HashMap<>();
        final Map<String, PriorityQueue<IngestionTaskRun>> dqt = new HashMap<>();

        for (final IngestionTaskRun run : runs) {
            switch (run.getType()) {
                case DATA_TRANSFORMER_RUN -> dtr.compute(run.getTaskOddrn(), (oddrn, queue) -> computeMap(run, queue));
                case DATA_QUALITY_TEST_RUN ->
                    // TODO: can NPE occur here?
                    helperMap.get(run.getTaskOddrn())
                        .forEach(datasetOddrn -> dqt.compute(datasetOddrn, (oddrn, queue) -> computeMap(run, queue)));
            }
        }

        final List<AlertAction> actions = new ArrayList<>();

        dtr.entrySet().stream()
            .map(e -> resolveActions(e.getKey(), e.getValue(), alertState.get(e.getKey()), AlertTypeEnum.FAILED_JOB))
            .forEach(actions::addAll);

        dqt.entrySet().stream()
            .map(
                e -> resolveActions(e.getKey(), e.getValue(), alertState.get(e.getKey()), AlertTypeEnum.FAILED_DQ_TEST))
            .forEach(actions::addAll);

        return actions;
    }

    private List<AlertAction> resolveActions(final String dataEntityOddrn,
                                             final PriorityQueue<IngestionTaskRun> taskRuns,
                                             final Map<Short, AlertPojo> alertDict,
                                             final AlertTypeEnum alertType) {
        final IngestionTaskRunAlertState state;
        if (alertDict == null) {
            state = new IngestionTaskRunAlertState(dataEntityOddrn);
        } else {
            final AlertPojo lastAlert = alertDict.get(alertType.getCode());

            state = lastAlert != null
                ? new IngestionTaskRunAlertState(dataEntityOddrn, lastAlert.getId())
                : new IngestionTaskRunAlertState(dataEntityOddrn);
        }

        taskRuns.forEach(state::report);
        return state.getActions();
    }

    // TODO: get rid of priority queue?
    private static PriorityQueue<IngestionTaskRun> computeMap(final IngestionTaskRun run,
                                                              final PriorityQueue<IngestionTaskRun> queue) {
        if (queue == null) {
            var q = new PriorityQueue<>(Comparator.comparing(IngestionTaskRun::getEndTime));
            q.add(run);
            return q;
        }

        queue.add(run);
        return queue;
    }
}
