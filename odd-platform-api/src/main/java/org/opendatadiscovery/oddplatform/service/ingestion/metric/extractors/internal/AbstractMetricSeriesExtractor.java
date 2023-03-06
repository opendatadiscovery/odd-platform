package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.internal;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricLabelsDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricPointDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricSeriesPojo;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.BUCKET_UPPER_BOUND;

@RequiredArgsConstructor
public abstract class AbstractMetricSeriesExtractor {
    protected final IngestionMetricsMapper mapper;

    protected MetricLabelValuePojo getMetricLabelValue(final Label label,
                                                       final IngestionMetricLabelsDto allLabelsDto,
                                                       final Set<Integer> labelNameIds) {
        return allLabelsDto.labelValuesMap().get(label.getValue()).stream()
            .filter(value -> labelNameIds.contains(value.getMetricLabelId()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Label value not found"));
    }

    protected LocalDateTime getTimestamp(final Integer timestamp, final LocalDateTime defaultValue) {
        return Optional.ofNullable(timestamp)
            .map(t -> LocalDateTime.ofInstant(Instant.ofEpochSecond(t), ZoneOffset.UTC))
            .orElse(defaultValue);
    }

    protected MetricSeriesDto createSimpleSeries(final IngestionMetricPointDto point,
                                                 final MetricEntityPojo metricEntityPojo,
                                                 final MetricFamilyPojo metricFamilyPojo,
                                                 final IngestionMetricLabelsDto allLabelsDto,
                                                 final LocalDateTime defaultDateTime,
                                                 final MetricSeriesValueType valueType,
                                                 final Double pointValue) {
        final Map<Integer, MetricLabelPojo> metricLabelsMap = point.labels().stream()
            .map(label -> allLabelsDto.labelsNamesMap().get(label.getName()))
            .collect(Collectors.toMap(MetricLabelPojo::getId, identity()));

        final MetricSeriesPojo seriesPojo = mapper.mapMetricSeries(metricEntityPojo.getId(), metricFamilyPojo.getId(),
            metricLabelsMap.values(), valueType);

        final LocalDateTime metricDateTime = getTimestamp(point.metricPoint().getTimestamp(), defaultDateTime);
        final List<MetricLabelValuePojo> labelValuePojos = point.labels().stream()
            .map(label -> getMetricLabelValue(label, allLabelsDto, metricLabelsMap.keySet()))
            .toList();

        final MetricPointPojo metricPointPojo = mapper.mapMetricPoint(metricDateTime, labelValuePojos, pointValue);
        return new MetricSeriesDto(seriesPojo, List.of(metricPointPojo));
    }

    protected MetricSeriesDto createBucketSeries(final IngestionMetricPointDto point,
                                                 final MetricEntityPojo metricEntityPojo,
                                                 final MetricFamilyPojo metricFamilyPojo,
                                                 final IngestionMetricLabelsDto allLabelsDto,
                                                 final LocalDateTime defaultDateTime) {
        final Map<Integer, MetricLabelPojo> metricLabelsMap = point.labels().stream()
            .map(label -> allLabelsDto.labelsNamesMap().get(label.getName()))
            .collect(Collectors.toMap(MetricLabelPojo::getId, identity()));
        final MetricLabelPojo le = allLabelsDto.labelsNamesMap().get(BUCKET_UPPER_BOUND.getLabelName());
        metricLabelsMap.put(le.getId(), le);

        final MetricSeriesPojo seriesPojo = mapper.mapMetricSeries(metricEntityPojo.getId(), metricFamilyPojo.getId(),
            metricLabelsMap.values(), MetricSeriesValueType.BUCKET);

        final LocalDateTime metricDateTime = getTimestamp(point.metricPoint().getTimestamp(), defaultDateTime);
        final List<MetricLabelValuePojo> commonLabelValues = point.labels().stream()
            .map(label -> getMetricLabelValue(label, allLabelsDto, metricLabelsMap.keySet()))
            .toList();
        final List<MetricPointPojo> metricPointPojos = point.metricPoint().getHistogramValue().getBuckets().stream()
            .map(b -> {
                final List<MetricLabelValuePojo> labelValues = new ArrayList<>(commonLabelValues);
                final MetricLabelValuePojo metricLabelValuePojo = allLabelsDto.labelValuesMap()
                    .get(b.getUpperBound().toString()).stream()
                    .filter(lv -> lv.getMetricLabelId().equals(le.getId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Upper bound label value not found"));
                labelValues.add(metricLabelValuePojo);
                return mapper.mapMetricPoint(metricDateTime, labelValues, b.getCount().doubleValue());
            }).toList();
        return new MetricSeriesDto(seriesPojo, metricPointPojos);
    }
}
