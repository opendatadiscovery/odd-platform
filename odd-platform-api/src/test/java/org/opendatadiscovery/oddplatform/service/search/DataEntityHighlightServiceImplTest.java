package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructureHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnershipHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityStatusDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchFacetRepository;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_END;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.MARK_START;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.UNBOUNDED;

/**
 * The two contracts of the Data Entity highlight (ST-12 / #1846): the legacy session path stays byte-identical
 * (no field bound, no visibility 404, {@code <b>} marks on every one of the result's 16 string slots), while the
 * polymorphic path bounds fields, 404s on an asset the unified search would not list, and keeps the sentinels.
 *
 * @validates F-017 (F-017-UC-19)
 * @enforces ADR unified-asset-search D9 (the legacy endpoint's output does not change)
 */
@ExtendWith(MockitoExtension.class)
class DataEntityHighlightServiceImplTest {

    @Mock
    private ReactiveSearchFacetRepository searchFacetRepository;
    @Mock
    private ReactiveDataEntityRepository dataEntityRepository;
    @Mock
    private ReactiveDatasetVersionRepository datasetVersionRepository;
    @Mock
    private DataEntityHighlightConverter converter;
    @InjectMocks
    private DataEntityHighlightServiceImpl service;

    private static String mark(final String word) {
        return MARK_START + word + MARK_END;
    }

    private static DataEntityDetailsDto visibleEntity() {
        return DataEntityDetailsDto.detailsBuilder()
            .dataEntity(new DataEntityPojo().setId(7L).setExternalName("orders").setHollow(false)
                .setStatus(DataEntityStatusDto.STABLE.getId()).setExcludeFromSearch(false))
            .build();
    }

    /** Every one of the result's 16 string slots comes back with the legacy dialect and no sentinel anywhere. */
    @Test
    void withHtmlMarks_mapsEveryStringSlot() {
        final DataEntitySearchHighlight parsed = new DataEntitySearchHighlight()
            .dataEntity(new DataEntityHighlight().externalName(mark("a")).internalName(mark("b"))
                .externalDescription(mark("c")).internalDescription(mark("d")))
            .dataSource(new DataSourceHighlight().name(mark("e")).oddrn(mark("f")))
            .namespace(new NamespaceHighlight().name(mark("g")))
            .tags(List.of(new Tag().name(mark("h"))))
            .owners(List.of(new OwnershipHighlight().owner(mark("i")).title(mark("j"))))
            .metadata(List.of(new MetadataFieldValue().field(new MetadataField().name(mark("k"))).value(mark("l"))))
            .datasetStructure(List.of(new DataSetStructureHighlight().name(mark("m"))
                .internalDescription(mark("n")).externalDescription(mark("o"))
                .tags(List.of(new Tag().name(mark("p"))))));

        final DataEntitySearchHighlight html = DataEntityHighlightServiceImpl.withHtmlMarks(parsed);

        assertThat(html.getDataEntity().getExternalName()).isEqualTo("<b>a</b>");
        assertThat(html.getDataEntity().getInternalName()).isEqualTo("<b>b</b>");
        assertThat(html.getDataEntity().getExternalDescription()).isEqualTo("<b>c</b>");
        assertThat(html.getDataEntity().getInternalDescription()).isEqualTo("<b>d</b>");
        assertThat(html.getDataSource().getName()).isEqualTo("<b>e</b>");
        assertThat(html.getDataSource().getOddrn()).isEqualTo("<b>f</b>");
        assertThat(html.getNamespace().getName()).isEqualTo("<b>g</b>");
        assertThat(html.getTags().get(0).getName()).isEqualTo("<b>h</b>");
        assertThat(html.getOwners().get(0).getOwner()).isEqualTo("<b>i</b>");
        assertThat(html.getOwners().get(0).getTitle()).isEqualTo("<b>j</b>");
        assertThat(html.getMetadata().get(0).getField().getName()).isEqualTo("<b>k</b>");
        assertThat(html.getMetadata().get(0).getValue()).isEqualTo("<b>l</b>");
        assertThat(html.getDatasetStructure().get(0).getName()).isEqualTo("<b>m</b>");
        assertThat(html.getDatasetStructure().get(0).getInternalDescription()).isEqualTo("<b>n</b>");
        assertThat(html.getDatasetStructure().get(0).getExternalDescription()).isEqualTo("<b>o</b>");
        assertThat(html.getDatasetStructure().get(0).getTags().get(0).getName()).isEqualTo("<b>p</b>");
        assertThat(html.toString()).doesNotContain(MARK_START).doesNotContain(MARK_END);
    }

    @Test
    void withHtmlMarks_toleratesEveryAbsentSection() {
        final DataEntitySearchHighlight empty = new DataEntitySearchHighlight();
        assertThat(DataEntityHighlightServiceImpl.withHtmlMarks(empty)).isSameAs(empty);
    }

    /** The legacy session path: the session's query, no field bound, the marks mapped to {@code <b>}. */
    @Test
    void legacyPath_usesTheSessionQuery_unboundedDocument_andHtmlMarks() {
        final UUID searchId = UUID.randomUUID();
        final DataEntityDetailsDto details = visibleEntity();
        when(searchFacetRepository.get(searchId))
            .thenReturn(Mono.just(new SearchFacetsPojo().setQueryString("orders")));
        when(dataEntityRepository.getDataEntitySearchFields(7L)).thenReturn(Mono.just(details));
        when(datasetVersionRepository.getLatestDatasetVersion(7L)).thenReturn(Mono.empty());
        when(converter.convert(eq(details), any(DatasetStructureDto.class), eq(UNBOUNDED))).thenReturn("doc");
        when(dataEntityRepository.getHighlightedResult("doc", "orders")).thenReturn(Mono.just("marked"));
        when(converter.parseHighlightedString(eq("marked"), eq(details), any(DatasetStructureDto.class)))
            .thenReturn(new DataEntitySearchHighlight()
                .dataEntity(new DataEntityHighlight().externalName(mark("orders"))));

        StepVerifier.create(service.highlightDataEntity(searchId, 7L))
            .assertNext(h -> assertThat(h.getDataEntity().getExternalName()).isEqualTo("<b>orders</b>"))
            .verifyComplete();
        verify(converter, never()).convert(any(), any(), eq(POLYMORPHIC_FIELD_CAP));
    }

