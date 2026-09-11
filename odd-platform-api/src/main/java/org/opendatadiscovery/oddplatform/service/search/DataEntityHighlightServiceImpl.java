package org.opendatadiscovery.oddplatform.service.search;

import java.util.List;
import java.util.UUID;
import java.util.function.UnaryOperator;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSetStructureHighlight;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceHighlight;
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
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.POLYMORPHIC_FIELD_CAP;
import static org.opendatadiscovery.oddplatform.service.search.SearchHighlightDocument.toHtmlMarks;
import static reactor.function.TupleUtils.function;

@Service
@RequiredArgsConstructor
public class DataEntityHighlightServiceImpl implements DataEntityHighlightService {
    private final ReactiveSearchFacetRepository searchFacetRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final ReactiveDatasetVersionRepository datasetVersionRepository;
    private final DataEntityHighlightConverter converter;

    @Override
    public Mono<DataEntitySearchHighlight> highlightDataEntity(final UUID searchId, final long dataEntityId) {
        final Mono<String> queryStringMono = searchFacetRepository.get(searchId)
            .map(SearchFacetsPojo::getQueryString)
            .switchIfEmpty(Mono.error(new NotFoundException("Search", searchId)));
        final Mono<DataEntityDetailsDto> detailsMono =
            dataEntityRepository.getDataEntitySearchFields(dataEntityId);
        final Mono<DatasetStructureDto> latestDatasetVersion = datasetVersionRepository
            .getLatestDatasetVersion(dataEntityId)
            .switchIfEmpty(Mono.just(new DatasetStructureDto()));
        // The legacy contract, frozen by ADR unified-asset-search D9: no field bound, a missing data entity
        // completes empty, and the marks on the wire are <b>/</b> - the sink now emits the SearchHighlightDocument
        // sentinels, so they are mapped back here, after parsing, over every string of the result.
        return Mono.zip(queryStringMono, detailsMono, latestDatasetVersion)
            .flatMap(function((query, details, structure) ->
                highlight(query, details, structure, SearchHighlightDocument.UNBOUNDED)))
            .map(DataEntityHighlightServiceImpl::withHtmlMarks);
    }

    @Override
    public Mono<DataEntitySearchHighlight> highlightDataEntity(final String query, final long dataEntityId) {
        // ST-12 / #1846 - the polymorphic path. A data entity the unified search would not list is not explained:
        // the same visibility predicate as ReactiveAssetSearchRepositoryImpl's ranked query (not hollow, not
        // DELETED, not excluded from search), answered as not-found so a guessable id never reads a hidden asset.
        final Mono<DataEntityDetailsDto> detailsMono = dataEntityRepository.getDataEntitySearchFields(dataEntityId)
            .filter(details -> isVisibleToSearch(details.getDataEntity()))
            .switchIfEmpty(Mono.error(() -> new NotFoundException("DataEntity", dataEntityId)));
        final Mono<DatasetStructureDto> latestDatasetVersion = datasetVersionRepository
            .getLatestDatasetVersion(dataEntityId)
            .switchIfEmpty(Mono.just(new DatasetStructureDto()));
        return Mono.zip(detailsMono, latestDatasetVersion)
            .flatMap(function((details, structure) -> highlight(query, details, structure, POLYMORPHIC_FIELD_CAP)));
    }

    private Mono<DataEntitySearchHighlight> highlight(final String query,
                                                      final DataEntityDetailsDto detailsDto,
                                                      final DatasetStructureDto structureDto,
                                                      final int fieldCap) {
        final String document = converter.convert(detailsDto, structureDto, fieldCap);
        return dataEntityRepository.getHighlightedResult(document, query)
            .map(highlighted -> converter.parseHighlightedString(highlighted, detailsDto, structureDto));
    }

    private static boolean isVisibleToSearch(final DataEntityPojo pojo) {
        return pojo != null
            && !Boolean.TRUE.equals(pojo.getHollow())
            && (pojo.getStatus() == null || pojo.getStatus() != DataEntityStatusDto.DELETED.getId())
            && !Boolean.TRUE.equals(pojo.getExcludeFromSearch());
    }

    /**
     * The legacy dialect over the whole result: every one of the 16 string slots of a DataEntitySearchHighlight
     * (the entity's 4, the data source's 2, the namespace, each tag's name, each owner's 2, each metadata field's
     * name and value, each dataset column's name, 2 descriptions and its tags' names). Mutates in place - the
     * result is freshly parsed and owned by this call.
     */
    static DataEntitySearchHighlight withHtmlMarks(final DataEntitySearchHighlight highlight) {
        final UnaryOperator<String> html = SearchHighlightDocument::toHtmlMarks;
        final DataEntityHighlight entity = highlight.getDataEntity();
        if (entity != null) {
            entity.setExternalName(html.apply(entity.getExternalName()));
            entity.setInternalName(html.apply(entity.getInternalName()));
            entity.setExternalDescription(html.apply(entity.getExternalDescription()));
            entity.setInternalDescription(html.apply(entity.getInternalDescription()));
        }
        final DataSourceHighlight dataSource = highlight.getDataSource();
        if (dataSource != null) {
            dataSource.setName(html.apply(dataSource.getName()));
            dataSource.setOddrn(html.apply(dataSource.getOddrn()));
        }
        final NamespaceHighlight namespace = highlight.getNamespace();
        if (namespace != null) {
            namespace.setName(html.apply(namespace.getName()));
        }
        tagsWithHtmlMarks(highlight.getTags());
        final List<OwnershipHighlight> owners = highlight.getOwners();
        if (owners != null) {
            for (final OwnershipHighlight owner : owners) {
                owner.setOwner(html.apply(owner.getOwner()));
                owner.setTitle(html.apply(owner.getTitle()));
            }
        }
        final List<MetadataFieldValue> metadata = highlight.getMetadata();
        if (metadata != null) {
            for (final MetadataFieldValue value : metadata) {
                if (value.getField() != null) {
                    value.getField().setName(html.apply(value.getField().getName()));
                }
                value.setValue(html.apply(value.getValue()));
            }
        }
        final List<DataSetStructureHighlight> structure = highlight.getDatasetStructure();
        if (structure != null) {
            for (final DataSetStructureHighlight column : structure) {
                column.setName(html.apply(column.getName()));
                column.setInternalDescription(html.apply(column.getInternalDescription()));
                column.setExternalDescription(html.apply(column.getExternalDescription()));
                tagsWithHtmlMarks(column.getTags());
            }
        }
        return highlight;
    }

    private static void tagsWithHtmlMarks(final List<Tag> tags) {
        if (tags != null) {
            for (final Tag tag : tags) {
                tag.setName(toHtmlMarks(tag.getName()));
            }
        }
    }
}
