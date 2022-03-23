package org.opendatadiscovery.oddplatform.service;

import java.util.Optional;
import org.opendatadiscovery.oddplatform.api.contract.model.Collector;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorList;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.CollectorMapper;
import org.opendatadiscovery.oddplatform.repository.CollectorRepository;
import org.opendatadiscovery.oddplatform.repository.TokenRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CollectorServiceImpl
    extends AbstractCRUDService<Collector, CollectorList, CollectorFormData, CollectorUpdateFormData,
    CollectorDto, CollectorMapper, CollectorRepository>
    implements CollectorService {

    private final TokenService tokenService;
    private final TokenRepository tokenRepository;

    public CollectorServiceImpl(final CollectorMapper entityMapper,
                                final CollectorRepository entityRepository,
                                final TokenService tokenService,
                                final TokenRepository tokenRepository) {
        super(entityMapper, entityRepository);
        this.tokenService = tokenService;
        this.tokenRepository = tokenRepository;
    }

    @Override
    public Mono<Collector> create(final CollectorFormData createEntityForm) {
        return tokenService.generateToken().map(tokenPojo -> {
            final CollectorDto collectorDto = entityMapper.mapForm(createEntityForm, new TokenDto(tokenPojo));
            final CollectorDto createdDto = entityRepository.create(collectorDto);
            return entityMapper.mapPojo(createdDto);
        });
    }

    @Override
    public Mono<Collector> regenerateDataSourceToken(final Long collectorId) {
        return Mono.fromCallable(() -> entityRepository.get(collectorId))
            .filter(Optional::isPresent)
            .switchIfEmpty(Mono.error(new NotFoundException()))
            .map(Optional::get)
            .flatMap(dto -> tokenService.regenerateToken(dto.tokenDto().tokenPojo()).map(tokenPojo -> {
                final TokenDto updatedTokenDto = tokenRepository.updateToken(tokenPojo);
                return entityMapper.mapPojo(new CollectorDto(dto.collectorPojo(), dto.namespace(), updatedTokenDto));
            }));
    }
}
