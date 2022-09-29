package org.opendatadiscovery.oddplatform.controller;

import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.api.NamespaceApi;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.service.NamespaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
public class NamespaceController implements NamespaceApi {
    private final NamespaceService namespaceService;

    @Override
    public Mono<ResponseEntity<Namespace>> createNamespace(
        @Valid final Mono<NamespaceFormData> namespaceFormData,
        final ServerWebExchange exchange
    ) {
        return namespaceFormData.flatMap(namespaceService::create).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Namespace>> getNamespaceDetails(
        final Long namespaceId,
        final ServerWebExchange exchange
    ) {
        return namespaceService.get(namespaceId).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Void>> deleteNamespace(final Long namespaceId,
                                                      final ServerWebExchange exchange) {
        return namespaceService.delete(namespaceId)
            .thenReturn(ResponseEntity.noContent().build());
    }

    @Override
    public Mono<ResponseEntity<NamespaceList>> getNamespaceList(final Integer page,
                                                                final Integer size,
                                                                final String query,
                                                                final ServerWebExchange exchange) {
        return namespaceService.list(page, size, query).map(ResponseEntity::ok);
    }

    @Override
    public Mono<ResponseEntity<Namespace>> updateNamespace(
        final Long namespaceId,
        @Valid final Mono<NamespaceUpdateFormData> namespaceUpdateFormData,
        final ServerWebExchange exchange
    ) {
        return namespaceUpdateFormData
            .flatMap(form -> namespaceService.update(namespaceId, form))
            .map(ResponseEntity::ok);
    }
}
