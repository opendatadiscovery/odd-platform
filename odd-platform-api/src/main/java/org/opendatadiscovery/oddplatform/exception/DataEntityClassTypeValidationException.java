package org.opendatadiscovery.oddplatform.exception;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;

import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_CONSUMER;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_ENTITY_GROUP;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_INPUT;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_QUALITY_TEST;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_QUALITY_TEST_RUN;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_SET;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_TRANSFORMER;
import static org.opendatadiscovery.oddplatform.dto.DataEntityClassDto.DATA_TRANSFORMER_RUN;

public class DataEntityClassTypeValidationException extends BadUserRequestException {
    private static final Map<DataEntityClassDto, String> ENTITY_CLASS_PROPERTY = Map.of(
        DATA_SET, "dataset",
        DATA_TRANSFORMER, "data_transformer",
        DATA_TRANSFORMER_RUN, "data_transformer_run",
        DATA_CONSUMER, "data_consumer",
        DATA_QUALITY_TEST, "data_quality_test",
        DATA_QUALITY_TEST_RUN, "data_quality_test_run",
        DATA_INPUT, "data_input",
        DATA_ENTITY_GROUP, "data_entity_group"
    );

    private static final String MESSAGE = """
        Data entity with oddrn %s has %s type. One or several properties must be filled: [%s]. \
        Received properties: [%s]. Please define missing fields and try again.""";

    public DataEntityClassTypeValidationException(final String oddrn, final DataEntityTypeDto type,
                                                  final Set<DataEntityClassDto> actualClasses,
                                                  final Set<DataEntityClassDto> expectedClasses) {
        super(MESSAGE, oddrn, type,
            expectedClasses.stream().map(ENTITY_CLASS_PROPERTY::get).collect(Collectors.joining(", ")),
            actualClasses.stream().map(ENTITY_CLASS_PROPERTY::get).collect(Collectors.joining(", "))
        );
    }
}
