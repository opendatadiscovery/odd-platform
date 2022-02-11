package org.opendatadiscovery.oddplatform.mapper;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenList;
import org.opendatadiscovery.oddplatform.api.contract.model.TokenUpdateFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TokenMapperImpl implements TokenMapper {

    private final AuthIdentityProvider authIdentityProvider;

    @Override
    public TokenDto mapForm(TokenFormData form) {
        TokenPojo tokenPojo = new TokenPojo()
                .setName(form.getName())
                .setDescription(form.getDescription())
                .setValue(form.getValue());
        return new TokenDto(tokenPojo);
    }

    @Override
    public TokenDto applyForm(final TokenDto dto, final TokenUpdateFormData form) {
        TokenPojo tokenPojo = dto.tokenPojo()
                .setName(form.getName())
                .setDescription(form.getDescription())
                .setValue(form.getValue() == null ? RandomStringUtils.randomAlphanumeric(40) : form.getValue())
                .setUpdatedAt(LocalDateTime.now())
                .setUpdatedBy("username");
        return new TokenDto(tokenPojo);
    }

    @Override
    public Token mapPojo(final TokenDto tokenDto) {
        if (tokenDto == null) return null;

        TokenPojo tokenPojo = tokenDto.tokenPojo();
        if (tokenPojo.getId() == null) return null;

        return mapPojoToToken(tokenPojo);
    }

    @Override
    public TokenList mapPojos(final List<TokenDto> pojos) {
        return new TokenList()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public TokenList mapPojos(final Page<TokenDto> pojos) {
        return new TokenList()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }

    @Override
    public Token mapPojoToToken(TokenPojo tokenPojo) {
        return new Token()
                .id(tokenPojo.getId())
                .name(tokenPojo.getName())
                .description(tokenPojo.getDescription())
                .value(tokenPojo.getValue())
                .createdAt(tokenPojo.getCreatedAt().atOffset(ZoneOffset.UTC))
                .createdBy(tokenPojo.getCreatedBy())
                .updatedAt(tokenPojo.getUpdatedAt().atOffset(ZoneOffset.UTC))
                .updatedBy(tokenPojo.getUpdatedBy());
    }

    @Override
    public TokenDto mapPojoToDto(final TokenPojo pojo, final String dsName) {
        String authUsername = authIdentityProvider.getUsername().block();
        String username = authUsername != null && !authUsername.isEmpty() ? authUsername : "default";

        if (pojo != null) {
            return new TokenDto(pojo);
        }
        return new TokenDto(
            new TokenPojo()
                .setName("Default token name for Datasource: " + dsName)
                .setDescription("Default token description for Datasource: " + dsName)
                .setValue(RandomStringUtils.randomAlphanumeric(40))
                .setCreatedAt(LocalDateTime.now())
                .setCreatedBy(username)
                .setUpdatedAt(LocalDateTime.now())
                .setUpdatedBy(username)
        );
    }
}
