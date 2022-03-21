package org.opendatadiscovery.oddplatform.auth.filter;

import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
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
public class IngestionDataEntitiesFilter extends AbstractIngestionFilter {

    private final DataSourceRepository dataSourceRepository;

    public IngestionDataEntitiesFilter(final DataSourceRepository dataSourceRepository) {
        super(new PathPatternParserServerWebExchangeMatcher("/ingestion/entities", HttpMethod.POST));
        this.dataSourceRepository = dataSourceRepository;
    }

    @Override
    protected ServerHttpRequestDecorator getRequestDecorator(final ServerWebExchange exchange) {
        return new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public Flux<DataBuffer> getBody() {
                return super.getBody().collectList()
                    .publishOn(Schedulers.boundedElastic())
                    .doOnNext(dataBuffer -> {
                        final DataEntityList body = readBody(dataBuffer, DataEntityList.class);
                        final String token = resolveToken(exchange.getRequest());
                        final DataSourceDto dataSourceDto = dataSourceRepository.getByOddrn(body.getDataSourceOddrn())
                            .orElseThrow(() -> new NotFoundException(
                                String.format("DataSource with oddrn %s doesn't exist", body.getDataSourceOddrn())
                            ));
                        if (!dataSourceDto.token().tokenPojo().getValue().equals(token)) {
                            throw new AccessDeniedException("Token is not correct");
                        }
                    }).flatMapIterable(list -> list);
            }
        };
    }
}
