package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.jooq.Record3;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityCategoryResults;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityRunStatusCount;
import org.opendatadiscovery.oddplatform.dto.DataQualityCategory;
import org.springframework.stereotype.Component;

import static org.opendatadiscovery.oddplatform.model.tables.DataEntityTaskLastRun.DATA_ENTITY_TASK_LAST_RUN;

@Component
public class DataQualityCategoryMapperImpl implements DataQualityCategoryMapper {
    private static final String TASK_RUNS_COUNT = "TASK_RUNS_COUNT";
    private static final String TASK_RUN_CATEGORY = "TASK_RUN_CATEGORY";

    @Override
    public List<DataQualityCategoryResults> mapToDto(final List<Record3<String, String, Integer>> items) {
        final Map<DataQualityCategory, DataQualityCategoryResults> categoryResults =
                Arrays.stream(DataQualityCategory.values())
                        .collect(Collectors.toMap(Function.identity(),
                                value ->
                                        new DataQualityCategoryResults()
                                                .category(value.getDescription())
                                                .results(new ArrayList<>())));

        items.forEach(row -> categoryResults.get(DataQualityCategory
                        .resolveByName(row.get(TASK_RUN_CATEGORY, String.class)))
                .getResults().add(new DataQualityRunStatusCount()
                        .status(DataEntityRunStatus
                                .fromValue(row.getValue(DATA_ENTITY_TASK_LAST_RUN.STATUS)))
                        .count(Long.valueOf(row.get(TASK_RUNS_COUNT, Integer.class)))));

        return addMissingStatuses(categoryResults.values()
                        .stream()
                        .toList());
    }

    private List<DataQualityCategoryResults> addMissingStatuses(final List<DataQualityCategoryResults> resultsList) {
        for (final DataQualityCategoryResults dataQualityCategoryResults : resultsList) {
            final Set<DataEntityRunStatus> existedElements = dataQualityCategoryResults.getResults()
                    .stream().map(DataQualityRunStatusCount::getStatus)
                    .collect(Collectors.toSet());

            Arrays.stream(DataEntityRunStatus.values())
                    .filter(value -> !existedElements.contains(value))
                    .forEach(value -> dataQualityCategoryResults.getResults()
                            .add(new DataQualityRunStatusCount()
                                    .status(value)
                                    .count(0L)));
        }

        return resultsList;
    }
}
