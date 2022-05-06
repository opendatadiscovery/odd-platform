package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Term;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class,
    uses = {
        NamespaceMapper.class,
        OffsetDateTimeMapper.class,
        OwnershipMapper.class
    })
public interface TermMapper {

    TermPojo mapToPojo(final TermFormData formData);

    default TermPojo mapToPojo(final TermFormData formData, final NamespacePojo namespacePojo) {
        return mapToPojo(formData)
            .setNamespaceId(namespacePojo.getId());
    }

    TermPojo applyToPojo(final TermFormData formData, @MappingTarget final TermPojo pojo);

    default TermPojo applyToPojo(final TermFormData formData,
                                 final NamespacePojo namespacePojo,
                                 final TermPojo pojo) {
        return applyToPojo(formData, pojo)
            .setNamespaceId(namespacePojo.getId());
    }

    List<TermRef> mapToRefList(final List<TermRefDto> dtos);

    default TermRefList mapToRefPage(final Page<TermRefDto> page) {
        return new TermRefList()
            .items(mapToRefList(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }

    List<Term> mapToList(final List<TermDto> dtos);

    default TermList mapToPage(final Page<TermDto> page) {
        return new TermList()
            .items(mapToList(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }

    @Mapping(source = "dto.termDto.termRefDto.term", target = ".")
    @Mapping(source = "dto.termDto.termRefDto.namespace", target = "namespace")
    @Mapping(source = "dto.termDto.ownerships", target = "ownership")
    @Mapping(source = "dto.termDto.entitiesUsingCount", target = "entitiesUsingCount")
    TermDetails mapToDetails(final TermDetailsDto dto);

    @Mapping(source = "dto.termRefDto.term", target = ".")
    @Mapping(source = "dto.termRefDto.namespace", target = "namespace")
    @Mapping(source = "dto.ownerships", target = "ownership")
    Term mapToTerm(final TermDto dto);

    @Mapping(source = "dto.term", target = ".")
    TermRef mapToRef(final TermRefDto dto);
}
