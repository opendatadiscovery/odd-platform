package org.opendatadiscovery.oddplatform.mapper;

import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValue;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.dto.EnumValueOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class EnumValueMapperTest {

    private final EnumValueMapper mapper = new EnumValueMapperImpl();

    private static final long DATASET_FIELD_ID = 1L;

    @ParameterizedTest
    @MethodSource("formAndPojoProvider")
    public void testMapToPojo(final EnumValueFormData tested, final EnumValuePojo expected) {
        assertThat(mapper.mapInternalToPojo(tested, DATASET_FIELD_ID)).isEqualTo(expected);
    }

    @ParameterizedTest
    @MethodSource("pojoAndEnumProvider")
    public void testMapToEnum(final EnumValuePojo tested, final EnumValue expected) {
        assertThat(mapper.mapToEnum(tested)).isEqualTo(expected);
    }

    private static Stream<Arguments> formAndPojoProvider() {
        final var formWithoutDescription = new EnumValueFormData()
            .id(1L)
            .name("name");

        final var pojoWithoutDescription = new EnumValuePojo()
            .setId(1L)
            .setName("name")
            .setOrigin(EnumValueOrigin.INTERNAL.getCode())
            .setDatasetFieldId(DATASET_FIELD_ID);

        return Stream.of(
            Arguments.arguments(formWithoutDescription, pojoWithoutDescription),
            Arguments.arguments(null, null)
        );
    }

    private static Stream<Arguments> pojoAndEnumProvider() {
        final var pojo = new EnumValuePojo()
            .setId(1L)
            .setName("name")
            .setDatasetFieldId(DATASET_FIELD_ID)
            .setOrigin(EnumValueOrigin.INTERNAL.getCode())
            .setInternalDescription("description");

        final var enumValue = new EnumValue()
            .id(1L)
            .name("name")
            .modifiable(true)
            .description("description");

        return Stream.of(
            Arguments.arguments(pojo, enumValue),
            Arguments.arguments(null, null)
        );
    }
}
