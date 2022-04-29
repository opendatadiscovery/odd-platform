package org.opendatadiscovery.oddplatform.auth.filter;

import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class IngestionDataSourceFilter extends AbstractIngestionFilter {
    private final ReactiveCollectorRepository collectorRepository;

    public IngestionDataSourceFilter(final ReactiveCollectorRepository collectorRepository) {
        super(new PathPatternParserServerWebExchangeMatcher("/ingestion/datasources", HttpMethod.POST));
        this.collectorRepository = collectorRepository;
    }

    @Override
    protected ServerHttpRequestDecorator getRequestDecorator(final ServerWebExchange exchange) {
        return new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public Flux<DataBuffer> getBody() {
                return super.getBody().collectList()
                    .flatMapMany(dataBuffer -> {
                        final DataSourceList body = readBody(dataBuffer, DataSourceList.class);
                        final String token = resolveToken(exchange.getRequest());

                        return collectorRepository.getByToken(token)
                            .switchIfEmpty(Mono.error(new NotFoundException("Collector with such token doesn't exist")))
                            .zipWith(exchange.getSession())
                            .doOnNext(t -> t.getT2().getAttributes()
                                .put(SessionConstants.COLLECTOR_ID_SESSION_KEY, t.getT1().getId()))
                            .flatMapIterable(i -> dataBuffer);
                    });
            }
        };
    }
}
