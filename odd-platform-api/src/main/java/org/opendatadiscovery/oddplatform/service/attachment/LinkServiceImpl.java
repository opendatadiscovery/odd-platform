package org.opendatadiscovery.oddplatform.service.attachment;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkListFormData;
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
        final List<LinkPojo> pojos = ObjectUtils.defaultIfNull(formData.getItems(), List.<DataEntityLinkFormData>of())
            .stream()
            .map(link -> linkMapper.mapToPojo(link, dataEntityId))
            .toList();
        return linkRepository.bulkCreate(pojos)
            .map(linkMapper::mapToDto);
    }

    @Override
    public Mono<DataEntityLink> update(final long linkId, final DataEntityLinkFormData formData) {
        return linkRepository.get(linkId)
            .switchIfEmpty(Mono.error(() -> new NotFoundException("Link", linkId)))
            .map(pojo -> linkMapper.applyToPojo(formData, pojo))
            .flatMap(linkRepository::update)
            .map(linkMapper::mapToDto);
    }

    @Override
    public Mono<Long> delete(final long linkId) {
        return linkRepository.delete(linkId).map(LinkPojo::getId);
    }
}
