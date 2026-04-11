package org.opendatadiscovery.oddplatform.service.ingestion.metric.extractors.external;

import java.time.LocalDateTime;
import java.util.List;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.Label;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricPoint;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.MetricType;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetricFamilyPojo;
import org.opendatadiscovery.oddplatform.proto.TimeSeries;

public interface TimeSeriesExtractor {
    boolean canExtract(final MetricType metricType);

    List<TimeSeries> extractTimeSeries(final String oddrn,
                                       final MetricFamilyPojo metricFamilyPojo,
                                       final MetricPoint metricPoint,
                                       final List<Label> labels,
                                       final LocalDateTime ingestedTime);
}
