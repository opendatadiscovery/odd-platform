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
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.CollectorMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.TokenRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class CollectorServiceImpl implements CollectorService {
    private final TokenGenerator tokenGenerator;
    private final CollectorMapper collectorMapper;
    private final ReactiveCollectorRepository collectorRepository;
    private final NamespaceService namespaceService;
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
            final Mono<NamespacePojo> namespace = namespaceService.getOrCreate(form.getNamespaceName());
            return Mono.zip(namespace, token).flatMap(t -> createCollector(form, t.getT1(), t.getT2()));
        }

        return token.flatMap(t -> createCollector(form, null, t));
    }

    @Override
    @ReactiveTransactional
    public Mono<Collector> update(final long id, final CollectorUpdateFormData form) {
        return collectorRepository.getDto(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Collector with ID %d doesn't exist", id)))
            .flatMap(collectorDto -> {
                if (StringUtils.isNotEmpty(form.getNamespaceName())) {
                    return namespaceService.getOrCreate(form.getNamespaceName())
                        .flatMap(namespace -> updateCollector(
                            collectorMapper.applyToDto(collectorDto.collectorPojo(), form, namespace),
                            namespace,
                            collectorDto.tokenDto()
                        ));
                }

                return updateCollector(
                    collectorMapper.applyToDto(collectorDto.collectorPojo(), form), collectorDto.tokenDto()
                );
            });
    }

    @Override
    public Mono<Long> delete(final long id) {
        return collectorRepository.delete(id).map(CollectorPojo::getId);
    }

    @Override
    public Mono<Collector> regenerateToken(final long collectorId) {
        return collectorRepository.getDto(collectorId)
            .switchIfEmpty(Mono.error(new NotFoundException("Collector with ID %d doesn't exist", collectorId)))
            .flatMap(dto -> tokenGenerator
                .regenerateToken(dto.tokenDto().tokenPojo())
                .flatMap(tokenRepository::updateToken)
                .map(t -> collectorMapper.mapDto(new CollectorDto(dto.collectorPojo(), dto.namespace(), t))));
    }

    private Mono<Collector> createCollector(final CollectorFormData form, final NamespacePojo namespace,
                                            final TokenDto token) {
        return collectorRepository
            .create(collectorMapper.mapForm(form, namespace, token.tokenPojo()))
            .map(c -> new CollectorDto(c, namespace, token))
            .map(collectorMapper::mapDto);
    }

    private Mono<Collector> updateCollector(final CollectorPojo pojo, final TokenDto token) {
        return updateCollector(pojo, null, token);
    }

    private Mono<Collector> updateCollector(final CollectorPojo pojo, final NamespacePojo namespace,
                                            final TokenDto token) {
        return collectorRepository.update(pojo)
            .map(updatedCollector -> new CollectorDto(updatedCollector, namespace, token))
            .map(collectorMapper::mapDto);
    }
}
