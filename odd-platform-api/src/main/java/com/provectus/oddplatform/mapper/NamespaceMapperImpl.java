package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Namespace;
import com.provectus.oddplatform.api.contract.model.NamespaceFormData;
import com.provectus.oddplatform.api.contract.model.NamespaceList;
import com.provectus.oddplatform.api.contract.model.NamespaceUpdateFormData;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.utils.Page;
import java.util.List;
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
}
