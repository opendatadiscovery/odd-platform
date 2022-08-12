package org.opendatadiscovery.oddplatform.service.ingestion.handler;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionDataStructure;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionTaskRun;
import org.opendatadiscovery.oddplatform.mapper.DataEntityTaskRunMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityTaskRunRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataEntityTaskRunIngestionHandler implements IngestionHandler {
    private final ReactiveDataEntityTaskRunRepository dataEntityTaskRunRepository;
    private final DataEntityTaskRunMapper dataEntityTaskRunMapper;

    @Override
    // TODO: set propagation?
    @ReactiveTransactional
    public Mono<Void> handle(final IngestionDataStructure dataStructure) {
        final List<String> taskRunOddrns = dataStructure.getTaskRuns()
            .stream()
            .map(IngestionTaskRun::getOddrn)
            .toList();

        final List<DataEntityTaskRunPojo> pojos = dataStructure.getTaskRuns()
            .stream()
            .map(dataEntityTaskRunMapper::mapTaskRun)
            .toList();

        return dataEntityTaskRunRepository.existsByOddrns(taskRunOddrns)
            .flatMap(existDict -> {
                final Map<Boolean, List<DataEntityTaskRunPojo>> partitioned = pojos
                    .stream()
                    .collect(Collectors.partitioningBy(p -> existDict.getOrDefault(p.getOddrn(), false)));

                return Mono.zip(
                    dataEntityTaskRunRepository.bulkCreate(partitioned.get(false)),
                    dataEntityTaskRunRepository.bulkUpdate(partitioned.get(true))
                );
            })
            .then(dataEntityTaskRunRepository.insertLastRuns(pojos))
            .then();
    }
}
