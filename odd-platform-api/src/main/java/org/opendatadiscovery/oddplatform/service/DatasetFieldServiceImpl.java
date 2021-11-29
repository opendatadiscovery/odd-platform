package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import org.opendatadiscovery.oddplatform.mapper.DatasetFieldApiMapper;
import org.opendatadiscovery.oddplatform.repository.DatasetFieldRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DatasetFieldServiceImpl implements DatasetFieldService {
    private final DatasetFieldRepository datasetFieldRepository;
    private final DatasetFieldApiMapper datasetFieldApiMapper;

    @Override
    public Mono<DataSetField> updateDatasetField(final long datasetFieldId,
                                                 final DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        return Mono.just(datasetFieldUpdateFormData)
            .map(formData -> datasetFieldRepository.updateDatasetField(datasetFieldId, datasetFieldUpdateFormData))
            .map(datasetFieldApiMapper::mapDto);
    }
}
