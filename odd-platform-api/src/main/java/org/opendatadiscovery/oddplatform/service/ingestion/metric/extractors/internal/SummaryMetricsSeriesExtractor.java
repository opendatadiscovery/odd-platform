package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.internal;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricLabelsDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionMetricPointDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesDto;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.mapper.ingestion.IngestionMetricsMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricSeriesPojo;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import static java.util.function.Function.identity;
import static org.opendatadiscovery.oddplatform.dto.metric.SystemMetricLabel.QUANTILE;

@Component
@ConditionalOnProperty(name = "metrics.storage", havingValue = "INTERNAL_POSTGRES", matchIfMissing = true)
public class SummaryMetricsSeriesExtractor extends AbstractMetricSeriesExtractor implements MetricSeriesExtractor {

    public SummaryMetricsSeriesExtractor(final IngestionMetricsMapper mapper) {
        super(mapper);
    }

    @Override
    public boolean canExtract(final MetricType metricType) {
        return metricType == MetricType.SUMMARY;
    }

    @Override
    public List<MetricSeriesDto> extractSeries(final IngestionMetricPointDto point,
                                               final MetricEntityPojo metricEntityPojo,
                                               final MetricFamilyPojo metricFamilyPojo,
                                               final IngestionMetricLabelsDto allLabelsDto,
                                               final LocalDateTime ingestedTime) {
        if (point.metricPoint().getSummaryValue() == null) {
            throw new IllegalArgumentException("Summary metric point must have summary value");
        }
        if (CollectionUtils.isEmpty(point.metricPoint().getSummaryValue().getQuantile())) {
            throw new IllegalArgumentException("Summary metric point must have at least one quantile");
        }
        final List<MetricSeriesDto> result = new ArrayList<>();
        result.add(createQuantileSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, ingestedTime));
        result.add(createSumSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, ingestedTime));
        result.add(createCountSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, ingestedTime));
        result.add(createCreatedSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, ingestedTime));
        return result;
    }

    private MetricSeriesDto createSumSeries(final IngestionMetricPointDto point,
                                            final MetricEntityPojo metricEntityPojo,
                                            final MetricFamilyPojo metricFamilyPojo,
                                            final IngestionMetricLabelsDto allLabelsDto,
                                            final LocalDateTime defaultDateTime) {
        final Double value = point.metricPoint().getSummaryValue().getSum() != null
            ? point.metricPoint().getSummaryValue().getSum().doubleValue() : null;
        return createSimpleSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime,
            MetricSeriesValueType.SUM, value);
    }

    private MetricSeriesDto createCountSeries(final IngestionMetricPointDto point,
                                              final MetricEntityPojo metricEntityPojo,
                                              final MetricFamilyPojo metricFamilyPojo,
                                              final IngestionMetricLabelsDto allLabelsDto,
                                              final LocalDateTime defaultDateTime) {
        final Double value = point.metricPoint().getSummaryValue().getCount() != null
            ? point.metricPoint().getSummaryValue().getCount().doubleValue() : null;
        return createSimpleSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime,
            MetricSeriesValueType.COUNT, value);
    }

    private MetricSeriesDto createCreatedSeries(final IngestionMetricPointDto point,
                                                final MetricEntityPojo metricEntityPojo,
                                                final MetricFamilyPojo metricFamilyPojo,
                                                final IngestionMetricLabelsDto allLabelsDto,
                                                final LocalDateTime defaultDateTime) {
        final Double value = point.metricPoint().getSummaryValue().getCreated() != null
            ? point.metricPoint().getSummaryValue().getCreated().doubleValue() : null;
        return createSimpleSeries(point, metricEntityPojo, metricFamilyPojo, allLabelsDto, defaultDateTime,
            MetricSeriesValueType.CREATED, value);
    }

    private MetricSeriesDto createQuantileSeries(final IngestionMetricPointDto point,
                                                 final MetricEntityPojo metricEntityPojo,
                                                 final MetricFamilyPojo metricFamilyPojo,
                                                 final IngestionMetricLabelsDto allLabelsDto,
                                                 final LocalDateTime defaultDateTime) {
        final Map<Integer, MetricLabelPojo> metricLabelsMap = point.labels().stream()
            .map(label -> allLabelsDto.labelsNamesMap().get(label.getName()))
            .collect(Collectors.toMap(MetricLabelPojo::getId, identity()));
        final MetricLabelPojo le = allLabelsDto.labelsNamesMap().get(QUANTILE.getLabelName());
        metricLabelsMap.put(le.getId(), le);

        final MetricSeriesPojo seriesPojo = mapper.mapMetricSeries(metricEntityPojo.getId(), metricFamilyPojo.getId(),
            metricLabelsMap.values(), MetricSeriesValueType.QUANTILE);

        final LocalDateTime metricDateTime = getTimestamp(point.metricPoint().getTimestamp(), defaultDateTime);
        final List<MetricLabelValuePojo> commonLabelValues = point.labels().stream()
            .map(label -> getMetricLabelValue(label, allLabelsDto, metricLabelsMap.keySet()))
            .toList();
        final List<MetricPointPojo> metricPointPojos = point.metricPoint().getSummaryValue().getQuantile().stream()
            .map(q -> {
                final List<MetricLabelValuePojo> labelValues = new ArrayList<>(commonLabelValues);
                final MetricLabelValuePojo metricLabelValuePojo = allLabelsDto.labelValuesMap()
                    .get(q.getQuantile().toString()).stream()
                    .filter(lv -> lv.getMetricLabelId().equals(le.getId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Quantile label value not found"));
                labelValues.add(metricLabelValuePojo);
                return mapper.mapMetricPoint(metricDateTime, labelValues, q.getValue().doubleValue());
            }).toList();
        return new MetricSeriesDto(seriesPojo, metricPointPojos);
    }
}
