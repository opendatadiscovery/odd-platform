package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MultiMapUtils;
import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.SetValuedMap;
import org.apache.commons.collections4.multimap.HashSetValuedHashMap;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.AlertHaltConfigRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityTestRelationRepository;
import org.opendatadiscovery.oddplatform.service.AlertLocator;
import org.opendatadiscovery.oddplatform.service.AlertService;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertActionResolver;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertActionResolverFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuples;

import static java.util.Collections.emptyMap;
import static org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto.DataQualityTestIngestionDto;
import static org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun.IngestionTaskRunType;
import static reactor.function.TupleUtils.function;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveDataQualityTestRelationRepository dataQualityTestRelationRepository;
    private final AlertActionResolverFactory alertActionResolverFactory;
    private final AlertHaltConfigRepository alertHaltConfigRepository;
    private final AlertLocator alertLocator;
    private final AlertService alertService;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        return Mono.defer(() -> getAlertStateSnapshotKey(request))
            .flatMap(stateSnapshotKey -> alertService
                .getOpenAlertsForEntities(stateSnapshotKey.dataEntityOddrns())
                .zipWith(alertHaltConfigRepository.getByOddrns(stateSnapshotKey.dataEntityOddrns()))
                .map(function((openAlerts, haltConfigs) -> Tuples.of(
                    alertActionResolverFactory.create(openAlerts, haltConfigs),
                    stateSnapshotKey.dqtToDataset()
                ))))
            .flatMapMany(function((alertActionResolver, dqtToDatasets) -> alertLocator
                .getAlertBISCandidates(request.getSpecificAttributesDeltas(), request.getChangedDatasetIds())
                .collectList()
                .flatMapMany(candidates -> Flux.fromStream(alertActionResolver.resolveActions(candidates)))
                .mergeWith(actionsForIngestionTaskRuns(alertActionResolver, request.getTaskRuns(), dqtToDatasets))))
            .collectList()
            .flatMap(alertService::applyAlertActions);
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return CollectionUtils.isNotEmpty(request.getTaskRuns())
            || CollectionUtils.isNotEmpty(request.getExistingEntities());
    }

    @Override
    public IngestionProcessingPhase getPhase() {
        return IngestionProcessingPhase.FINALIZING;
    }

    private Mono<AlertStateSnapshotKey> getAlertStateSnapshotKey(final IngestionRequest request) {
        if (CollectionUtils.isEmpty(request.getTaskRuns())) {
            return CollectionUtils.isNotEmpty(request.getChangedDatasetOddrns())
                ? Mono.fromCallable(request::getChangedDatasetOddrns).map(AlertStateSnapshotKey::fromOddrns)
                : Mono.empty();
        }

        final Set<String> alertDEOddrns = new HashSet<>(request.getChangedDatasetOddrns());
        final Set<String> dqtOddrnsInIR = new HashSet<>();
        final MultiValuedMap<String, String> dqtToDatasets = MultiMapUtils.newSetValuedHashMap();

        for (final IngestionTaskRun taskRun : request.getTaskRuns()) {
            switch (taskRun.getType()) {
                case DATA_TRANSFORMER_RUN -> alertDEOddrns.add(taskRun.getTaskOddrn());
                case DATA_QUALITY_TEST_RUN -> dqtOddrnsInIR.add(taskRun.getTaskOddrn());
            }
        }

        // Trying to map data quality test runs to target datasets using information from IngestionRequest
        for (final EnrichedDataEntityIngestionDto entity : request.getAllEntities()) {
            final DataQualityTestIngestionDto dataQualityTest = entity.getDataQualityTest();

            if (dataQualityTest != null) {
                if (dqtOddrnsInIR.remove(entity.getOddrn())) {
                    alertDEOddrns.addAll(dataQualityTest.datasetList());
                    dqtToDatasets.putAll(entity.getOddrn(), dataQualityTest.datasetList());
                }
            }
        }

        if (dqtOddrnsInIR.isEmpty()) {
            return Mono.just(new AlertStateSnapshotKey(alertDEOddrns, dqtToDatasets.asMap()));
        }

        // if IR doesn't contain information for all test runs, fetch missing data from database
        return dataQualityTestRelationRepository.getRelations(dqtOddrnsInIR)
            .collectList()
            .map(relations -> {
                final SetValuedMap<String, String> dqt = new HashSetValuedHashMap<>(dqtToDatasets);
                final Set<String> dataEntityOddrns = new HashSet<>(alertDEOddrns);
                for (final DataQualityTestRelationsPojo relation : relations) {
                    dqt.put(relation.getDataQualityTestOddrn(), relation.getDatasetOddrn());
                    dataEntityOddrns.add(relation.getDatasetOddrn());
                }

                return new AlertStateSnapshotKey(dataEntityOddrns, dqt.asMap());
            });
    }

    private Flux<AlertAction> actionsForIngestionTaskRuns(final AlertActionResolver alertActionResolver,
                                                          final List<IngestionTaskRun> taskRuns,
                                                          final Map<String, Collection<String>> dqtToDatasets) {
        if (CollectionUtils.isEmpty(taskRuns)) {
            return Flux.just();
        }

        final Map<String, List<IngestionTaskRun>> dtr = new HashMap<>();
        final Map<String, List<IngestionTaskRun>> dqt = new HashMap<>();

        for (final IngestionTaskRun run : taskRuns) {
            switch (run.getType()) {
                case DATA_TRANSFORMER_RUN -> dtr.compute(run.getTaskOddrn(), (oddrn, list) -> computeList(run, list));
                case DATA_QUALITY_TEST_RUN -> dqtToDatasets.get(run.getTaskOddrn()).forEach(
                    datasetOddrn -> dqt.compute(datasetOddrn, (oddrn, list) -> computeList(run, list)));
            }
        }

        return Flux.fromStream(Stream.concat(
            alertActionResolver.resolveActions(dqt, IngestionTaskRunType.DATA_QUALITY_TEST_RUN),
            alertActionResolver.resolveActions(dtr, IngestionTaskRunType.DATA_TRANSFORMER_RUN)
        ));
    }

    private List<IngestionTaskRun> computeList(final IngestionTaskRun run,
                                               final List<IngestionTaskRun> list) {
        if (list == null) {
            final ArrayList<IngestionTaskRun> newList = new ArrayList<>();
            newList.add(run);
            return newList;
        }

        list.add(run);
        return list;
    }

    private record AlertStateSnapshotKey(Collection<String> dataEntityOddrns,
                                         Map<String, Collection<String>> dqtToDataset) {
        public static AlertStateSnapshotKey fromOddrns(final Collection<String> oddrns) {
            return new AlertStateSnapshotKey(oddrns, emptyMap());
        }
    }
}