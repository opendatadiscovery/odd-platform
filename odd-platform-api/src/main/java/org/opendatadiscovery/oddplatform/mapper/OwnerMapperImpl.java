package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
public class OwnerMapperImpl implements OwnerMapper {
    @Override
    public OwnerPojo mapForm(final OwnerFormData form) {
        return new OwnerPojo().setName(form.getName());
    }

    @Override
    public OwnerPojo applyForm(final OwnerPojo pojo, final OwnerFormData form) {
        pojo.setName(form.getName());
        return pojo;
    }

    @Override
    public Owner mapPojo(final OwnerPojo pojo) {
        if (pojo == null) {
            return null;
        }

        return new Owner()
            .id(pojo.getId())
            .name(pojo.getName());
    }

    @Override
    public OwnerList mapPojos(final List<OwnerPojo> pojos) {
        return new OwnerList()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public OwnerList mapPojos(final Page<OwnerPojo> pojos) {
        return new OwnerList()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }
}
