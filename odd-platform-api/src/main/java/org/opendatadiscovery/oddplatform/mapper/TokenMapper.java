package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.Token;
import org.opendatadiscovery.oddplatform.dto.TokenDto;

@Mapper(config = MapperConfig.class, uses = {OffsetDateTimeMapper.class})
public interface TokenMapper {

    @Mapping(source = "dto.tokenPojo", target = ".")
    @Mapping(source = "dto", target = "value")
    Token mapDtoToToken(final TokenDto dto);

    default String mapValue(final TokenDto dto) {
        return dto.showToken() ? dto.tokenPojo().getValue()
            : "******" + dto.tokenPojo().getValue().substring(dto.tokenPojo().getValue().length() - 6);
    }
}
