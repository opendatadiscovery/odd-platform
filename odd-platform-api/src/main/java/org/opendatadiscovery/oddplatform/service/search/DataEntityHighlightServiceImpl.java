package org.opendatadiscovery.oddplatform.service.search;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import org.opendatadiscovery.oddplatform.dto.DataEntityDetailsDto;
import org.opendatadiscovery.oddplatform.dto.DatasetStructureDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDatasetVersionRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchFacetRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

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
        return Mono.zip(queryStringMono, detailsMono, latestDatasetVersion)
            .flatMap(function(this::getHighlightedResult));
    }

    private Mono<DataEntitySearchHighlight> getHighlightedResult(final String queryString,
                                                                 final DataEntityDetailsDto detailsDto,
                                                                 final DatasetStructureDto structureDto) {
        final String searchableString = converter.convert(detailsDto, structureDto);
        return dataEntityRepository.getHighlightedResult(searchableString, queryString)
            .map(highlightedString -> converter.parseHighlightedString(highlightedString, detailsDto, structureDto));
    }
}
