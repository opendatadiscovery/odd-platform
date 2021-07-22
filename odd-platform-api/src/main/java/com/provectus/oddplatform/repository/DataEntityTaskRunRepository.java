package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.DataEntityTaskRunPojo;

import java.util.Collection;

public interface DataEntityTaskRunRepository {
    void persist(final DataEntityTaskRunPojo pojo);

    void persist(final Collection<DataEntityTaskRunPojo> pojos);
}
