package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.Collector;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorList;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class, uses = {NamespaceMapper.class, TokenMapper.class})
public interface CollectorMapper {
    @Mapping(source = "collectorPojo", target = ".")
    @Mapping(source = "dto.tokenDto", target = "token")
    Collector mapDto(final CollectorDto dto);

    List<Collector> mapDtos(final List<CollectorDto> dtos);

    default CollectorList mapDtoPage(final Page<CollectorDto> page) {
        return new CollectorList()
            .items(mapDtos(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }

    CollectorPojo mapForm(final CollectorFormData form);

    default CollectorPojo mapForm(final CollectorFormData form,
                                  final NamespacePojo namespace,
                                  final TokenPojo token) {
        return mapForm(form)
            .setNamespaceId(namespace != null ? namespace.getId() : null)
            .setTokenId(token != null ? token.getId() : null);
    }

    CollectorPojo applyToDto(@MappingTarget final CollectorPojo collector, final CollectorUpdateFormData form);

    default CollectorPojo applyToDto(final CollectorPojo collector,
                                     final CollectorUpdateFormData form,
                                     final NamespacePojo namespace) {
        return applyToDto(collector, form).setNamespaceId(namespace != null ? namespace.getId() : null);
    }
}
