package org.opendatadiscovery.oddplatform.repository;

import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

public interface TokenRepository {
    TokenPojo create(final TokenPojo tokenPojo);

    TokenPojo regenerateToken(final TokenPojo tokenPojo);

    TokenPojo getToken(final Long tokenId);
}
