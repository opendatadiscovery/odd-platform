package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveMetadataFieldRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * BEHAVIORAL unit test for the metadata-field catalogue — validates F-046 (Custom Metadata Field
 * Catalogue): reading a field by a missing id errors NotFound; and the get-or-create path is idempotent
 * on the catalogue — it bulk-creates ONLY the keys not already present and returns the union of newly
 * created + pre-existing fields (no duplicate field is ever created). Exercised with Mockito +
 * StepVerifier + ArgumentCaptor. No prior MetadataFieldServiceImpl unit test.
 *
 * @validates F-046
 */
@ExtendWith(MockitoExtension.class)
class MetadataFieldServiceImplTest {

    @Mock private ReactiveMetadataFieldRepository reactiveMetadataFieldRepository;
    @Mock private MetadataFieldMapper mapper;
    @Captor private ArgumentCaptor<Collection<MetadataFieldPojo>> bulkCreateCaptor;

    private MetadataFieldService service;

    @BeforeEach
    void setUp() {
        service = new MetadataFieldServiceImpl(reactiveMetadataFieldRepository, mapper);
    }

    @Test
    void get_nonExistentField_errorsNotFound() {
        when(reactiveMetadataFieldRepository.get(anyLong())).thenReturn(Mono.empty());
        StepVerifier.create(service.get(1L)).verifyError(NotFoundException.class);
    }

    @Test
    void getOrCreateMetadataFields_createsOnlyMissingFields() {
        final MetadataFieldPojo existing = new MetadataFieldPojo().setName("A").setType("STRING");
        final MetadataFieldPojo missing = new MetadataFieldPojo().setName("B").setType("STRING");
        // "A" already exists in the catalogue; "B" does not.
        when(reactiveMetadataFieldRepository.listByKey(any())).thenReturn(Flux.just(existing));
        when(reactiveMetadataFieldRepository.bulkCreate(any())).thenReturn(Flux.just(missing));

        StepVerifier.create(service.getOrCreateMetadataFields(List.of(existing, missing)))
            .assertNext(result -> assertThat(result).containsExactlyInAnyOrder(existing, missing))
            .verifyComplete();

        verify(reactiveMetadataFieldRepository).bulkCreate(bulkCreateCaptor.capture());
        assertThat(bulkCreateCaptor.getValue()).containsExactly(missing);
    }
}
