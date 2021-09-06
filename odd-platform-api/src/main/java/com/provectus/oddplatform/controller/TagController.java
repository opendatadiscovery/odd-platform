package com.provectus.oddplatform.controller;

import com.provectus.oddplatform.api.contract.api.TagApi;
import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.api.contract.model.TagFormData;
import com.provectus.oddplatform.api.contract.model.TagsResponse;
import com.provectus.oddplatform.service.TagService;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@RestController
public class TagController
        extends AbstractCRUDController<Tag, TagsResponse, TagFormData, TagFormData, TagService>
        implements TagApi {

    public TagController(final TagService entityService) {
        super(entityService);
    }

    @Override
    public Mono<ResponseEntity<Flux<Tag>>> createTag(
            @Valid final Flux<TagFormData> tagFormData,
            final ServerWebExchange exchange
    ) {
        return tagFormData.collectList()
                .publishOn(Schedulers.boundedElastic())
                .map(entityService::bulkCreate)
                .map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteTag(final Long tagId, final ServerWebExchange exchange) {
        return delete(tagId);
    }

    @Override
    public Mono<ResponseEntity<TagsResponse>> getPopularTagList(
            @NotNull @Valid final Integer page,
            @NotNull @Valid final Integer size,
            @Valid final String query,
            final ServerWebExchange exchange
    ) {
        return list(page, size, query);
    }

    @Override
    public Mono<ResponseEntity<Tag>> updateTag(
            final Long tagId,
            @Valid final Mono<TagFormData> tagFormData,
            final ServerWebExchange exchange
    ) {
        return update(tagId, tagFormData);
    }
}
