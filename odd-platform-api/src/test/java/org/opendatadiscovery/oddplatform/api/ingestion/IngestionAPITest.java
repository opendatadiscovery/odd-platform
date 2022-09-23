package org.opendatadiscovery.oddplatform.api.ingestion;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityList;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntityType;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSet;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSetFieldType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

@SpringBootTest
@AutoConfigureWebTestClient(timeout = "60000")
public class IngestionAPITest extends BaseIntegrationTest {
    @Autowired
    private WebTestClient webTestClient;

    @Test
    public void simpleDatasetStructureTest() {
        final DataSource createdDataSource = createDataSource();

        final DataSet dataset = new DataSet().fieldList(List.of(
            new DataSetField()
                .name(UUID.randomUUID().toString())
                .oddrn(UUID.randomUUID().toString())
                .type(new DataSetFieldType().type(DataSetFieldType.TypeEnum.NUMBER))
        ));

        final DataEntity dataEntity = new DataEntity()
            .name(UUID.randomUUID().toString())
            .oddrn(UUID.randomUUID().toString())
            .type(DataEntityType.TABLE)
            .dataset(dataset);

        final DataEntityList dataEntityList = new DataEntityList()
            .dataSourceOddrn(createdDataSource.getOddrn())
            .items(List.of(dataEntity));

        webTestClient.post()
            .uri("/ingestion/entities")
            .body(Mono.just(dataEntityList), DataEntityList.class)
            .exchange()
            .expectStatus()
            .isOk();
    }

    private DataSource createDataSource() {
        final DataSourceFormData form = new DataSourceFormData()
            .name(UUID.randomUUID().toString())
            .oddrn(UUID.randomUUID().toString())
            .active(true)
            .namespaceName(UUID.randomUUID().toString());

        return webTestClient.post()
            .uri("/api/datasources")
            .body(Mono.just(form), DataSourceFormData.class)
            .exchange()
            .returnResult(DataSource.class)
            .getResponseBody()
            .single()
            .block();
    }
}