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

    @Mapping(source = "form", target = ".")
    @Mapping(source = "form.name", target = "name")
    @Mapping(source = "namespace.id", target = "namespaceId")
    @Mapping(source = "token.id", target = "tokenId")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    CollectorPojo mapForm(final CollectorFormData form, final NamespacePojo namespace, final TokenPojo token);

    @Mapping(source = "namespace.id", target = "namespaceId")
    @Mapping(source = "form", target = ".")
    @Mapping(source = "form.name", target = "name")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    CollectorPojo applyForm(@MappingTarget final CollectorPojo collector,
                            final NamespacePojo namespace,
                            final CollectorUpdateFormData form);
}
