package com.provectus.oddplatform.service.metric.extractors;

import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.DataEntityType;
import com.provectus.oddplatform.dto.IngestionTaskRun;
import com.provectus.oddplatform.dto.IngestionTaskRun.IngestionTaskRunStatus;
import com.provectus.oddplatform.ingestion.contract.model.BinaryFieldStat;
import com.provectus.oddplatform.ingestion.contract.model.BooleanFieldStat;
import com.provectus.oddplatform.ingestion.contract.model.ComplexFieldStat;
import com.provectus.oddplatform.ingestion.contract.model.DataSetField;
import com.provectus.oddplatform.ingestion.contract.model.DateTimeFieldStat;
import com.provectus.oddplatform.ingestion.contract.model.IntegerFieldStat;
import com.provectus.oddplatform.ingestion.contract.model.NumberFieldStat;
import com.provectus.oddplatform.ingestion.contract.model.StringFieldStat;
import com.provectus.oddplatform.service.metric.dto.MetricDataTriplet;
import com.provectus.oddplatform.utils.Pair;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.api.common.Attributes;
import io.opentelemetry.sdk.common.InstrumentationLibraryInfo;
import io.opentelemetry.sdk.metrics.data.DoubleGaugeData;
import io.opentelemetry.sdk.metrics.data.DoublePointData;
import io.opentelemetry.sdk.metrics.data.LongGaugeData;
import io.opentelemetry.sdk.metrics.data.LongPointData;
import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.metrics.data.PointData;
import io.opentelemetry.sdk.resources.Resource;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import static com.provectus.oddplatform.service.metric.extractors.ExtractorUtils.longPointData;
import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
public class MetricExtractorImpl implements MetricExtractor {
    private final DatasetFieldStatExtractor<BooleanFieldStat> booleanExtractor;
    private final DatasetFieldStatExtractor<BinaryFieldStat> binaryExtractor;
    private final DatasetFieldStatExtractor<ComplexFieldStat> complexExtractor;
    private final DatasetFieldStatExtractor<DateTimeFieldStat> dateTimeExtractor;
    private final DatasetFieldStatExtractor<IntegerFieldStat> integerExtractor;
    private final DatasetFieldStatExtractor<NumberFieldStat> numberExtractor;
    private final DatasetFieldStatExtractor<StringFieldStat> stringExtractor;

    @Override
    public Stream<MetricData> extractDatasetMetrics(final List<? extends DataEntityIngestionDto> entities) {
        final Stream<Pair<MetricDataTriplet, ? extends PointData>> metricStream = entities.stream()
            .filter(de -> de.getTypes().contains(DataEntityType.DATA_SET))
            .map(this::buildMetrics);

        return gaugeStream(metricStream);
    }

    @Override
    public Stream<MetricData> extractTaskRunMetrics(final List<IngestionTaskRun> taskRuns) {
        final Stream<Pair<MetricDataTriplet, ? extends PointData>> metricStream = taskRuns.stream()
            .filter(taskRun -> taskRun.getEndTime() != null)
            .flatMap(this::buildMetrics);

        return gaugeStream(metricStream);
    }

    @Override
    public Stream<MetricData> extractDatasetFieldMetrics(final List<? extends DataEntityIngestionDto> entities) {
        final Stream<Pair<MetricDataTriplet, ? extends PointData>> metricStream = entities.stream()
            .filter(de -> de.getTypes().contains(DataEntityType.DATA_SET))
            .flatMap(de -> de.getDataSet().getFieldList().stream()
                .filter(f -> f.getStats() != null)
                .flatMap(f -> extractFieldMetrics(de.getOddrn(), f)));

        return gaugeStream(metricStream);
    }

    private Stream<MetricData> gaugeStream(final Stream<Pair<MetricDataTriplet, ? extends PointData>> metricStream) {
        return metricStream
            .filter(p -> p.getRight() != null)
            // TODO: get rid of intermediate collector
            .collect(Collectors.groupingBy(Pair::getLeft))
            .entrySet()
            .stream()
            .map(e -> Pair.of(e.getKey(), e.getValue().stream().map(Pair::getRight).collect(Collectors.toList())))
            .map(p -> gauge(p.getLeft(), p.getRight()));
    }

    private Stream<Pair<MetricDataTriplet, LongPointData>> buildMetrics(final IngestionTaskRun taskRun) {
        final long duration = Duration.between(taskRun.getEndTime(), taskRun.getStartTime()).getSeconds();

        final long status = taskRun.getStatus().equals(IngestionTaskRunStatus.SUCCESS) ? 1L : 0L;

        final Attributes attributes =
            Attributes.of(AttributeKey.stringKey("job_oddrn"), taskRun.getDataEntityOddrn());

        return Stream.of(
            Pair.of(MetricDataTriplet.TASK_RUN_DURATION, longPointData(duration, attributes)),
            Pair.of(MetricDataTriplet.DF_NULLS_COUNT, longPointData(status, attributes))
        );
    }

    private Pair<MetricDataTriplet, LongPointData> buildMetrics(final DataEntityIngestionDto entity) {
        final Attributes attributes = Attributes.of(AttributeKey.stringKey("entity_oddrn"), entity.getOddrn());

        return Pair.of(
            MetricDataTriplet.ROWS_COUNT,
            longPointData(entity.getDataSet().getRowsCount(), attributes)
        );
    }

    private Stream<Pair<MetricDataTriplet, ? extends PointData>> extractFieldMetrics(final String entityOddrn,
                                                                                     final DataSetField field) {
        return Stream.of(
            binaryExtractor.extract(entityOddrn, field.getOddrn(), field.getStats().getBinaryStats()),
            booleanExtractor.extract(entityOddrn, field.getOddrn(), field.getStats().getBooleanStats()),
            complexExtractor.extract(entityOddrn, field.getOddrn(), field.getStats().getComplexStats()),
            numberExtractor.extract(entityOddrn, field.getOddrn(), field.getStats().getNumberStats()),
            stringExtractor.extract(entityOddrn, field.getOddrn(), field.getStats().getStringStats()),
            integerExtractor.extract(entityOddrn, field.getOddrn(), field.getStats().getIntegerStats()),
            dateTimeExtractor.extract(entityOddrn, field.getOddrn(), field.getStats().getDatetimeStats())
        ).flatMap(identity());
    }

    @SuppressWarnings("unchecked")
    private MetricData gauge(final MetricDataTriplet metricDataTriplet, final List<? extends PointData> points) {
        if (metricDataTriplet.equals(MetricDataTriplet.DF_AVG_LENGTH)) {
            return MetricData.createDoubleGauge(
                Resource.getDefault(),
                InstrumentationLibraryInfo.empty(),
                metricDataTriplet.getName(),
                metricDataTriplet.getDescription(),
                metricDataTriplet.getUnit(),
                DoubleGaugeData.create((List<DoublePointData>) points)
            );
        }

        return MetricData.createLongGauge(
            Resource.getDefault(),
            InstrumentationLibraryInfo.empty(),
            metricDataTriplet.getName(),
            metricDataTriplet.getDescription(),
            metricDataTriplet.getUnit(),
            LongGaugeData.create((List<LongPointData>) points)
        );
    }
}
