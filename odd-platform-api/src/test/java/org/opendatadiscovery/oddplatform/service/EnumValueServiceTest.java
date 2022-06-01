package org.opendatadiscovery.oddplatform.service;

import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import org.opendatadiscovery.oddplatform.mapper.EnumValueMapper;
import org.opendatadiscovery.oddplatform.mapper.EnumValueMapperImpl;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveEnumValueRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit tests for EnumValueService")
public class EnumValueServiceTest {

    private EnumValueService enumValueService;

    @Mock
    private ReactiveEnumValueRepository enumValueRepository;

    @Spy
    private EnumValueMapper enumValueMapper = new EnumValueMapperImpl();

    final long datasetFieldId = 1L;

    final long existingEnumId = 2L;

    final String existingEnumName = "existingEnum";

    final String existingEnumDescription = "Existing enum";

    final long newEnumId = 3L;

    final String newEnumName = "newEnum";

    final String newEnumDescription = "New enum";

    final EnumValueFormData existingEnum = new EnumValueFormData()
        .id(existingEnumId)
        .name(existingEnumName)
        .description(existingEnumDescription);

    final EnumValueFormData newEnum = new EnumValueFormData()
        .name(newEnumName)
        .description(newEnumDescription);

    final EnumValuePojo existingEnumPojo = enumValueMapper.mapToPojo(existingEnum, datasetFieldId);

    final EnumValuePojo newEnumPojo = enumValueMapper.mapToPojo(newEnum, datasetFieldId).setId(newEnumId);

    @BeforeEach
    void setUp() {
        enumValueService = new EnumValueServiceImpl(enumValueRepository, enumValueMapper);
    }

    @Test
    @DisplayName("Creates new enums, updates existing ones and soft deletes the rest")
    public void testCreateEnumValues() {
        final EnumValueList expected = new EnumValueList().items(List.of(
            enumValueMapper.mapToEnum(existingEnumPojo),
            enumValueMapper.mapToEnum(newEnumPojo)
        ));

        when(enumValueRepository.bulkCreate(anyList()))
            .thenReturn(Flux.just(newEnumPojo));

        when(enumValueRepository.bulkUpdate(anyList()))
            .thenReturn(Flux.just(existingEnumPojo));

        when(enumValueRepository.softDeleteOutdatedEnumValues(anyLong(), anyList())).thenReturn(Flux.just());

        enumValueService
            .createEnumValues(datasetFieldId, List.of(existingEnum, newEnum))
            .as(StepVerifier::create)
            .assertNext(r -> assertThat(r).isEqualTo(expected))
            .verifyComplete();

        verify(enumValueRepository, Mockito.times(1))
            .softDeleteOutdatedEnumValues(datasetFieldId, List.of(existingEnumId));
        verify(enumValueRepository, Mockito.times(1))
            .bulkCreate(List.of(enumValueMapper.mapToPojo(newEnum, datasetFieldId)));
        verify(enumValueRepository, Mockito.times(1))
            .bulkUpdate(List.of(enumValueMapper.mapToPojo(existingEnum, datasetFieldId)));
    }

    @Test
    @DisplayName("Throws exception if enums have same name")
    public void testCreateEnumValues_duplicates() {
        final EnumValueFormData duplicatedEnum = new EnumValueFormData()
            .name(existingEnumName);

        enumValueService
            .createEnumValues(datasetFieldId, List.of(existingEnum, duplicatedEnum))
            .as(StepVerifier::create)
            .expectErrorMatches(throwable -> throwable instanceof RuntimeException
                && throwable.getMessage().equals("There are duplicates in enum values"))
            .verify();
    }

    @Test
    @DisplayName("Returns enums by dataset field id")
    public void testGetEnumValues() {
        final EnumValueList expected = new EnumValueList().addItemsItem(
            enumValueMapper.mapToEnum(existingEnumPojo)
        );

        when(enumValueRepository.getEnumValuesByFieldId(datasetFieldId)).thenReturn(Flux.just(existingEnumPojo));

        final Mono<EnumValueList> result = enumValueService.getEnumValues(datasetFieldId);

        StepVerifier
            .create(result)
            .assertNext(r -> assertThat(r).isEqualTo(expected))
            .verifyComplete();
    }

    @Test
    @DisplayName("Returns no enums if they don't exist for a given dataset field id")
    public void testGetEnumValues_empty() {
        when(enumValueRepository.getEnumValuesByFieldId(datasetFieldId)).thenReturn(Flux.just());

        final Mono<EnumValueList> result = enumValueService.getEnumValues(datasetFieldId);

        final EnumValueList expected = new EnumValueList().items(Collections.emptyList());

        StepVerifier
            .create(result)
            .assertNext(r -> assertThat(r).isEqualTo(expected))
            .verifyComplete();
    }
}
