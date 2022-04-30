package org.opendatadiscovery.oddplatform.auth.filter;

import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
@ConditionalOnProperty(value = "auth.ingestion.filter.enabled", havingValue = "true")
public class IngestionDataEntitiesFilter extends AbstractIngestionFilter {

    private final ReactiveDataSourceRepository dataSourceRepository;
    private final ReactiveCollectorRepository collectorRepository;

    public IngestionDataEntitiesFilter(final ReactiveDataSourceRepository dataSourceRepository,
                                       final ReactiveCollectorRepository collectorRepository) {
        super(new PathPatternParserServerWebExchangeMatcher("/ingestion/entities", HttpMethod.POST));
        this.dataSourceRepository = dataSourceRepository;
        this.collectorRepository = collectorRepository;
    }

    @Override
    protected ServerHttpRequestDecorator getRequestDecorator(final ServerWebExchange exchange) {
        return new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public Flux<DataBuffer> getBody() {
                return super.getBody().collectList()
                    .flatMapMany(dataBuffer -> {
                        final DataEntityList body = readBody(dataBuffer, DataEntityList.class);
                        final String token = resolveToken(exchange.getRequest());

                        return dataSourceRepository.getDtoByOddrn(body.getDataSourceOddrn())
                            .switchIfEmpty(Mono.error(new NotFoundException(
                                "DataSource with oddrn %s doesn't exist".formatted(body.getDataSourceOddrn()))))
                            .flatMap(dto -> {
                                if (dto.token() != null) {
                                    return Mono.just(dto.token());
                                } else {
                                    return collectorRepository.getDto(dto.dataSource().getCollectorId())
                                        .switchIfEmpty(Mono.error(new NotFoundException(
                                            "Collector with id %s doesn't exist".formatted(dto.dataSource()
                                                .getCollectorId()))))
                                        .map(CollectorDto::tokenDto);
                                }
                            })
                            .doOnNext(dto -> {
                                if (!dto.tokenPojo().getValue().equals(token)) {
                                    throw new AccessDeniedException("Token is not correct");
                                }
                            })
                            .flatMapIterable(ignored -> dataBuffer);
                    });
            }
        };
    }
}
