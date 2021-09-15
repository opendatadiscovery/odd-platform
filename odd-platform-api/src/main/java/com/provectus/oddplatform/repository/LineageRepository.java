package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.LineagePojo;
import java.util.List;

public interface LineageRepository {
    void createLineagePaths(final List<LineagePojo> pojos);
}
