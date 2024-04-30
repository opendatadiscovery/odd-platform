package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTerm;
import org.opendatadiscovery.oddplatform.api.contract.model.LinkedTermList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Term;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermList;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRef;
import org.opendatadiscovery.oddplatform.api.contract.model.TermRefList;
import org.opendatadiscovery.oddplatform.dto.term.LinkedTermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.dto.term.TermDto;
import org.opendatadiscovery.oddplatform.dto.term.TermRefDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class,
    uses = {
        NamespaceMapper.class,
        DateTimeMapper.class,
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

    List<TermRef> mapToRefList(final Collection<TermRefDto> dtos);

    default TermRefList mapToRefPage(final Page<TermRefDto> page) {
        return new TermRefList()
            .items(mapToRefList(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }

    List<Term> mapToList(final List<TermDto> dtos);

    List<LinkedTerm> mapListToLinkedTermList(final List<LinkedTermDto> dtos);

    default LinkedTermList mapToLinkedTermList(final List<LinkedTermDto> dtos) {
        return new LinkedTermList().items(mapListToLinkedTermList(dtos));
    }

    default TermList mapToPage(final Page<TermDto> page) {
        return new TermList()
            .items(mapToList(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }

    LinkedTerm mapToLinkedTerm(final LinkedTermDto dto);

    @Mapping(source = "dto.termDto.termRefDto.term", target = ".")
    @Mapping(source = "dto.termDto.termRefDto.namespace", target = "namespace")
    @Mapping(source = "dto.termDto.ownerships", target = "ownership")
    @Mapping(source = "dto.termDto.entitiesUsingCount", target = "entitiesUsingCount")
    @Mapping(source = "dto.termDto.columnsUsingCount", target = "columnsUsingCount")
    @Mapping(source = "dto.termDto.linkedTermsUsingCount", target = "linkedTermsUsingCount")
    @Mapping(source = "dto.termDto.queryExampleUsingCount", target = "queryExampleUsingCount")
    TermDetails mapToDetails(final TermDetailsDto dto);

    @Mapping(source = "dto.termRefDto.term", target = ".")
    @Mapping(source = "dto.termRefDto.namespace", target = "namespace")
    @Mapping(source = "dto.ownerships", target = "ownership")
    Term mapToTerm(final TermDto dto);

    @Mapping(source = "dto.term", target = ".")
    TermRef mapToRef(final TermRefDto dto);
}
