package org.opendatadiscovery.oddplatform.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.mapper.NamespaceMapper;
import org.opendatadiscovery.oddplatform.mapper.NamespaceMapperImpl;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.only;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NamespaceServiceImplTest {
    private NamespaceService namespaceService;

    @Mock
    private ReactiveNamespaceRepository namespaceRepository;

    @Mock
    private ReactiveDataSourceRepository dataSourceRepository;

    @Mock
    private NamespaceMapper namespaceMapper;

    @BeforeEach
    void setUp() {
        namespaceService = new NamespaceServiceImpl(namespaceRepository, dataSourceRepository, namespaceMapper);
    }

    @Test
    @DisplayName("Gets existing data from the repository and maps it to the OpenAPI model")
    public void testGetExistingData() {
        final long namespaceId = 1;
        final String namespaceName = UUID.randomUUID().toString();

        final NamespacePojo namespace = new NamespacePojo()
            .setId(namespaceId)
            .setName(namespaceName)
            .setCreatedAt(LocalDateTime.now())
            .setUpdatedAt(LocalDateTime.now())
            .setIsDeleted(false)
            .setDeletedAt(null);

        final Namespace expected = new Namespace()
            .id(namespaceId)
            .name(namespaceName);

        when(namespaceRepository.get(eq(namespaceId))).thenReturn(Mono.just(namespace));
        when(namespaceMapper.mapPojo(eq(namespace))).thenReturn(expected);

        StepVerifier.create(namespaceService.get(namespaceId))
            .assertNext(actual -> assertThat(actual).isEqualTo(expected))
            .verifyComplete();

        verify(namespaceRepository, only()).get(eq(namespaceId));
        verify(namespaceMapper, only()).mapPojo(eq(namespace));
    }

    @Test
    @DisplayName("Emits an empty publisher since there's no namespace in the database with given id")
    public void testGetNonExistingData() {
        final long namespaceId = 1;

        when(namespaceRepository.get(eq(namespaceId))).thenReturn(Mono.empty());

        StepVerifier.create(namespaceService.get(namespaceId)).verifyComplete();

        verify(namespaceRepository, only()).get(eq(namespaceId));
        verify(namespaceMapper, never()).mapPojo(any());
    }

    @Test
    @DisplayName("Creates a namespace by calling the namespace repository")
    public void testCreate() {

    }
}