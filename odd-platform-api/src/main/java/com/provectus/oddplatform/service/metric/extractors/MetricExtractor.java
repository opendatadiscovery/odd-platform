package com.provectus.oddplatform.service.metric.extractors;

import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.IngestionTaskRun;
import io.opentelemetry.sdk.metrics.data.MetricData;
import java.util.List;
import java.util.stream.Stream;

// TODO: rework into chain
public interface MetricExtractor {
    Stream<MetricData> extractDatasetMetrics(final List<? extends DataEntityIngestionDto> entities);

    Stream<MetricData> extractTaskRunMetrics(final List<IngestionTaskRun> taskRuns);

    Stream<MetricData> extractDatasetFieldMetrics(final List<? extends DataEntityIngestionDto> entities);
}
