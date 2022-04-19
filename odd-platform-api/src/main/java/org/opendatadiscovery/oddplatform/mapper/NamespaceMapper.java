package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface NamespaceMapper {
    Namespace mapPojo(final NamespacePojo namespace);

    NamespacePojo mapForm(final NamespaceFormData form);

    NamespacePojo applyToPojo(@MappingTarget final NamespacePojo pojo, final NamespaceUpdateFormData form);

    List<Namespace> mapPojos(final List<NamespacePojo> namespace);

    default NamespaceList mapPojoPage(final Page<NamespacePojo> page) {
        return new NamespaceList()
            .items(mapPojos(page.getData()))
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }
}
