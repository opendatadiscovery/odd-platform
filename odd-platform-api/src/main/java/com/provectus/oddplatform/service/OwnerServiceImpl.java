package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Owner;
import com.provectus.oddplatform.api.contract.model.OwnerFormData;
import com.provectus.oddplatform.api.contract.model.OwnerList;
import com.provectus.oddplatform.mapper.OwnerMapper;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;
import com.provectus.oddplatform.repository.OwnerRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class OwnerServiceImpl
    extends AbstractCRUDService<Owner, OwnerList, OwnerFormData, OwnerFormData, OwnerPojo, OwnerMapper, OwnerRepository>
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
