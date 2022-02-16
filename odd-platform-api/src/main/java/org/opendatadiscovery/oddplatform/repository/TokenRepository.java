package org.opendatadiscovery.oddplatform.repository;

import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

public interface TokenRepository {
    TokenPojo createIfNotExists(final TokenPojo tokenPojo);

    TokenPojo updateTokenValue(final TokenPojo tokenPojo);
}
