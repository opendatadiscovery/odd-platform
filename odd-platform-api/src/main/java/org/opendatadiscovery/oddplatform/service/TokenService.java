package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

public interface TokenService {
    TokenPojo generateToken(final TokenPojo tokenPojo, final String username);
}
