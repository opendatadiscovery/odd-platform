package org.opendatadiscovery.oddplatform.service.ingestion;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.EnumValueDto;
import org.opendatadiscovery.oddplatform.dto.EnumValueOrigin;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.IngestionRequest;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldEnumValue;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static java.util.function.Function.identity;
import static java.util.stream.Collectors.toMap;
import static org.opendatadiscovery.oddplatform.dto.EnumValueDto.EnumValueDtoPayload;

@Service
@RequiredArgsConstructor
@Slf4j
public class EnumValuesIngestionServiceImpl implements EnumValuesIngestionService {
    private final ReactiveEnumValueRepository enumValueRepository;

    @Override
    public Mono<Void> ingestEnumValues(final IngestionRequest dataStructure) {
        // TODO: implement validation that can allow do not query a database
        //  1. (empty datasets is already implemented)
        //  2. (empty labels in the state and in the request)

        // get current state
        // delete everything from the old state
        // if description == null -> allow user to create descriptions
        // if description != null -> do not allow user to update descriptions
        // if current_description != null and description != null -> description takes precedence and rewrites
        //      current description
        final List<EnrichedDataEntityIngestionDto> datasetEntities = dataStructure.getAllEntities()
            .stream()
            .filter(e -> e.getEntityClasses().contains(DataEntityClassDto.DATA_SET))
            .toList();

        final var dict = datasetEntities.stream()
            .flatMap(dataset -> dataset.getDataSet().fieldList().stream())
            .collect(toMap(field -> field.field().getOddrn(), identity()));

        return enumValueRepository.getEnumState(dict.keySet())
            .collectMap(EnumValueDto::fieldOddrn)
            .flatMap(state -> {
                final List<EnumValuePojo> toCreate = new ArrayList<>();
                final List<Long> toDelete = new ArrayList<>();
                final Map<Long, String> toUpdate = new HashMap<>();

                for (final var entry : dict.entrySet()) {
                    final var enumValueDto = state.get(entry.getKey());

                    if (enumValueDto == null) {
                        return Mono.error(new IllegalStateException("Payload is null"));
                    }

                    final EnumValueDtoPayload currentFieldPayload = enumValueDto.payload();

                    if (CollectionUtils.isEmpty(currentFieldPayload.enumValues())) {
                        // TODO: entry.getValue().enumValues() can be null!!
                        //  but why only here?
                        final List<EnumValuePojo> enumValues =
                            CollectionUtils.emptyIfNull(entry.getValue().enumValues())
                                .stream()
                                .map(ev -> new EnumValuePojo()
                                    .setOrigin(EnumValueOrigin.EXTERNAL.getCode())
                                    .setDatasetFieldId(currentFieldPayload.fieldId())
                                    .setExternalDescription(StringUtils.defaultIfBlank(ev.getDescription(), null))
                                    .setName(ev.getName()))
                                .toList();

                        toCreate.addAll(enumValues);
                        continue;
                    }

                    toDelete.addAll(prepareForDelete(currentFieldPayload.enumValues(), entry.getValue().enumValues()));
                    toCreate.addAll(prepareForCreate(entry.getValue().enumValues(), currentFieldPayload.enumValues(),
                        currentFieldPayload.fieldId()));
                    toUpdate.putAll(prepareForUpdate(currentFieldPayload.enumValues(), entry.getValue().enumValues()));

                }

                return Flux.merge(
                    enumValueRepository.bulkCreate(toCreate),
                    enumValueRepository.delete(toDelete),
                    enumValueRepository.updateExternalDescriptions(toUpdate)
                ).collectList();
            })
            .then();
    }

    private List<EnumValuePojo> prepareForCreate(final List<DataSetFieldEnumValue> base,
                                                 final List<EnumValuePojo> deduction,
                                                 // TODO: could be taken from deduction list's member
                                                 final long datasetFieldId) {
        final Set<String> collect = deduction.stream().map(EnumValuePojo::getName).collect(Collectors.toSet());

        final List<EnumValuePojo> result = new ArrayList<>();
        for (final DataSetFieldEnumValue ev : base) {
            if (!collect.contains(ev.getName())) {
                result.add(new EnumValuePojo()
                    .setOrigin(EnumValueOrigin.EXTERNAL.getCode())
                    .setDatasetFieldId(datasetFieldId)
                    .setExternalDescription(StringUtils.defaultIfBlank(ev.getDescription(), null))
                    .setName(ev.getName()));
            }
        }

        return result;
    }

    private List<Long> prepareForDelete(final List<EnumValuePojo> base, final List<DataSetFieldEnumValue> deduction) {
        final Set<String> collect = deduction.stream().map(DataSetFieldEnumValue::getName).collect(Collectors.toSet());
        final List<Long> list = new ArrayList<>();
        for (final EnumValuePojo enumValuePojo : base) {
            if (!collect.contains(enumValuePojo.getName())) {
                list.add(enumValuePojo.getId());
            }
        }
        return list;
    }


    private Map<Long, String> prepareForUpdate(final List<EnumValuePojo> currentEnums,
                                               final List<DataSetFieldEnumValue> deltaList) {
        final Map<String, DataSetFieldEnumValue> collect =
            deltaList.stream().collect(toMap(DataSetFieldEnumValue::getName, identity()));

        final Map<Long, String> result = new HashMap<>();

        for (final EnumValuePojo ev : currentEnums) {
            final DataSetFieldEnumValue delta = collect.get(ev.getName());

            if (delta != null && StringUtils.isNotEmpty(delta.getDescription()) &&
                !delta.getDescription().equals(ev.getExternalDescription())
            ) {
                result.put(ev.getId(), delta.getDescription());
            }
        }

        return result;
    }
}