package org.opendatadiscovery.oddplatform.auth.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.nio.channels.Channels;
import java.nio.channels.WritableByteChannel;
import java.nio.charset.StandardCharsets;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Slf4j
public abstract class AbstractIngestionFilter implements WebFilter {

    private static final String BEARER = "bearer ";
    private final ServerWebExchangeMatcher matcher;
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Mono<Void> filter(final ServerWebExchange exchange, final WebFilterChain chain) {
        return matcher.matches(exchange)
            .filter(ServerWebExchangeMatcher.MatchResult::isMatch)
            .switchIfEmpty(Mono.defer(() -> chain.filter(exchange).then(Mono.empty())))
            .flatMap(ignored -> chain.filter(exchange.mutate().request(getRequestDecorator(exchange)).build()))
            .onErrorResume(AccessDeniedException.class, e -> writeResponse(exchange, e.getMessage()));
    }

    protected abstract ServerHttpRequestDecorator getRequestDecorator(final ServerWebExchange exchange);

    protected String resolveToken(final ServerHttpRequest request) {
        final String bearerToken = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(bearerToken) || !bearerToken.toLowerCase().startsWith(BEARER)) {
            throw new AccessDeniedException("Token is missed");
        }
        return bearerToken.substring(BEARER.length());
    }

    protected <T> T readBody(final List<DataBuffer> dataBuffer, final Class<T> clazz) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            final WritableByteChannel channel = Channels.newChannel(baos);
            for (final DataBuffer buffer : dataBuffer) {
                channel.write(buffer.asByteBuffer().asReadOnlyBuffer());
            }
            return mapper.readValue(baos.toByteArray(), clazz);
        } catch (Exception e) {
            log.error("Exception while parsing request body");
            throw new RuntimeException(e);
        }
    }

    private Mono<Void> writeResponse(final ServerWebExchange exchange, final String message) {
        final ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        return response.writeWith(Mono.fromCallable(
            () -> response.bufferFactory().wrap(message.getBytes(StandardCharsets.UTF_8))));
    }
}
