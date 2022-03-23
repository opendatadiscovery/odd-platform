package org.opendatadiscovery.oddplatform.service;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.opendatadiscovery.oddplatform.dto.metadata.MetadataTypeEnum;
import org.opendatadiscovery.oddplatform.service.metadata.MetadataParser;

public class MetadataParserTest {

    private final MetadataParser parser = new MetadataParser();

    @ParameterizedTest
    @ValueSource(strings = {
        "2022-01-01T12:00:00+01:00",
        "2022-01-01T12:00:00",
        "2022-01-01T12:00:00+01:00[Europe/Paris]"
    })
    public void testDate(final String dateString) {
        Assertions.assertThat(parser.parse(dateString)).isEqualTo(MetadataTypeEnum.DATETIME);
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 2, 3})
    public void testInteger(final Integer integer) {
        Assertions.assertThat(parser.parse(integer)).isEqualTo(MetadataTypeEnum.INTEGER);
    }

    @ParameterizedTest
    @ValueSource(floats = {1.0f, 2.2f, 3.5f})
    public void testFloat(final Float f) {
        Assertions.assertThat(parser.parse(f)).isEqualTo(MetadataTypeEnum.FLOAT);
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    public void testBoolean(final Boolean b) {
        Assertions.assertThat(parser.parse(b)).isEqualTo(MetadataTypeEnum.BOOLEAN);
    }

    @ParameterizedTest
    @ValueSource(strings = {"true", "a", "test", "5"})
    public void testString(final String str) {
        Assertions.assertThat(parser.parse(str)).isEqualTo(MetadataTypeEnum.STRING);
    }

    @ParameterizedTest
    @ValueSource(strings = {"{\"test\": \"test\"}", "[{\"test\": \"test\"}, {\"test1\": \"test1\"}]"})
    public void testJson(final String json) {
        Assertions.assertThat(parser.parse(json)).isEqualTo(MetadataTypeEnum.JSON);
    }
}
