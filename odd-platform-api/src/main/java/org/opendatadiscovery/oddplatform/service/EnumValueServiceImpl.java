package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValue;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import org.opendatadiscovery.oddplatform.mapper.EnumValueMapper;
import org.opendatadiscovery.oddplatform.repository.EnumValueRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class EnumValueServiceImpl implements EnumValueService {
    private final EnumValueRepository enumValueRepository;
    private final EnumValueMapper mapper;

    @Override
    public Mono<EnumValueList> createEnumValues(final Long datasetFieldId, final List<EnumValueFormData> formData) {
        return Flux.fromStream(formData.stream())
            .map(fd -> mapper.mapForm(fd, datasetFieldId))
            .collectList()
            .map(list -> enumValueRepository.updateFieldEnumValues(datasetFieldId, list))
            .map(pojos -> {
                final List<EnumValue> items = pojos.stream().map(mapper::mapPojo).toList();
                return new EnumValueList().items(items);
            });
    }

    @Override
    public Mono<EnumValueList> getEnumValues(final Long datasetFieldId) {
        return Mono.just(datasetFieldId)
            .map(fieldId -> enumValueRepository.getEnumValuesByFieldId(datasetFieldId))
            .map(pojos -> {
                final List<EnumValue> enumValues = pojos.stream().map(mapper::mapPojo).toList();
                return new EnumValueList().items(enumValues);
            });
    }
}
