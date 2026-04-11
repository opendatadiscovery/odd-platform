package org.opendatadiscovery.oddplatform.controller;

import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.opendatadiscovery.oddplatform.api.contract.api.LinksApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Link;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkList;
import org.opendatadiscovery.oddplatform.config.properties.AdditionalLinkProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import static java.util.Collections.emptyList;

@RestController
@RequiredArgsConstructor
@Slf4j
public class LinksController implements LinksApi {
    private final AdditionalLinkProperties linkProperties;

    @Override
    public Mono<ResponseEntity<LinkList>> getLinks(final ServerWebExchange exchange) {
        if (CollectionUtils.isEmpty(linkProperties.links())) {
            return Mono.just(ResponseEntity.ok(new LinkList().items(emptyList())));
        }

        final List<Link> links = linkProperties.links().stream()
            .map(link -> new Link().title(link.title()).url(link.url()))
            .toList();

        return Mono.just(ResponseEntity.ok(new LinkList().items(links)));
    }
}
