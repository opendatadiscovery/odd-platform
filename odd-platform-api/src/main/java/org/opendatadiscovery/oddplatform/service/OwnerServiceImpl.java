package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.mapper.OwnerMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.OwnerRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class OwnerServiceImpl
    extends
    AbstractCRUDService<Owner, OwnerList, OwnerFormData, OwnerFormData, OwnerPojo, OwnerMapper, OwnerRepository>
    implements OwnerService {

    public OwnerServiceImpl(final OwnerMapper entityMapper, final OwnerRepository entityRepository) {
        super(entityMapper, entityRepository);
    }

    @Override
    public Mono<Owner> createOrGet(final OwnerFormData formData) {
        return Mono
            .fromCallable(() -> entityRepository.createOrGet(entityMapper.mapForm(formData)))
            .map(entityMapper::mapPojo);
    }
}
