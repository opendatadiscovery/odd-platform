package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToTermPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveTagRepository extends ReactiveCRUDRepository<TagPojo> {
    Mono<TagDto> getDto(final long id);

    Mono<List<TagDto>> listDataEntityDtos(final Long dataEntityId);

    Flux<TagPojo> listByNames(final Collection<String> names);

    Flux<TagPojo> listByTerm(final long termId);

    Mono<Page<TagDto>> listMostPopular(final String query, final List<Long> ids, final int page, final int size);

    Flux<TagToDataEntityPojo> listTagRelations(final Collection<Long> dataEntityIds);

    Flux<TagPojo> ingestData(final List<TagPojo> tags);

    Flux<TagToDataEntityPojo> createDataEntityRelations(final Collection<TagToDataEntityPojo> relations);

    Flux<TagToDataEntityPojo> deleteDataEntityRelations(final Collection<TagToDataEntityPojo> relations);

    Flux<TagToDataEntityPojo> deleteDataEntityRelations(final long tagId);

    Flux<TagToDataEntityPojo> deleteRelationsForDataEntity(final long dataEntityId);

    Flux<TagToTermPojo> createTermRelations(final long termId, final Collection<Long> tagIds);

    Flux<TagToTermPojo> deleteTermRelations(final long termId, final Collection<Long> tagIds);

    Flux<TagToTermPojo> deleteTermRelations(final long tagId);
}
