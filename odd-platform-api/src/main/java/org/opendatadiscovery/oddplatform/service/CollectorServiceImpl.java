package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Collector;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorList;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.mapper.CollectorMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.TokenRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CollectorServiceImpl implements CollectorService {
    private final TokenGenerator tokenGenerator;

    private final CollectorMapper collectorMapper;

    private final ReactiveCollectorRepository collectorRepository;
    private final ReactiveNamespaceRepository namespaceRepository;
    private final TokenRepository tokenRepository;

    @Override
    public Mono<CollectorList> list(final int page, final int size, final String nameQuery) {
        return collectorRepository.listDto(page, size, nameQuery).map(collectorMapper::mapDtoPage);
    }

    @Override
    @ReactiveTransactional
    public Mono<Collector> create(final CollectorFormData form) {
        final Mono<TokenDto> token = tokenGenerator.generateToken().flatMap(tokenRepository::create);

        if (StringUtils.isNotEmpty(form.getNamespaceName())) {
            final Mono<NamespacePojo> namespace = namespaceRepository
                .getByName(form.getNamespaceName())
                .switchIfEmpty(namespaceRepository.create(new NamespacePojo().setName(form.getNamespaceName())));

            return Mono.zip(namespace, token).flatMap(t -> create(form, t.getT1(), t.getT2()));
        }

        return token.flatMap(t -> create(form, null, t));
    }

    @Override
    @ReactiveTransactional
    public Mono<Collector> update(final long id, final CollectorUpdateFormData form) {
        return collectorRepository.getDto(id)
            .flatMap(collectorDto -> {
                if (StringUtils.isNotEmpty(form.getNamespaceName())) {
                    return namespaceRepository.getByName(form.getNamespaceName())
                        .switchIfEmpty(namespaceRepository.createByName(form.getNamespaceName()))
                        .flatMap(namespace -> update(
                            collectorMapper.applyForm(collectorDto.collectorPojo(), namespace, form),
                            namespace,
                            collectorDto.tokenDto()
                        ));
                }

                return update(
                    collectorMapper.applyForm(collectorDto.collectorPojo(), null, form),
                    null,
                    collectorDto.tokenDto()
                );
            });
    }

    @Override
    public Mono<Long> delete(final long id) {
        return collectorRepository.delete(id).map(CollectorPojo::getId);
    }

    @Override
    public Mono<Collector> regenerateToken(final Long collectorId) {
        // TODO: speak with Damir
        return Mono.empty();
//        return Mono.fromCallable(() -> entityRepository.get(collectorId))
//            .filter(Optional::isPresent)
//            .switchIfEmpty(Mono.error(new NotFoundException()))
//            .map(Optional::get)
//            .flatMap(dto -> tokenGenerator.regenerateToken(dto.tokenDto().tokenPojo()).map(tokenPojo -> {
//                final TokenDto updatedTokenDto = tokenRepository.updateToken(tokenPojo);
//                return entityMapper.mapPojo(new CollectorDto(dto.collectorPojo(), dto.namespace(), updatedTokenDto));
//            }));
    }

    private Mono<Collector> create(final CollectorFormData form,
                                   final NamespacePojo namespace,
                                   final TokenDto token) {
        final CollectorPojo toCreate = collectorMapper.mapForm(form, namespace, token.tokenPojo())
            .setNamespaceId(namespace != null ? namespace.getId() : null)
            .setTokenId(token.tokenPojo().getId());

        return collectorRepository
            .create(toCreate).map(c -> new CollectorDto(c, namespace, token))
            .map(collectorMapper::mapDto);
    }

    private Mono<Collector> update(final CollectorPojo pojo, final NamespacePojo namespace, final TokenDto token) {
        return collectorRepository
            .update(pojo)
            .map(updatedCollector -> new CollectorDto(updatedCollector, namespace, token))
            .map(collectorMapper::mapDto);
    }
}
