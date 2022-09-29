package org.opendatadiscovery.oddplatform.service.ingestion.processor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.mapper.DataEntityTaskRunMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityTaskRunRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TaskRunIngestionRequestProcessor implements IngestionRequestProcessor {
    private final ReactiveDataEntityTaskRunRepository dataEntityTaskRunRepository;
    private final DataEntityTaskRunMapper dataEntityTaskRunMapper;

    @Override
    @ReactiveTransactional
    public Mono<Void> process(final IngestionRequest request) {
        final List<String> taskRunOddrns = request.getTaskRuns()
            .stream()
            .map(IngestionTaskRun::getOddrn)
            .toList();

        final List<DataEntityTaskRunPojo> pojos = request.getTaskRuns()
            .stream()
            .map(dataEntityTaskRunMapper::mapTaskRun)
            .toList();

        return dataEntityTaskRunRepository.existsByOddrns(taskRunOddrns)
            .flatMap(existDict -> {
                final Map<Boolean, List<DataEntityTaskRunPojo>> partitioned = pojos
                    .stream()
                    .collect(Collectors.partitioningBy(p -> existDict.getOrDefault(p.getOddrn(), false)));

                return Mono.zipDelayError(
                    dataEntityTaskRunRepository.bulkCreate(partitioned.get(false)),
                    dataEntityTaskRunRepository.bulkUpdate(partitioned.get(true))
                );
            })
            .then(dataEntityTaskRunRepository.insertLastRuns(pojos));
    }

    @Override
    public boolean shouldProcess(final IngestionRequest request) {
        return CollectionUtils.isNotEmpty(request.getTaskRuns());
    }
}
