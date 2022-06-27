package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataEntityMapper;
import org.opendatadiscovery.oddplatform.mapper.DataQualityMapper;
import org.opendatadiscovery.oddplatform.repository.DataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataQualityRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.only;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataQualityServiceImplTest {
    private DataQualityService dataQualityService;

    @Mock
    private ReactiveDataQualityRepository dataQualityRepository;

    @Mock
    private ReactiveDataEntityRepository reactiveDataEntityRepository;

    @Mock
    private DataEntityRepository dataEntityRepository;

    @Mock
    private DataQualityMapper dataQualityMapper;

    @Mock
    private DataEntityMapper dataEntityMapper;


    @BeforeEach
    void setUp() {
        dataQualityService = new DataQualityServiceImpl(dataQualityRepository, reactiveDataEntityRepository,
            dataEntityRepository, dataQualityMapper, dataEntityMapper);
    }

    @Test
    void testNonExistentDatasetTrafficLight() {
        final long datasetId = 1L;

        when(reactiveDataEntityRepository.exists(eq(datasetId))).thenReturn(Mono.just(false));

        StepVerifier.create(dataQualityService.getTrafficLight(datasetId))
            .expectError(NotFoundException.class)
            .verify();

        verify(reactiveDataEntityRepository, only()).exists(eq(datasetId));
        verify(dataQualityRepository, never()).getDatasetTrafficLight(eq(datasetId));
    }

    @Test
    void testDatasetTrafficLight() {

    }
}