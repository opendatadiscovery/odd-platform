package org.opendatadiscovery.oddplatform.service.metric.extractors;

import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.metrics.data.PointData;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.BinaryFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.BooleanFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.ComplexFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DateTimeFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.IntegerFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.NumberFieldStat;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.StringFieldStat;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.service.metric.dto.MetricDataTriplet;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Pair;
import org.springframework.stereotype.Component;

import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
public class DatasetFieldMetricExtractor implements MetricExtractor {
    private final DatasetFieldStatExtractor<BooleanFieldStat> booleanExtractor;
    private final DatasetFieldStatExtractor<BinaryFieldStat> binaryExtractor;
    private final DatasetFieldStatExtractor<ComplexFieldStat> complexExtractor;
    private final DatasetFieldStatExtractor<DateTimeFieldStat> dateTimeExtractor;
    private final DatasetFieldStatExtractor<IntegerFieldStat> integerExtractor;
    private final DatasetFieldStatExtractor<NumberFieldStat> numberExtractor;
    private final DatasetFieldStatExtractor<StringFieldStat> stringExtractor;

    @Override
    public Stream<MetricData> extract(final IngestionRequest dataStructure) {
        final Stream<Pair<MetricDataTriplet, ? extends PointData>> metricStream = dataStructure.getAllEntities()
            .stream()
            .filter(de -> de.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .flatMap(de -> de.getDataSet().fieldList().stream()
                .filter(f -> f.field().getStats() != null)
                .flatMap(f -> buildMetrics(de.getOddrn(), f.field())));

        return gaugeStream(metricStream);
    }

    private Stream<Pair<MetricDataTriplet, ? extends PointData>> buildMetrics(final String entityOddrn,
                                                                              final DatasetFieldPojo field) {
        final DataSetFieldStat stats = JSONSerDeUtils.deserializeJson(field.getStats(), DataSetFieldStat.class);

        if (stats == null) {
            return Stream.empty();
        }

        return Stream.of(
            binaryExtractor.extract(entityOddrn, field.getOddrn(), stats.getBinaryStats()),
            booleanExtractor.extract(entityOddrn, field.getOddrn(), stats.getBooleanStats()),
            complexExtractor.extract(entityOddrn, field.getOddrn(), stats.getComplexStats()),
            numberExtractor.extract(entityOddrn, field.getOddrn(), stats.getNumberStats()),
            stringExtractor.extract(entityOddrn, field.getOddrn(), stats.getStringStats()),
            integerExtractor.extract(entityOddrn, field.getOddrn(), stats.getIntegerStats()),
            dateTimeExtractor.extract(entityOddrn, field.getOddrn(), stats.getDatetimeStats())
        ).flatMap(identity());
    }
}
