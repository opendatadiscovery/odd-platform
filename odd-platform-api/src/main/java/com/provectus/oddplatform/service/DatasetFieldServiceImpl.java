package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataSetField;
import com.provectus.oddplatform.api.contract.model.DatasetFieldUpdateFormData;
import com.provectus.oddplatform.mapper.DatasetFieldApiMapper;
import com.provectus.oddplatform.repository.DatasetFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DatasetFieldServiceImpl implements DatasetFieldService {
    private final DatasetFieldRepository datasetFieldRepository;
    private final DatasetFieldApiMapper datasetFieldApiMapper;

    @Override
    public Mono<DataSetField> updateDatasetField(long datasetFieldId,
                                                 DatasetFieldUpdateFormData datasetFieldUpdateFormData) {
        return Mono.just(datasetFieldUpdateFormData)
            .map(formData -> datasetFieldRepository.updateDatasetField(datasetFieldId, datasetFieldUpdateFormData))
            .map(datasetFieldApiMapper::mapDto);
    }
}
