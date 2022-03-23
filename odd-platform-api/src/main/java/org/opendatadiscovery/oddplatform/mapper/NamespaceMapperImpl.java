package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
public class NamespaceMapperImpl implements NamespaceMapper {
    @Override
    public NamespacePojo mapForm(final NamespaceFormData form) {
        return new NamespacePojo().setName(form.getName());
    }

    @Override
    public NamespacePojo applyForm(final NamespacePojo pojo, final NamespaceUpdateFormData form) {
        pojo.setName(form.getName());
        return pojo;
    }

    @Override
    public Namespace mapPojo(final NamespacePojo pojo) {
        // TODO: obsolete?
        if (pojo == null) {
            return null;
        }

        if (pojo.getId() == null) {
            return null;
        }

        return new Namespace()
            .id(pojo.getId())
            .name(pojo.getName());
    }

    @Override
    public NamespaceList mapPojos(final List<NamespacePojo> pojos) {
        return new NamespaceList()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public NamespaceList mapPojos(final Page<NamespacePojo> pojos) {
        return new NamespaceList()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }

    @Override
    public NamespacePojo createPojoByName(final String name) {
        return StringUtils.isNotEmpty(name)
            ? new NamespacePojo().setName(name)
            : null;
    }
}
