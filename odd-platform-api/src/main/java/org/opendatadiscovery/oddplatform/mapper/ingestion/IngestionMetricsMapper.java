package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.collections4.CollectionUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.mapper.MapperConfig;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricLabelValuePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricPointPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricSeriesPojo;

@Mapper(config = MapperConfig.class)
public interface IngestionMetricsMapper {

    @Mapping(source = "help", target = "description")
    MetricFamilyPojo mapMetricFamily(final MetricFamily metricFamily);

    @Mapping(source = "labels", target = "metricLabelsIds", qualifiedByName = "mapMetricSeriesLabels")
    MetricSeriesPojo mapMetricSeries(final Integer metricEntityId,
                                     final Integer metricFamilyId,
                                     final Collection<MetricLabelPojo> labels,
                                     final MetricSeriesValueType valueType);

    MetricLabelValuePojo mapMetricLabelValue(final Integer metricLabelId,
                                             final String value);

    @Mapping(source = "labelValues", target = "labelValuesIds", qualifiedByName = "mapMetricPointLabelValues")
    MetricPointPojo mapMetricPoint(final LocalDateTime timestamp,
                                   final List<MetricLabelValuePojo> labelValues,
                                   final Double value);

    @Named("mapMetricSeriesLabels")
    default Integer[] mapMetricSeriesLabels(final Collection<MetricLabelPojo> labels) {
        if (CollectionUtils.isEmpty(labels)) {
            return new Integer[0];
        }
        return labels.stream()
            .map(MetricLabelPojo::getId)
            .sorted()
            .toArray(Integer[]::new);
    }

    default Integer mapMetricSeriesValueType(final MetricSeriesValueType valueType) {
        return valueType.getCode();
    }

    @Named("mapMetricPointLabelValues")
    default Integer[] mapMetricPointLabelValues(final List<MetricLabelValuePojo> labelValues) {
        if (CollectionUtils.isEmpty(labelValues)) {
            return new Integer[0];
        }
        return labelValues.stream()
            .map(MetricLabelValuePojo::getId)
            .sorted()
            .toArray(Integer[]::new);
    }

    org.opendatadiscovery.oddplatform.proto.Label mapToProtoLabel(final Label label);

    default List<org.opendatadiscovery.oddplatform.proto.Label> mapToProtoLabels(final List<Label> labels) {
        if (CollectionUtils.isEmpty(labels)) {
            return new ArrayList<>();
        }
        return labels.stream().map(this::mapToProtoLabel).collect(Collectors.toList());
    }
}
