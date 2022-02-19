package org.opendatadiscovery.oddplatform.repository;

import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

public interface TokenRepository {
    TokenDto create(final TokenPojo tokenPojo);

    TokenDto updateToken(final TokenPojo tokenPojo);
}
