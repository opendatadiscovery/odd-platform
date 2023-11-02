package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.jooq.Record3;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityCategoryResultsList;

public interface DataQualityCategoryMapper {
    String TASK_RUNS_COUNT = "TASK_RUNS_COUNT";
    String TASK_RUN_CATEGORY = "TASK_RUN_CATEGORY";

    DataQualityCategoryResultsList mapToDto(List<Record3<String, String, Integer>> items);
}
