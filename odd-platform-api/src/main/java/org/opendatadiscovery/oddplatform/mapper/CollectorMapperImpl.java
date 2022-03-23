package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Collector;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorList;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CollectorMapperImpl implements CollectorMapper {

    private final TokenMapper tokenMapper;
    private final NamespaceMapper namespaceMapper;

    @Override
    public CollectorDto mapForm(final CollectorFormData form) {
        return mapDto(form, null);
    }

    @Override
    public CollectorDto mapForm(final CollectorFormData form, final TokenDto tokenDto) {
        return mapDto(form, tokenDto);
    }

    @Override
    public CollectorDto applyForm(final CollectorDto pojo, final CollectorUpdateFormData form) {
        final CollectorPojo collectorPojo = pojo.collectorPojo()
            .setName(form.getName())
            .setDescription(form.getDescription());

        return new CollectorDto(collectorPojo,
            namespaceMapper.createPojoByName(form.getNamespaceName()),
            pojo.tokenDto());
    }

    @Override
    public Collector mapPojo(final CollectorDto dto) {
        final CollectorPojo pojo = dto.collectorPojo();
        return new Collector()
            .id(pojo.getId())
            .name(pojo.getName())
            .oddrn(pojo.getOddrn())
            .description(pojo.getDescription())
            .namespace(namespaceMapper.mapPojo(dto.namespace()))
            .token(tokenMapper.mapDtoToToken(dto.tokenDto()));
    }

    @Override
    public CollectorList mapPojos(final List<CollectorDto> pojos) {
        return new CollectorList()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public CollectorList mapPojos(final Page<CollectorDto> pojosPage) {
        return new CollectorList()
            .items(mapPojoList(pojosPage.getData()))
            .pageInfo(pageInfo(pojosPage));
    }

    private CollectorDto mapDto(final CollectorFormData form, final TokenDto tokenDto) {
        final CollectorPojo pojo = new CollectorPojo()
            .setName(form.getName())
            .setDescription(form.getDescription());
        return new CollectorDto(pojo, namespaceMapper.createPojoByName(form.getNamespaceName()), tokenDto);
    }
}
