package org.opendatadiscovery.oddplatform.controller;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.TitleApi;
import org.opendatadiscovery.oddplatform.api.contract.model.TitleList;
import org.opendatadiscovery.oddplatform.service.TitleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class TitleController implements TitleApi {
    private final TitleService titleService;

    @Override
    public Mono<ResponseEntity<TitleList>> getTitleList(final Integer page,
                                                        final Integer size,
                                                        final String query,
                                                        final ServerWebExchange exchange) {
        return titleService.list(page, size, query).map(ResponseEntity::ok);
    }
}
