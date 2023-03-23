package org.opendatadiscovery.oddplatform.api.ingestion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.io.File;
import java.io.IOException;
import java.util.List;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIngestionTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.springframework.core.io.ClassPathResource;

public class LoadIngestionTest extends BaseIngestionTest {
    private final ObjectMapper objectMapper = new ObjectMapper()
        .registerModule(new JavaTimeModule());

    @Test
    public void testInjectingManyDataEntities() throws IOException {
        final List<DataSourceFormData> dataSources = objectMapper.readValue(
            new ClassPathResource("ingestion/datasource/datasources.json").getInputStream(),
            objectMapper.getTypeFactory().constructCollectionType(List.class, DataSourceFormData.class)
        );
        dataSources.forEach(this::createDataSource);

        final File[] dataEntityFiles = new ClassPathResource("ingestion/samples").getFile().listFiles();
        Assertions.assertThat(dataEntityFiles).isNotNull();

        for (final File dataEntityFile : dataEntityFiles) {
            final DataEntityList entityList = objectMapper.readValue(dataEntityFile, DataEntityList.class);
            ingestAndAssert(entityList);
        }
    }
}
