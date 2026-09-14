package org.opendatadiscovery.oddplatform.service.search;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntitySearchHighlight;
import reactor.core.publisher.Mono;

public interface DataEntityHighlightService {
    /**
     * The legacy session-keyed path ({@code GET /api/search/{search_id}/data_entities/{id}/highlights}): the query
     * is read from the search session; matches are marked with {@code <b>}/{@code </b>}; a missing data entity
     * completes empty. Its behaviour is frozen by ADR unified-asset-search D9.
     */
    Mono<DataEntitySearchHighlight> highlightDataEntity(final UUID searchId, final long dataEntityId);

    /**
     * The polymorphic path ({@code GET /api/search/assets/DATA_ENTITY/{id}/highlights?query=} — ST-12 / #1846):
     * the query is the caller's; matches are marked with the {@link SearchHighlightDocument} sentinels; every field
     * is bounded to {@link SearchHighlightDocument#POLYMORPHIC_FIELD_CAP}; a data entity that is missing or not
     * visible to the unified search (hollow, DELETED, excluded from search) is a
     * {@link org.opendatadiscovery.oddplatform.exception.NotFoundException}.
     */
    Mono<DataEntitySearchHighlight> highlightDataEntity(final String query, final long dataEntityId);
}
