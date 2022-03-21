package org.opendatadiscovery.oddplatform.auth.filter;

import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.repository.CollectorRepository;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

@Component
@Slf4j
public class IngestionDataSourceFilter extends AbstractIngestionFilter {

    private final CollectorRepository collectorRepository;

    public IngestionDataSourceFilter(final CollectorRepository collectorRepository) {
        super(new PathPatternParserServerWebExchangeMatcher("/ingestion/datasources", HttpMethod.POST));
        this.collectorRepository = collectorRepository;
    }

    @Override
    protected ServerHttpRequestDecorator getRequestDecorator(final ServerWebExchange exchange) {
        return new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public Flux<DataBuffer> getBody() {
                return super.getBody().collectList()
                    .publishOn(Schedulers.boundedElastic())
                    .doOnNext(dataBuffer -> {
                        final DataSourceList body = readBody(dataBuffer, DataSourceList.class);
                        final String token = resolveToken(exchange.getRequest());
                        final CollectorDto collectorDto = collectorRepository.getByOddrn(body.getProviderOddrn())
                            .orElseThrow(() -> new NotFoundException(
                                String.format("Collector with oddrn %s doesn't exist", body.getProviderOddrn())
                            ));
                        if (!collectorDto.tokenDto().tokenPojo().getValue().equals(token)) {
                            throw new AccessDeniedException("Token is not correct");
                        }
                    }).flatMapIterable(list -> list);
            }
        };
    }
}
