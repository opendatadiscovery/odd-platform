package org.opendatadiscovery.oddplatform.service.attachment;

import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkListFormData;
import org.opendatadiscovery.oddplatform.exception.BadUserRequestException;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.LinkMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LinkPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.LinkRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class LinkServiceImpl implements LinkService {
    // Stored-XSS defense: a saved link URL is later rendered as a clickable <a href>, so only web schemes are
    // allowed. Positive allow-list (never a deny-list) per the OWASP XSS Prevention Cheat Sheet. This blocks
    // javascript:/data:/file:/vbscript: at persistence (the authoritative half; the UI also sanitizes on render).
    private static final Set<String> ALLOWED_LINK_SCHEMES = Set.of("http", "https");

    private final LinkRepository linkRepository;
    private final LinkMapper linkMapper;

    @Override
    public Mono<List<DataEntityLink>> getDataEntityLinks(final long dataEntityId) {
        return linkRepository.getDataEntityLinks(dataEntityId)
            .map(linkMapper::mapToDto)
            .collectList();
    }

    @Override
    public Flux<DataEntityLink> save(final DataEntityLinkListFormData formData, final long dataEntityId) {
        final List<DataEntityLinkFormData> items =
            ObjectUtils.defaultIfNull(formData.getItems(), List.<DataEntityLinkFormData>of());
        return Flux.fromIterable(items)
            .doOnNext(link -> validateLinkScheme(link.getUrl()))
            .map(link -> linkMapper.mapToPojo(link, dataEntityId))
            .collectList()
            .flatMapMany(linkRepository::bulkCreate)
            .map(linkMapper::mapToDto);
    }

    @Override
    public Mono<DataEntityLink> update(final long linkId, final DataEntityLinkFormData formData) {
        return Mono.fromRunnable(() -> validateLinkScheme(formData.getUrl()))
            .then(Mono.defer(() -> linkRepository.get(linkId)))
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Link", linkId)))
            .map(pojo -> linkMapper.applyToPojo(formData, pojo))
            .flatMap(linkRepository::update)
            .map(linkMapper::mapToDto);
    }

    // Reject any link URL whose scheme is not allow-listed, before it is persisted (and later rendered as an
    // <a href>). Parsing via java.net.URI also rejects a malformed URL or one with an embedded control char
    // (e.g. a newline-obfuscated scheme); the scheme comparison is case-insensitive.
    private void validateLinkScheme(final String url) {
        final String scheme;
        try {
            scheme = url == null ? null : URI.create(url.trim()).getScheme();
        } catch (final IllegalArgumentException e) {
            throw new BadUserRequestException("Link URL is malformed");
        }
        if (scheme == null || !ALLOWED_LINK_SCHEMES.contains(scheme.toLowerCase(Locale.ROOT))) {
            throw new BadUserRequestException("Link URL scheme is not allowed; use http or https");
        }
    }

    @Override
    public Mono<Long> delete(final long linkId) {
        return linkRepository.delete(linkId).map(LinkPojo::getId);
    }
}
