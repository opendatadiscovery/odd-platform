package org.opendatadiscovery.oddplatform.service;

import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.NamespaceMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermSearchEntrypointRepository;
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
class NamespaceServiceImplTest {
    private NamespaceService namespaceService;

    @Mock
    private ReactiveNamespaceRepository namespaceRepository;

    @Mock
    private ReactiveDataSourceRepository dataSourceRepository;

    @Mock
    private ReactiveTermRepository termRepository;

    @Mock
    private ReactiveCollectorRepository collectorRepository;

    @Mock
    private ReactiveSearchEntrypointRepository searchEntrypointRepository;

    @Mock
    private ReactiveTermSearchEntrypointRepository termSearchEntrypointRepository;

    @Mock
    private NamespaceMapper namespaceMapper;

    @BeforeEach
    void setUp() {
        this.namespaceService = new NamespaceServiceImpl(namespaceRepository, termRepository, dataSourceRepository,
            collectorRepository, searchEntrypointRepository, termSearchEntrypointRepository, namespaceMapper);
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

        StepVerifier.create(namespaceService.get(namespaceId)).verifyError(NotFoundException.class);

        verify(namespaceRepository, only()).get(eq(namespaceId));
        verify(namespaceMapper, never()).mapPojo(any());
    }

    @Test
    @DisplayName("Creates a namespace by calling the namespace repository")
    public void testCreate() {
        final long namespaceId = 1L;
        final NamespaceFormData form = new NamespaceFormData()
            .name(UUID.randomUUID().toString());

        final NamespacePojo mappedForm = new NamespacePojo()
            .setName(form.getName());

        final NamespacePojo createdPojo = new NamespacePojo()
            .setId(namespaceId)
            .setName(form.getName())
            .setIsDeleted(false)
            .setCreatedAt(LocalDateTime.now());

        final Namespace expected = new Namespace()
            .id(namespaceId)
            .name(form.getName());

        when(namespaceRepository.create(eq(mappedForm))).thenReturn(Mono.just(createdPojo));
        when(namespaceMapper.mapForm(eq(form))).thenReturn(mappedForm);
        when(namespaceMapper.mapPojo(eq(createdPojo))).thenReturn(expected);

        StepVerifier.create(namespaceService.create(form))
            .assertNext(actual -> assertThat(actual).isEqualTo(expected))
            .verifyComplete();

        verify(namespaceRepository, only()).create(eq(mappedForm));
        verify(namespaceMapper, times(1)).mapForm(eq(form));
        verify(namespaceMapper, times(1)).mapPojo(eq(createdPojo));
    }

    @Test
    @DisplayName("Updates an exising namespace in the database")
    public void testUpdateExistingNamespace() {
        final long namespaceId = 1L;

        final String newName = UUID.randomUUID().toString();

        final NamespaceUpdateFormData form = new NamespaceUpdateFormData().name(newName);

        final NamespacePojo namespace = new NamespacePojo()
            .setId(namespaceId)
            .setName(UUID.randomUUID().toString())
            .setCreatedAt(LocalDateTime.now())
            .setIsDeleted(false)
            .setUpdatedAt(LocalDateTime.now());

        final NamespacePojo appliedFormPojo = new NamespacePojo()
            .setName(newName);

        final NamespacePojo updatedPojo = new NamespacePojo(namespace)
            .setName(newName)
            .setUpdatedAt(LocalDateTime.now());

        final Namespace expected = new Namespace()
            .id(namespaceId)
            .name(newName);

        when(namespaceRepository.get(eq(namespaceId))).thenReturn(Mono.just(namespace));
        when(namespaceRepository.update(eq(appliedFormPojo))).thenReturn(Mono.just(updatedPojo));
        when(searchEntrypointRepository.updateChangedNamespaceVector(eq(namespaceId))).thenReturn(Mono.just(0));
        when(termSearchEntrypointRepository.updateChangedNamespaceVector(eq(namespaceId))).thenReturn(Mono.just(0));
        when(namespaceMapper.applyToPojo(eq(namespace), eq(form))).thenReturn(appliedFormPojo);
        when(namespaceMapper.mapPojo(eq(updatedPojo))).thenReturn(expected);

        StepVerifier.create(namespaceService.update(namespaceId, form))
            .assertNext(actual -> assertThat(actual).isEqualTo(expected))
            .verifyComplete();

        verify(namespaceRepository, times(1)).get(eq(namespaceId));
        verify(namespaceRepository, times(1)).update(eq(appliedFormPojo));
        verify(searchEntrypointRepository, only()).updateChangedNamespaceVector(eq(namespaceId));
        verify(termSearchEntrypointRepository, only()).updateChangedNamespaceVector(eq(namespaceId));
        verify(namespaceMapper, times(1)).applyToPojo(eq(namespace), eq(form));
        verify(namespaceMapper, times(1)).mapPojo(eq(updatedPojo));
    }

