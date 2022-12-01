package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MultiMapUtils;
import org.apache.commons.collections4.MultiValuedMap;
import org.jooq.impl.DSL;
import org.opendatadiscovery.oddplatform.dto.alert.AlertStatusEnum;
import org.opendatadiscovery.oddplatform.dto.alert.AlertTypeEnum;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.model.tables.pojos.AlertPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataQualityTestRelationsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveAlertRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityTestRelationRepository;
import org.opendatadiscovery.oddplatform.repository.util.JooqReactiveOperations;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertAction;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertActionResolver;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyMap;
import static org.opendatadiscovery.oddplatform.model.Tables.ALERT;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveDataQualityTestRelationRepository dataQualityTestRelationRepository;
    private final JooqReactiveOperations jooqReactiveOperations;
    private final AlertActionResolver alertActionResolver;
    private final ReactiveAlertRepository alertRepository;

    @Override
    public Mono<Void> process(final IngestionRequest request) {
        if (CollectionUtils.isEmpty(request.getTaskRuns())) {
            return Mono.empty();
        }

        final Set<String> dataEntityOddrns = new HashSet<>();
        final Set<String> dataQualityTestOddrns = new HashSet<>();
        final MultiValuedMap<String, String> helperMap = MultiMapUtils.newSetValuedHashMap();

        // TODO: add ifNotEmpty
        for (final IngestionTaskRun taskRun : request.getTaskRuns()) {
            switch (taskRun.getType()) {
                case DATA_TRANSFORMER_RUN -> dataEntityOddrns.add(taskRun.getTaskOddrn());
                case DATA_QUALITY_TEST_RUN -> dataQualityTestOddrns.add(taskRun.getTaskOddrn());
            }
        }

        for (final EnrichedDataEntityIngestionDto entity : request.getAllEntities()) {
            if (entity.getDataQualityTest() != null) {
                if (dataQualityTestOddrns.remove(entity.getOddrn())) {
                    dataEntityOddrns.addAll(entity.getDataQualityTest().datasetList());
                    for (final String s : entity.getDataQualityTest().datasetList()) {
                        helperMap.put(entity.getOddrn(), s);
                    }
                }
            }
        }

        // data_entity -> last open alert of each type
        final Mono<Map<String, Map<Short, AlertPojo>>> state;
        if (!dataQualityTestOddrns.isEmpty()) {
            state = dataQualityTestRelationRepository.getRelations(dataQualityTestOddrns)
                // TODO: wtf
                .doOnNext(re -> helperMap.put(re.getDataQualityTestOddrn(), re.getDatasetOddrn()))
                .map(DataQualityTestRelationsPojo::getDatasetOddrn)
                .mergeWith(Flux.fromIterable(dataEntityOddrns))
                .collect(Collectors.toSet())
                .flatMap(this::fetchLastOpenAlertStates);
        } else {
            state = fetchLastOpenAlertStates(dataEntityOddrns);
        }

        return state.map(s -> alertActionResolver.resolveActions(s, helperMap, request.getTaskRuns()))
            .flatMap(this::applyActions);
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return true;
    }

    @Override
    public IngestionProcessingPhase getPhase() {
        return IngestionProcessingPhase.FINALIZING;
    }

    private Mono<Void> applyActions(final Collection<AlertAction> alertActions) {
        final List<AlertPojo> toCreate = new ArrayList<>();
        final List<Long> toResolve = new ArrayList<>();
        final List<Pair<Long, List<LocalDateTime>>> toStack = new ArrayList<>();

        alertActions.forEach(action -> {
            if (action instanceof AlertAction.CreateAlertAction) {
                toCreate.add(((AlertAction.CreateAlertAction) action).getAlertPojo());
            }

            if (action instanceof AlertAction.ResolveAutomaticallyAlertAction) {
                toResolve.add(((AlertAction.ResolveAutomaticallyAlertAction) action).getAlertId());
            }

            // TODO: stack alerts
            if (action instanceof AlertAction.StackAlertAction) {
            }
        });

        final var resolveQuery = DSL.update(ALERT)
            .set(ALERT.STATUS, AlertStatusEnum.RESOLVED_AUTOMATICALLY.getCode())
            .where(ALERT.ID.in(toResolve));

        // TODO: stack alerts
        return Mono.zip(
            jooqReactiveOperations.mono(resolveQuery),
            alertRepository.createAlerts(toCreate)
        ).then();
    }

    private Mono<Map<String, Map<Short, AlertPojo>>> fetchLastOpenAlertStates(final Set<String> dataEntityOddrns) {
        if (CollectionUtils.isEmpty(dataEntityOddrns)) {
            return Mono.just(emptyMap());
        }

        final var query = DSL.select(ALERT.fields())
            .from(ALERT)
            .where(ALERT.DATA_ENTITY_ODDRN.in(dataEntityOddrns))
            .and(ALERT.STATUS.eq(AlertStatusEnum.OPEN.getCode()))
            .and(ALERT.TYPE.in(
                List.of(AlertTypeEnum.FAILED_JOB.getCode(), AlertTypeEnum.FAILED_DQ_TEST.getCode())))
            // TODO: think this through
            .forUpdate();

        return jooqReactiveOperations.flux(query)
            .map(r -> r.into(AlertPojo.class))
            .collectList()
            .map(alerts -> {
                // TODO: rewrite to streams?
                // assumes that there are no duplicates of schema:
                //  data_entity_oddrn -> type + messenger_oddrn, where type is in [FAILED_JOB, FAILED_DQ_TEST]
                // since data entity can be represented in several classes,
                //  it can contain open alerts with several types
                final Map<String, Map<Short, AlertPojo>> result = new HashMap<>();
                for (final AlertPojo alert : alerts) {
                    result.compute(alert.getDataEntityOddrn(), (k, v) -> {
                        if (v == null) {
                            final HashMap<Short, AlertPojo> vv = new HashMap<>();
                            vv.putIfAbsent(alert.getType(), alert);
                            return vv;
                        }

                        v.putIfAbsent(alert.getType(), alert);
                        return v;
                    });
                }

                return result;
            });
    }
}