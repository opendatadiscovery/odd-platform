package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.dto.DataEntityFilledField;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityFilledPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityFilledRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataEntityFilledServiceImpl implements DataEntityFilledService {
    private final ReactiveDataEntityFilledRepository reactiveDataEntityFilledRepository;

    @Override
    public Mono<Long> getFilledDataEntitiesCount() {
        return reactiveDataEntityFilledRepository.getFilledDataEntitiesCount();
    }

    @Override
    public Mono<DataEntityFilledPojo> markEntityFilled(final Long dataEntityId,
                                                       final DataEntityFilledField dataEntityFilledField) {
        return reactiveDataEntityFilledRepository.markEntityFilled(dataEntityId, dataEntityFilledField);
    }

    @Override
    public Mono<DataEntityFilledPojo> markEntityFilledByDatasetFieldId(final Long datasetFieldId,
                                                                       final DataEntityFilledField filledField) {
        return reactiveDataEntityFilledRepository.markEntityFilledByDatasetField(datasetFieldId, filledField);
    }

    @Override
    @ReactiveTransactional
    public Mono<DataEntityFilledPojo> markEntityUnfilled(final Long dataEntityId,
                                                         final DataEntityFilledField dataEntityFilledField) {
        if (dataEntityFilledField == DataEntityFilledField.MANUALLY_CREATED) {
            return reactiveDataEntityFilledRepository.delete(dataEntityId);
        }
        return reactiveDataEntityFilledRepository.markEntityUnfilled(dataEntityId, dataEntityFilledField)
            .flatMap(pojo -> {
                if (needToDelete(pojo)) {
                    return reactiveDataEntityFilledRepository.delete(dataEntityId);
                }
                return Mono.just(pojo);
            });
    }

    @Override
    @ReactiveTransactional
    public Mono<DataEntityFilledPojo> markEntityUnfilledByDatasetFieldId(final Long datasetFieldId,
                                                                         final DataEntityFilledField filledField) {
        return reactiveDataEntityFilledRepository.markEntityUnfilledByDatasetField(datasetFieldId, filledField)
            .flatMap(pojo -> {
                if (needToDelete(pojo)) {
                    return reactiveDataEntityFilledRepository.delete(pojo.getDataEntityId());
                }
                return Mono.just(pojo);
            });
    }

    private boolean needToDelete(final DataEntityFilledPojo pojo) {
        return !pojo.getInternalNameFilled()
            && !pojo.getInternalDescriptionFilled()
            && !pojo.getInternalMetadataFilled()
            && !pojo.getOwnersFilled()
            && !pojo.getCustomGroupFilled()
            && !pojo.getInternalTagsFilled()
            && !pojo.getTermsFilled()
            && !pojo.getDatasetFieldDescriptionFilled()
            && !pojo.getDatasetFieldLabelsFilled()
            && !pojo.getDatasetFieldEnumsFilled()
            && !pojo.getManuallyCreated();
    }
}
