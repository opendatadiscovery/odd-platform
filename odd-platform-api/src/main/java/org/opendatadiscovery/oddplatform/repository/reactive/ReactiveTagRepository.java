package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.dto.TagOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDatasetFieldPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToTermPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveTagRepository extends ReactiveCRUDRepository<TagPojo> {
    Mono<TagDto> getDto(final long id);

    Mono<List<TagDto>> listDataEntityDtos(final Long dataEntityId);

    Mono<List<TagDto>> listDatasetFieldDtos(long datasetFieldId);

    Flux<TagToDatasetFieldPojo> listTagsRelations(Collection<Long> datasetFieldIds, TagOrigin origin);

    Flux<TagPojo> listByNames(final Collection<String> names);

    Flux<TagPojo> listByTerm(final long termId);

    Mono<Page<TagDto>> listMostPopular(final String query, final List<Long> ids, final int page, final int size);

    Flux<TagToDataEntityPojo> listTagRelations(final Collection<Long> dataEntityIds);

    /**
     * The live tags of every data entity in {@code dataEntityIds}, keyed by data entity id — ONE tag-joined
     * query for a whole result page (CTRIB-073 / #1847 ST-13a); entities without tags are absent from the map.
     */
    Mono<Map<Long, List<TagPojo>>> listTagsByDataEntityIds(final Collection<Long> dataEntityIds);

    /** The term-side twin of {@link #listTagsByDataEntityIds}: the live tags of every term, keyed by term id. */
    Mono<Map<Long, List<TagPojo>>> listTagsByTermIds(final Collection<Long> termIds);

    Flux<TagPojo> ingestData(final List<TagPojo> tags);

    Flux<TagToDataEntityPojo> createDataEntityRelations(final Collection<TagToDataEntityPojo> relations);

    Flux<TagToDataEntityPojo> deleteDataEntityRelations(final Collection<TagToDataEntityPojo> relations);

    Flux<TagToDataEntityPojo> deleteDataEntityRelations(final long tagId);

    Flux<TagToDatasetFieldPojo> deleteDatasetFieldRelations(final long tagId);

    Flux<TagToDatasetFieldPojo> deleteDatasetFieldRelations(List<TagToDatasetFieldPojo> pojos);

    Flux<TagToTermPojo> createTermRelations(final long termId, final Collection<Long> tagIds);

    Flux<TagToDatasetFieldPojo> createDatasetFieldRelations(Collection<TagToDatasetFieldPojo> pojos);

    Flux<TagToTermPojo> deleteTermRelations(final long termId, final Collection<Long> tagIds);

    Flux<TagToTermPojo> deleteTermRelations(final long tagId);

    Flux<TagToDatasetFieldPojo> deleteDatasetFieldInternalRelations(long datasetFieldId);
}
