package org.opendatadiscovery.oddplatform.service;

import com.fasterxml.jackson.core.type.TypeReference;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.ListUtils;
import org.apache.commons.collections4.SetUtils;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntitySpecificAttributesDelta;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDelta;
import org.opendatadiscovery.oddplatform.dto.attributes.DataConsumerAttributes;
import org.opendatadiscovery.oddplatform.dto.attributes.DataTransformerAttributes;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DatasetFieldPojo;
import org.opendatadiscovery.oddplatform.service.ingestion.alert.AlertBISCandidate;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import static java.util.function.Function.identity;

@Component
@RequiredArgsConstructor
public class AlertLocatorImpl implements AlertLocator {
    private final DatasetStructureService datasetStructureService;

    @Override
    public Flux<AlertBISCandidate> getAlertBISCandidates(final List<DataEntitySpecificAttributesDelta> deltas,
                                                         final List<Long> changedDatasetIds) {
        final Flux<AlertBISCandidate> datasetBisCandidates = datasetStructureService
            .getLastDatasetStructureVersionDelta(changedDatasetIds)
            .flatMapMany(delta -> Flux.fromStream(
                delta.entrySet().stream().flatMap(e -> locateInDSDelta(e.getKey(), e.getValue()))));

        final Flux<AlertBISCandidate> transformerAlerts = Flux.fromStream(deltas.stream()
            .filter(d -> d.entityClasses().contains(DataEntityClassDto.DATA_TRANSFORMER))
            .flatMap(this::locateInDTDelta));

        final Flux<AlertBISCandidate> consumerAlerts = Flux.fromStream(deltas.stream()
            .filter(d -> d.entityClasses().contains(DataEntityClassDto.DATA_CONSUMER))
            .flatMap(this::locateInDCDelta));

        return Flux.concat(datasetBisCandidates, transformerAlerts, consumerAlerts);
    }

    private Stream<AlertBISCandidate> locateInDSDelta(final String datasetOddrn,
                                                      final DatasetStructureDelta delta) {
        if (CollectionUtils.isEmpty(delta.getPenultimate())) {
            return Stream.empty();
        }

        final Map<DatasetFieldKey, DatasetFieldPojo> latestVersionFields = ListUtils.emptyIfNull(delta.getLatest())
            .stream()
            .collect(Collectors.toMap(f -> new DatasetFieldKey(f.getOddrn(), f.getType().data()), identity()));

        return delta.getPenultimate()
            .stream()
            .filter(f -> !latestVersionFields.containsKey(new DatasetFieldKey(f.getOddrn(), f.getType().data())))
            .map(df -> new AlertBISCandidate(
                datasetOddrn,
                String.format("Missing field: %s", df.getName()))
            );
    }

    private Stream<AlertBISCandidate> locateInDTDelta(final DataEntitySpecificAttributesDelta delta) {
        final DataTransformerAttributes oldAttr = extractDTAttributes(delta.oldAttrsJson());
        final DataTransformerAttributes newAttr = extractDTAttributes(delta.newAttrsJson());

        final Stream<AlertBISCandidate> sourceAlerts = SetUtils
            .difference(oldAttr.getSourceOddrnList(), newAttr.getSourceOddrnList())
            .stream()
            .map(source -> new AlertBISCandidate(
                delta.oddrn(),
                String.format("Missing source: %s", source)
            ));

        final Stream<AlertBISCandidate> targetAlerts = SetUtils
            .difference(oldAttr.getTargetOddrnList(), newAttr.getTargetOddrnList())
            .stream()
            .map(source -> new AlertBISCandidate(
                delta.oddrn(),
                String.format("Missing target: %s", source)
            ));

        return Stream.concat(sourceAlerts, targetAlerts);
    }

    private Stream<AlertBISCandidate> locateInDCDelta(final DataEntitySpecificAttributesDelta delta) {
        return SetUtils.difference(
                extractDCAttributes(delta.oldAttrsJson()).getInputListOddrn(),
                extractDCAttributes(delta.newAttrsJson()).getInputListOddrn()
            )
            .stream()
            .map(source -> new AlertBISCandidate(
                delta.oddrn(),
                String.format("Missing input: %s", source)
            ));
    }

    private DataTransformerAttributes extractDTAttributes(final String json) {
        final Map<DataEntityClassDto, ?> specificAttributes =
            JSONSerDeUtils.deserializeJson(json, new TypeReference<Map<DataEntityClassDto, ?>>() {
            });

        return JSONSerDeUtils.deserializeJson(
            specificAttributes.get(DataEntityClassDto.DATA_TRANSFORMER),
            DataTransformerAttributes.class
        );
    }

    private DataConsumerAttributes extractDCAttributes(final String json) {
        final Map<DataEntityClassDto, ?> specificAttributes =
            JSONSerDeUtils.deserializeJson(json, new TypeReference<Map<DataEntityClassDto, ?>>() {
            });

        return JSONSerDeUtils.deserializeJson(
            specificAttributes.get(DataEntityClassDto.DATA_CONSUMER),
            DataConsumerAttributes.class
        );
    }

    private record DatasetFieldKey(String oddrn, String typeJson) {
    }
}
