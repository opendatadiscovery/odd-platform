package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToDataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagToTermPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCRUDRepository;
import org.opendatadiscovery.oddplatform.utils.Page;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveTagRepository extends ReactiveCRUDRepository<TagPojo> {

    Flux<TagPojo> listByNames(final Collection<String> names);

    Flux<TagPojo> listByDataEntityId(final long dataEntityId);

    Flux<TagPojo> listByTerm(final long termId);

    Mono<Page<TagDto>> listMostPopular(final String query, final int page, final int size);

    Flux<TagToDataEntityPojo> createDataEntityRelations(final long dataEntityId, final Collection<Long> tagIds);

    Flux<TagToDataEntityPojo> deleteDataEntityRelations(final long dataEntityId, final Collection<Long> tagIds);

    Flux<TagToDataEntityPojo> deleteDataEntityRelations(final long tagId);

    Flux<TagToDataEntityPojo> deleteRelationsForDataEntity(final long dataEntityId);

    Flux<TagToTermPojo> createTermRelations(final long termId, final Collection<Long> tagIds);

    Flux<TagToTermPojo> deleteTermRelations(final long termId, final Collection<Long> tagIds);

    Flux<TagToTermPojo> deleteTermRelations(final long tagId);
}
