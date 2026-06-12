package org.opendatadiscovery.oddplatform.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure-logic unit test for the hand-written TokenMapper.mapValue masking — validates F-163 (One-Shot
 * Token Reveal Affordance Pattern): a token rendered with showToken=false is MASKED to "******" plus only
 * the last 6 characters of the value, while a visible token (showToken=true) returns the full value. This
 * is the security invariant behind the one-shot reveal — the raw token must never leak on a non-reveal
 * read. Exercised against the real generated TokenMapperImpl (no mocks). No prior TokenMapper unit test.
 *
 * @validates F-163
 */
class TokenMapperImplTest {

    private TokenMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new TokenMapperImpl(new DateTimeMapperImpl());
    }

    @Test
    void mapValue_hiddenToken_masksAllButLastSix() {
        final TokenDto hidden = new TokenDto(new TokenPojo().setValue("secret1234567890"));
        assertThat(mapper.mapValue(hidden)).isEqualTo("******567890");
    }

    @Test
    void mapValue_visibleToken_returnsFullValue() {
        final TokenDto visible = TokenDto.visibleToken(new TokenPojo().setValue("secret1234567890"));
        assertThat(mapper.mapValue(visible)).isEqualTo("secret1234567890");
    }
}
