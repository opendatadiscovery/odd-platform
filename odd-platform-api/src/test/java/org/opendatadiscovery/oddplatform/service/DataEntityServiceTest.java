package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldOrigin;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldType;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValueUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataObject;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.MetadataDto;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldValueMapper;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.LineageRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldRepository;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldValueRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTagRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DataEntityServiceTest {

    private DataEntityService dataEntityService;
    @Mock
    private DataEntityRepository dataEntityRepository;
    @Mock
    private AuthIdentityProvider authIdentityProvider;
    @Mock
    private MetadataFieldValueRepository metadataFieldValueRepository;
    @Mock
    private MetadataFieldRepository metadataFieldRepository;
    @Mock
    private TagService tagService;
    @Mock
    private LineageRepository lineageRepository;
    @Mock
    private DataEntityMapper dataEntityMapper;
    @Mock
    private MetadataFieldMapper metadataFieldMapper;
    @Mock
    private MetadataFieldValueMapper metadataFieldValueMapper;
    @Mock
    private TagMapper tagMapper;
    @Mock
    private ReactiveSearchEntrypointRepository reactiveSearchEntrypointRepository;

    @BeforeEach
    public void beforeAll() {
        dataEntityService = new DataEntityServiceImpl(dataEntityMapper, dataEntityRepository, authIdentityProvider,
            metadataFieldValueRepository, metadataFieldRepository, tagService, lineageRepository,
            metadataFieldMapper, metadataFieldValueMapper, reactiveSearchEntrypointRepository, tagMapper);
    }

    @Test
    public void createMetadataTest() {
        final long fieldId = 1L;
        final long dataEntityId = 1L;
        final String metadataFieldName = UUID.randomUUID().toString();
        final String metadataValue = UUID.randomUUID().toString();
        final MetadataFieldType type = MetadataFieldType.STRING;
        final MetadataFieldOrigin origin = MetadataFieldOrigin.INTERNAL;

        final MetadataObject metadataObject = createMetadataObject(metadataFieldName, type, origin, metadataValue);
        final MetadataFieldPojo fieldPojoBeforeCreation = createFieldPojo(null, metadataFieldName, type, origin);
        final MetadataFieldPojo fieldPojoAfterCreation = createFieldPojo(fieldId, metadataFieldName, type, origin);
        final MetadataFieldValuePojo valuePojo = createValuePojo(metadataValue, dataEntityId, fieldId);
        final MetadataFieldValue metadataFieldValue =
            createMetadataFieldValue(metadataFieldName, type, origin, metadataValue);

        when(metadataFieldMapper.mapObject(metadataObject)).thenReturn(fieldPojoBeforeCreation);
        when(metadataFieldRepository.createIfNotExist(List.of(fieldPojoBeforeCreation)))
            .thenReturn(List.of(fieldPojoAfterCreation));
        when(metadataFieldValueRepository.bulkCreate(List.of(valuePojo))).thenReturn(List.of(valuePojo));
        when(metadataFieldValueMapper.mapDto(new MetadataDto(fieldPojoAfterCreation, valuePojo)))
            .thenReturn(metadataFieldValue);
        doNothing().when(dataEntityRepository).calculateMetadataVectors(List.of(dataEntityId));

        final Mono<MetadataFieldValueList> metadataMono =
            dataEntityService.createMetadata(dataEntityId, List.of(metadataObject));
        StepVerifier.create(metadataMono)
            .assertNext(l -> assertThat(l.getItems())
                .hasSize(1)
                .containsExactly(metadataFieldValue))
            .expectComplete()
            .verify();
    }

    @Test
    public void upsertMetadataFieldValueTest() {
        final long fieldId = 1L;
        final long dataEntityId = 1L;
        final String newValue = UUID.randomUUID().toString();
        final String metadataFieldName = UUID.randomUUID().toString();
        final MetadataFieldType type = MetadataFieldType.STRING;
        final MetadataFieldOrigin origin = MetadataFieldOrigin.INTERNAL;

        final MetadataFieldValueUpdateFormData formData = new MetadataFieldValueUpdateFormData().value(newValue);
        final MetadataFieldPojo metadataFieldPojo = createFieldPojo(fieldId, metadataFieldName, type, origin);
        final MetadataFieldValuePojo valuePojo = createValuePojo(newValue, dataEntityId, fieldId);
        final MetadataFieldValue metadataFieldValue =
            createMetadataFieldValue(metadataFieldName, type, origin, newValue);

        when(metadataFieldRepository.get(fieldId)).thenReturn(Optional.of(metadataFieldPojo));
        when(metadataFieldValueRepository.update(valuePojo)).thenReturn(valuePojo);
        when(metadataFieldValueMapper.mapDto(new MetadataDto(metadataFieldPojo, valuePojo)))
            .thenReturn(metadataFieldValue);
        doNothing().when(dataEntityRepository).calculateMetadataVectors(anyCollection());

        final Mono<MetadataFieldValue> result =
            dataEntityService.upsertMetadataFieldValue(dataEntityId, fieldId, formData);
        StepVerifier.create(result)
            .assertNext(mfv -> assertThat(mfv).isEqualTo(metadataFieldValue))
            .expectComplete()
            .verify();
    }

    private MetadataFieldPojo createFieldPojo(final Long id, final String name, final MetadataFieldType type,
                                              final MetadataFieldOrigin origin) {
        return new MetadataFieldPojo()
            .setId(id)
            .setName(name)
            .setType(type.name())
            .setOrigin(origin.name());
    }

    private MetadataObject createMetadataObject(final String name, final MetadataFieldType type,
                                                final MetadataFieldOrigin origin,
                                                final String metadataValue) {
        return new MetadataObject()
            .name(name)
            .type(type)
            .value(metadataValue)
            .origin(origin);
    }

    private MetadataFieldValuePojo createValuePojo(final String metadataValue,
                                                   final Long dataEntityId,
                                                   final Long fieldId) {
        return new MetadataFieldValuePojo()
            .setValue(metadataValue)
            .setDataEntityId(dataEntityId)
            .setMetadataFieldId(fieldId);
    }

    private MetadataFieldValue createMetadataFieldValue(final String fieldName, final MetadataFieldType type,
                                                        final MetadataFieldOrigin origin,
                                                        final String metadataValue) {
        return new MetadataFieldValue()
            .field(new MetadataField().name(fieldName).type(type).origin(origin))
            .value(metadataValue);
    }
}
