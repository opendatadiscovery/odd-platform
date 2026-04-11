package org.opendatadiscovery.oddplatform.utils;

import lombok.experimental.UtilityClass;
import org.opendatadiscovery.oddplatform.dto.metric.MetricSeriesValueType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricFamily;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;

@UtilityClass
public class MetricUtils {
    public static String buildMetricFamilyKey(final MetricFamilyPojo metricFamily) {
        return String.join("_", metricFamily.getName().toLowerCase(),
            metricFamily.getUnit().toLowerCase(), metricFamily.getType().toLowerCase());
    }

    public static String buildMetricFamilyKey(final MetricFamily metricFamily) {
        return String.join("_", metricFamily.getName().toLowerCase(),
            metricFamily.getUnit().toLowerCase(), metricFamily.getType().getValue().toLowerCase());
    }

    public static String generateMetricSeriesName(final String metricFamilyName,
                                                  final MetricSeriesValueType seriesValueType) {
        return metricFamilyName + seriesValueType.getSuffix();
    }

    public static boolean isSpecificSeries(final String metricName,
                                           final MetricSeriesValueType seriesValueType) {
        return metricName.endsWith(seriesValueType.getSuffix());
    }
}

