package org.opendatadiscovery.oddplatform.service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DataSourceIngestionMapper;
import org.opendatadiscovery.oddplatform.mapper.ingestion.DataSourceIngestionMapperImpl;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DataSourceIngestionServiceTest {

    private DataSourceIngestionService dataSourceIngestionService;

    @Mock
    private ReactiveDataSourceRepository reactiveDataSourceRepository;

    @Mock
    private ReactiveCollectorRepository reactiveCollectorRepository;

    private final DataSourceIngestionMapper dataSourceIngestionMapper = new DataSourceIngestionMapperImpl();

    private final long collectorId = 1L;

    @BeforeEach
    void setUp() {
        dataSourceIngestionService = new DataSourceIngestionServiceImpl(reactiveDataSourceRepository,
            reactiveCollectorRepository, dataSourceIngestionMapper);
    }

    @Test
    @DisplayName("Throws exception if the collector is empty")
    public void createDataSourcesForEmptyCollectorTest() {
        when(reactiveCollectorRepository.getDto(eq(collectorId)))
            .thenReturn(Mono.empty());

        dataSourceIngestionService
            .createDataSources(collectorId, new DataSourceList())
            .as(StepVerifier::create)
            .expectErrorMatches(throwable -> throwable instanceof NotFoundException)
            .verify();
    }

    @ParameterizedTest
    @MethodSource("dataSourcesProvider")
    @DisplayName("Creates new datasources or updates existing ones")
    public void createDataSourcesTest(final DataSourceList dataSourceList,
                                      final Collection<DataSource> expected,
                                      final Flux<DataSourceDto> dataSourceMock) {
        final var collectorDto = new CollectorDto(new CollectorPojo(), new NamespacePojo(),
            new TokenDto(new TokenPojo()));

        when(reactiveCollectorRepository.getDto(eq(collectorId)))
            .thenReturn(Mono.just(collectorDto));

        when(reactiveDataSourceRepository.getDtosByOddrns(anyList())).thenReturn(dataSourceMock);
        when(reactiveDataSourceRepository.bulkUpdate(anyList())).thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));
        when(reactiveDataSourceRepository.bulkCreate(anyList())).thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));

        dataSourceIngestionService
            .createDataSources(collectorId, dataSourceList)
            .as(StepVerifier::create)
            .expectNextSequence(expected)
            .verifyComplete();
    }

    /**
     * UC-04 — Characterization pin for REFACTOR-423 (collector overwrites operator rename).
     *
     * <p>CURRENT behaviour: on re-ingestion of an already-registered oddrn,
     * {@code DataSourceIngestionServiceImpl.prepareForUpdate} copy-constructs from the EXISTING
     * pojo and then unconditionally overwrites {@code name} (and {@code description}) with the
     * value carried in the ingested payload
     * ({@code new DataSourcePojo(a).setName(i.getName()).setDescription(i.getDescription())},
     * DataSourceIngestionServiceImpl.java:86-88). The collector therefore wins: any name an
     * operator set through the UI is silently lost on the next collector tick.</p>
     *
     * <p>This is the highest-value pin — it documents real data-clobbering behaviour, not a fix.</p>
     *
     * @pins REFACTOR-423
     * Flip protocol: this test goes RED the moment a "preserve operator edits" guard is added
     * (e.g. prepareForUpdate stops overwriting name when the existing name differs from the prior
     * ingested name, or an audit/precedence flag is introduced). When that guard lands, delete this
     * pin and replace it with an assertion that the operator rename survives re-ingestion.
     */
    @Test
    @DisplayName("UC-04 (REFACTOR-423): collector re-ingestion overwrites an operator's UI rename")
    public void collectorIngestionOverwritesOperatorRenameTest() {
        final String oddrn = "//existingoddrn";
        final String operatorRenamedName = "operator-renamed-name";
        final String collectorName = "collector-name";

        final var collectorDto = new CollectorDto(new CollectorPojo().setId(collectorId),
            new NamespacePojo(), new TokenDto(new TokenPojo()));
        when(reactiveCollectorRepository.getDto(eq(collectorId))).thenReturn(Mono.just(collectorDto));

        // The datasource already exists, carrying the name an operator set in the UI.
        when(reactiveDataSourceRepository.getDtosByOddrns(anyList())).thenReturn(
            Flux.just(new DataSourceDto(
                new DataSourcePojo().setOddrn(oddrn).setName(operatorRenamedName),
                new TokenDto(new TokenPojo()))));
        when(reactiveDataSourceRepository.bulkUpdate(anyList()))
            .thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));
        when(reactiveDataSourceRepository.bulkCreate(anyList()))
            .thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));

        // Re-ingest the SAME oddrn, but with the collector-provided name.
        final var ingested = new DataSourceList().addItemsItem(
            new DataSource().oddrn(oddrn).name(collectorName));

        dataSourceIngestionService
            .createDataSources(collectorId, ingested)
            .as(StepVerifier::create)
            .assertNext(ds -> {
                assertThat(ds.getOddrn()).isEqualTo(oddrn);
                // Collector wins — the operator's UI rename is gone.
                assertThat(ds.getName()).isEqualTo(collectorName);
            })
            .verifyComplete();

        @SuppressWarnings("unchecked") final ArgumentCaptor<List<DataSourcePojo>> captor =
            ArgumentCaptor.forClass(List.class);
        verify(reactiveDataSourceRepository).bulkUpdate(captor.capture());
        assertThat(captor.getValue()).singleElement()
            .satisfies(p -> assertThat(p.getName()).isEqualTo(collectorName));
    }

    /**
     * UC-03 — Characterization pin: ingestion cannot mutate a datasource's connection ownership.
     *
     * <p>FINDING vs the task spec: the literal {@code connection_url} column the spec referenced no
     * longer exists on {@code DataSourcePojo}. Migration
     * {@code V0_0_71__datasource_refactor.sql:20} ({@code ALTER TABLE data_source DROP COLUMN IF
     * EXISTS connection_url}) removed it, so there is no {@code getConnectionUrl()} to assert on.
     * The invariant the spec wanted is still pinned here against the connection-ownership column
     * that DOES remain: {@code collector_id}.</p>
     *
     * <p>CURRENT behaviour: the ingestion mapper
     * ({@code DataSourceIngestionMapperImpl.mapIngestionModel}, lines 13-18) sets only
     * oddrn/name/description/namespaceId/collectorId on the ingested pojo, and
     * {@code prepareForUpdate} (DataSourceIngestionServiceImpl.java:86-88) copy-constructs from the
     * EXISTING stored pojo, overwriting only name+description. Consequently every column other than
     * name/description — here {@code collectorId} — retains its previously stored value and is NOT
     * remapped from the ingestion request. Re-homing a datasource under a different collector via
     * ingestion is therefore impossible.</p>
     */
    @Test
    @DisplayName("UC-03: ingestion does not remap connection ownership (collectorId) on update")
    public void ingestionDoesNotRemapConnectionOwnershipOnUpdateTest() {
        final String oddrn = "//existingoddrn";
        final long storedCollectorId = 999L; // the collector that originally registered the datasource

        // Ingestion runs under a DIFFERENT collector than the one that owns the stored datasource.
        final var collectorDto = new CollectorDto(new CollectorPojo().setId(collectorId),
            new NamespacePojo(), new TokenDto(new TokenPojo()));
        when(reactiveCollectorRepository.getDto(eq(collectorId))).thenReturn(Mono.just(collectorDto));

        when(reactiveDataSourceRepository.getDtosByOddrns(anyList())).thenReturn(
            Flux.just(new DataSourceDto(
                new DataSourcePojo().setOddrn(oddrn).setName("existing-name")
                    .setCollectorId(storedCollectorId),
                new TokenDto(new TokenPojo()))));
        when(reactiveDataSourceRepository.bulkUpdate(anyList()))
            .thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));
        when(reactiveDataSourceRepository.bulkCreate(anyList()))
            .thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));

        final var ingested = new DataSourceList().addItemsItem(
            new DataSource().oddrn(oddrn).name("ingested-name"));

        dataSourceIngestionService
            .createDataSources(collectorId, ingested)
            .as(StepVerifier::create)
            .expectNextCount(1)
            .verifyComplete();

        @SuppressWarnings("unchecked") final ArgumentCaptor<List<DataSourcePojo>> captor =
            ArgumentCaptor.forClass(List.class);
        verify(reactiveDataSourceRepository).bulkUpdate(captor.capture());
        assertThat(captor.getValue()).singleElement().satisfies(p -> {
            // name IS taken from the ingestion payload ...
            assertThat(p.getName()).isEqualTo("ingested-name");
            // ... but the connection-ownership column is preserved from the stored pojo,
            // NOT overwritten with the ingesting collector's id (collectorId == 1L).
            assertThat(p.getCollectorId()).isEqualTo(storedCollectorId);
        });
    }

    /**
     * UC-05 — Security-invariant lock-in (NOT a bug): datasource namespace is collector-scoped.
     *
     * <p>CURRENT behaviour: {@code DataSourceIngestionServiceImpl.mapDataSources} (lines 99-111)
     * resolves the namespace id from the authenticated collector
     * ({@code MappingUtils.extractFieldFromNullableObject(c.namespace(), NamespacePojo::getId)})
     * and passes it to {@code mapIngestionModel}. The mapper never reads any namespace from the
     * ingestion payload. This enforces collector-scoped tenancy: a collector cannot register a
     * datasource into another tenant's namespace by crafting the payload.</p>
     *
     * <p>This is a GREEN lock-in. It must stay GREEN; a future change that lets the payload choose
     * the namespace would turn it RED and flag a tenancy-isolation regression for review.</p>
     */
    @Test
    @DisplayName("UC-05 (security): new datasource namespace is resolved from the collector, not the payload")
    public void newDataSourceNamespaceResolvedFromCollectorTest() {
        final long collectorNamespaceId = 42L;

        final var collectorDto = new CollectorDto(new CollectorPojo().setId(collectorId),
            new NamespacePojo().setId(collectorNamespaceId), new TokenDto(new TokenPojo()));
        when(reactiveCollectorRepository.getDto(eq(collectorId))).thenReturn(Mono.just(collectorDto));

        // No existing datasource with this oddrn -> it goes through the create path.
        when(reactiveDataSourceRepository.getDtosByOddrns(anyList())).thenReturn(Flux.empty());
        when(reactiveDataSourceRepository.bulkUpdate(anyList()))
            .thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));
        when(reactiveDataSourceRepository.bulkCreate(anyList()))
            .thenAnswer(i -> Flux.fromIterable(i.getArgument(0)));

        final var ingested = new DataSourceList().addItemsItem(
            new DataSource().oddrn("//newoddrn").name("newdatasource"));

        dataSourceIngestionService
            .createDataSources(collectorId, ingested)
            .as(StepVerifier::create)
            .expectNextCount(1)
            .verifyComplete();

        @SuppressWarnings("unchecked") final ArgumentCaptor<List<DataSourcePojo>> captor =
            ArgumentCaptor.forClass(List.class);
        verify(reactiveDataSourceRepository).bulkCreate(captor.capture());
        assertThat(captor.getValue()).singleElement()
            .satisfies(p -> assertThat(p.getNamespaceId()).isEqualTo(collectorNamespaceId));
    }

    private static Stream<Arguments> dataSourcesProvider() {
        final var newDataSourceOddrn = "//newoddrn";
        final var newDataSourceName = "newdatasource";
        final var existingDataSourceOddrn = "//existingoddrn";
        final var existingDataSourceName = "existingdatasource";
        final var newDataSource = new DataSource()
            .oddrn(newDataSourceOddrn)
            .name(newDataSourceName);
        final var existingDataSource = new DataSource()
            .oddrn(existingDataSourceOddrn)
            .name(existingDataSourceName);
        final var newDataSourceList = new DataSourceList().addItemsItem(newDataSource);
        final var existingDataSourceList = new DataSourceList().addItemsItem(existingDataSource);
        final var combinedDataSourceList = new DataSourceList().items(
            List.of(existingDataSource, newDataSource));
        final var existingDataSourceMock =
            Flux.just(
                new DataSourceDto(new DataSourcePojo()
                    .setOddrn(existingDataSourceOddrn)
                    .setName(existingDataSourceName), new TokenDto(new TokenPojo()))
            );
        return Stream.of(
            Arguments.arguments(newDataSourceList, List.of(newDataSource), existingDataSourceMock),
            Arguments.arguments(newDataSourceList, List.of(newDataSource), Flux.empty()),
            Arguments.arguments(existingDataSourceList, List.of(existingDataSource), existingDataSourceMock),
            Arguments.arguments(combinedDataSourceList, List.of(existingDataSource, newDataSource),
                existingDataSourceMock),
            Arguments.arguments(new DataSourceList(), Collections.emptyList(), Flux.empty()),
            Arguments.arguments(new DataSourceList(), Collections.emptyList(), existingDataSourceMock)
        );
    }
}
