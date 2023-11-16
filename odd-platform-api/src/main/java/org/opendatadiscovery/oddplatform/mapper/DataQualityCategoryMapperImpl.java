package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.apache.commons.lang3.EnumUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRunStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityCategoryResults;
import org.opendatadiscovery.oddplatform.api.contract.model.DataQualityRunStatusCount;
import org.opendatadiscovery.oddplatform.dto.DataQualityCategory;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRunsRepository;
import org.springframework.stereotype.Component;

@Component
public class DataQualityCategoryMapperImpl implements DataQualityCategoryMapper {

    @Override
    public List<DataQualityCategoryResults> mapToDto(
        final List<ReactiveDataQualityRunsRepository.DataQualityRunsRecord> items) {
        final Map<DataQualityCategory, DataQualityCategoryResults> categoryResults =
            Arrays.stream(DataQualityCategory.values())
                .collect(Collectors.toMap(Function.identity(),
                    value ->
                        new DataQualityCategoryResults()
                            .category(value.getDescription())
                            .results(new ArrayList<>())));

        items.forEach(row -> categoryResults.get(DataQualityCategory
                .resolveByName(row.taskRunCategory()))
            .getResults().add(new DataQualityRunStatusCount()
                .status(EnumUtils.getEnum(DataEntityRunStatus.class,
                    row.status(),
                    DataEntityRunStatus.UNKNOWN))
                .count(row.taskRunsCount())));

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
                        .count(0)));
        }

        return resultsList;
    }
}
