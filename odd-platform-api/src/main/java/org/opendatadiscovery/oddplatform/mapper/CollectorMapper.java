package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Collector;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorList;
import org.opendatadiscovery.oddplatform.api.contract.model.CollectorUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;

public interface CollectorMapper
    extends CRUDMapper<Collector, CollectorList, CollectorFormData, CollectorUpdateFormData, CollectorDto> {

    CollectorPojo applyForm(final CollectorPojo pojo, final CollectorUpdateFormData form);

    CollectorPojo mapFormToPojo(final CollectorFormData form);

    CollectorDto mapForm(final CollectorFormData form, final TokenDto tokenDto);
}
