package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {
    private final static String defaultName = "Default token name for Datasource: ";
    private final static String defaultDescription = "Default token description for Datasource: ";

    @Override
    public TokenPojo generateToken(TokenPojo tokenPojo, final String username) {
        if (ObjectUtils.isEmpty(tokenPojo)) {
            tokenPojo = new TokenPojo()
                    .setName(defaultName)
                    .setDescription(defaultDescription)
                    .setCreatedAt(LocalDateTime.now())
                    .setCreatedBy(username);
        }

        return tokenPojo
                .setValue(RandomStringUtils.randomAlphanumeric(40))
                .setUpdatedAt(LocalDateTime.now())
                .setUpdatedBy(username);
    }
}
