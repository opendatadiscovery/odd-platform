package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.TagApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsResponse;
import org.opendatadiscovery.oddplatform.service.TagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class TagController implements TagApi {

    private final TagService tagService;

    @Override
    public Mono<ResponseEntity<Flux<Tag>>> createTag(final Flux<TagFormData> tagFormData,
                                                     final ServerWebExchange exchange) {
        return tagFormData.collectList()
            .map(tagService::bulkCreate)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteTag(final Long tagId, final ServerWebExchange exchange) {
        return tagService.delete(tagId)
            .then(Mono.just(ResponseEntity.noContent().build()));
    }

    @Override
    public Mono<ResponseEntity<TagsResponse>> getPopularTagList(final Integer page,
                                                                final Integer size,
                                                                final String query,
                                                                final ServerWebExchange exchange) {
        return tagService.listMostPopular(query, page, size)
            .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Tag>> updateTag(final Long tagId,
                                               final Mono<TagFormData> tagFormData,
                                               final ServerWebExchange exchange) {
        return tagFormData.flatMap(fd -> tagService.update(tagId, fd))
            .map(ResponseEntity::ok);
    }
}
