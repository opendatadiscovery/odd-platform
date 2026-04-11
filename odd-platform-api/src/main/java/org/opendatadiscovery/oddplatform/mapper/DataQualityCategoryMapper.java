package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityCategoryResults;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;

public interface DataQualityCategoryMapper {
    String TASK_RUNS_COUNT = "TASK_RUNS_COUNT";
    String TASK_RUN_CATEGORY = "TASK_RUN_CATEGORY";

    List<DataQualityCategoryResults> mapToDto(List<ReactiveDataQualityRunsRepository.DataQualityRunsRecord> items);
}