    @Test
    @DisplayName("Tries to update nonexistent namespace in the database and fails with an error")
    public void testUpdateNonExistingNamespace() {
        final long nonExistentNamespaceId = 1L;

        when(namespaceRepository.get(eq(nonExistentNamespaceId))).thenReturn(Mono.empty());

        namespaceService.update(nonExistentNamespaceId, new NamespaceUpdateFormData())
            .as(StepVerifier::create)
            .verifyError(NotFoundException.class);

        verify(namespaceRepository, times(1)).get(eq(nonExistentNamespaceId));
        verify(namespaceRepository, never()).update(any());
        verify(searchEntrypointRepository, never()).updateChangedNamespaceVector(anyLong());
        verify(termSearchEntrypointRepository, never()).updateChangedNamespaceVector(anyLong());
        verify(namespaceMapper, never()).applyToPojo(any(), any());
        verify(namespaceMapper, never()).mapPojo(any());
    }

    @Test
    @DisplayName("Deletes a namespace which isn't tied with any data sources, collector or term from the database")
    public void testDelete() {
        final long namespaceId = 1L;

        final NamespacePojo namespace = new NamespacePojo()
            .setId(namespaceId)
            .setDeletedAt(LocalDateTime.now())
            .setIsDeleted(true);

        when(dataSourceRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));
        when(collectorRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));
        when(termRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));
        when(namespaceRepository.delete(eq(namespaceId))).thenReturn(Mono.just(namespace));

        namespaceService.delete(namespaceId)
            .as(StepVerifier::create)
            .assertNext(deletedNamespaceId -> assertThat(deletedNamespaceId).isEqualTo(namespaceId))
            .verifyComplete();

        verify(namespaceRepository, only()).delete(eq(namespaceId));
        verify(dataSourceRepository, only()).existsByNamespace(eq(namespaceId));
        verify(collectorRepository, only()).existsByNamespace(eq(namespaceId));
        verify(termRepository, only()).existsByNamespace(eq(namespaceId));
    }

    @Test
    @DisplayName("Tries to delete a namespace which is tied with existing collector and fails with an error")
    public void testDeleteTiedNamespaceWithCollector() {
        final long namespaceId = 1L;

        when(collectorRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(true));
        when(dataSourceRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));
        when(termRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));

        namespaceService.delete(namespaceId)
            .as(StepVerifier::create)
            .verifyError(IllegalStateException.class);

        verify(namespaceRepository, never()).delete(eq(namespaceId));
        verify(dataSourceRepository, only()).existsByNamespace(eq(namespaceId));
        verify(collectorRepository, only()).existsByNamespace(eq(namespaceId));
        verify(termRepository, only()).existsByNamespace(eq(namespaceId));
    }

    @Test
    @DisplayName("Tries to delete a namespace which is tied with existing data source and fails with an error")
    public void testDeleteTiedNamespaceWithDataSource() {
        final long namespaceId = 1L;

        when(collectorRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));
        when(dataSourceRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(true));
        when(termRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));

        namespaceService.delete(namespaceId)
            .as(StepVerifier::create)
            .verifyError(IllegalStateException.class);

        verify(namespaceRepository, never()).delete(eq(namespaceId));
        verify(dataSourceRepository, only()).existsByNamespace(eq(namespaceId));
        verify(termRepository, only()).existsByNamespace(eq(namespaceId));
        verify(collectorRepository, only()).existsByNamespace(eq(namespaceId));
    }

    @Test
    @DisplayName("Tries to delete a namespace which is tied with existing term and fails with an error")
    public void testDeleteTiedNamespaceWithTerm() {
        final long namespaceId = 1L;

        when(collectorRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));
        when(dataSourceRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(false));
        when(termRepository.existsByNamespace(eq(namespaceId))).thenReturn(Mono.just(true));

        namespaceService.delete(namespaceId)
            .as(StepVerifier::create)
            .verifyError(IllegalStateException.class);

        verify(namespaceRepository, never()).delete(eq(namespaceId));
        verify(dataSourceRepository, only()).existsByNamespace(eq(namespaceId));
        verify(termRepository, only()).existsByNamespace(eq(namespaceId));
        verify(collectorRepository, only()).existsByNamespace(eq(namespaceId));
    }
}