    /** The legacy contract's quirk is deliberately kept (ADR D9): a missing data entity completes empty. */
    @Test
    void legacyPath_missingDataEntity_completesEmpty() {
        final UUID searchId = UUID.randomUUID();
        when(searchFacetRepository.get(searchId))
            .thenReturn(Mono.just(new SearchFacetsPojo().setQueryString("orders")));
        when(dataEntityRepository.getDataEntitySearchFields(404L)).thenReturn(Mono.empty());
        when(datasetVersionRepository.getLatestDatasetVersion(404L)).thenReturn(Mono.empty());

        StepVerifier.create(service.highlightDataEntity(searchId, 404L)).verifyComplete();
    }

    /** The polymorphic path: the caller's query, the 16 384-char bound, the sentinels left as they are. */
    @Test
    void polymorphicPath_usesTheCallersQuery_boundedDocument_andKeepsTheSentinels() {
        final DataEntityDetailsDto details = visibleEntity();
        when(dataEntityRepository.getDataEntitySearchFields(7L)).thenReturn(Mono.just(details));
        when(datasetVersionRepository.getLatestDatasetVersion(7L)).thenReturn(Mono.empty());
        when(converter.convert(eq(details), any(DatasetStructureDto.class), eq(POLYMORPHIC_FIELD_CAP)))
            .thenReturn("doc");
        final ArgumentCaptor<String> query = ArgumentCaptor.forClass(String.class);
        when(dataEntityRepository.getHighlightedResult(eq("doc"), query.capture())).thenReturn(Mono.just("marked"));
        when(converter.parseHighlightedString(eq("marked"), eq(details), any(DatasetStructureDto.class)))
            .thenReturn(new DataEntitySearchHighlight()
                .dataEntity(new DataEntityHighlight().externalName(mark("orders"))));

        StepVerifier.create(service.highlightDataEntity("ord -test", 7L))
            .assertNext(h -> assertThat(h.getDataEntity().getExternalName()).isEqualTo(mark("orders")))
            .verifyComplete();
        assertThat(query.getValue()).as("the raw query reaches the shared sink untouched").isEqualTo("ord -test");
        verify(searchFacetRepository, never()).get(any());
    }

    @Test
    void polymorphicPath_missingDataEntity_isNotFound() {
        when(dataEntityRepository.getDataEntitySearchFields(404L)).thenReturn(Mono.empty());
        when(datasetVersionRepository.getLatestDatasetVersion(404L)).thenReturn(Mono.empty());

        StepVerifier.create(service.highlightDataEntity("q", 404L))
            .expectError(NotFoundException.class)
            .verify();
        verify(dataEntityRepository, never()).getHighlightedResult(anyString(), anyString());
    }

    /** The unified search's own visibility predicate: DELETED / hollow / excluded → not found, never explained. */
    @Test
    void polymorphicPath_deletedHollowOrExcludedDataEntity_isNotFound() {
        final DataEntityPojo deleted = new DataEntityPojo().setId(1L).setHollow(false)
            .setStatus(DataEntityStatusDto.DELETED.getId()).setExcludeFromSearch(false);
        final DataEntityPojo hollow = new DataEntityPojo().setId(2L).setHollow(true)
            .setStatus(DataEntityStatusDto.STABLE.getId()).setExcludeFromSearch(false);
        final DataEntityPojo excluded = new DataEntityPojo().setId(3L).setHollow(false)
            .setStatus(DataEntityStatusDto.STABLE.getId()).setExcludeFromSearch(true);
        for (final DataEntityPojo pojo : List.of(deleted, hollow, excluded)) {
            when(dataEntityRepository.getDataEntitySearchFields(pojo.getId()))
                .thenReturn(Mono.just(DataEntityDetailsDto.detailsBuilder().dataEntity(pojo).build()));
            when(datasetVersionRepository.getLatestDatasetVersion(pojo.getId())).thenReturn(Mono.empty());

            StepVerifier.create(service.highlightDataEntity("q", pojo.getId()))
                .expectError(NotFoundException.class)
                .verify();
        }
        verify(dataEntityRepository, never()).getHighlightedResult(anyString(), anyString());
        verify(converter, never()).convert(any(), any(), eq(POLYMORPHIC_FIELD_CAP));
    }

    @Test
    void withHtmlMarks_toleratesAMetadataValueWithoutAFieldAndAColumnWithoutTags() {
        final DataEntitySearchHighlight parsed = new DataEntitySearchHighlight()
            .metadata(List.of(new MetadataFieldValue().value(mark("l"))))
            .datasetStructure(List.of(new DataSetStructureHighlight().name(mark("m"))));

        final DataEntitySearchHighlight html = DataEntityHighlightServiceImpl.withHtmlMarks(parsed);

        assertThat(html.getMetadata().get(0).getField()).isNull();
        assertThat(html.getMetadata().get(0).getValue()).isEqualTo("<b>l</b>");
        assertThat(html.getDatasetStructure().get(0).getName()).isEqualTo("<b>m</b>");
        assertThat(html.getDatasetStructure().get(0).getTags()).isNull();
    }
}
