package com.provectus.oddplatform.service;

import com.provectus.oddplatform.ingestion.contract.model.DataEntityList;

public interface IngestionService {
    void ingest(final DataEntityList dataEntityList);
}
