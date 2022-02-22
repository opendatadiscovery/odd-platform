package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.annotation.DirtiesContext;

import static org.assertj.core.api.Assertions.assertThat;

public class DataSourceRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private DataSourceRepository dataSourceRepository;

    @Test
    @DirtiesContext(methodMode = DirtiesContext.MethodMode.BEFORE_METHOD)
    public void getByOddrnsTest() {
        final DataSourceDto firstDataSource = dataSourceRepository.create(
            generateDataSource(UUID.randomUUID().toString(), UUID.randomUUID().toString())
        );
        final DataSourceDto secondDataSource = dataSourceRepository.create(
            generateDataSource(UUID.randomUUID().toString(), UUID.randomUUID().toString())
        );
        dataSourceRepository.delete(firstDataSource.dataSource().getId());
        final List<DataSourceDto> dtos = dataSourceRepository.getByOddrns(
            List.of(firstDataSource.dataSource().getOddrn(), secondDataSource.dataSource().getOddrn()), true);

        assertThat(dtos)
            .hasSize(2)
            .extracting(dto -> dto.dataSource().getId())
            .containsExactlyInAnyOrder(firstDataSource.dataSource().getId(), secondDataSource.dataSource().getId());
    }

    @Test
    public void restoreDataSourcesTest() {
        final DataSourcePojo firstDataSource = dataSourceRepository.create(
            generateDataSource(UUID.randomUUID().toString(), UUID.randomUUID().toString())
        ).dataSource();
        assertThat(firstDataSource.getIsDeleted()).isFalse();
        dataSourceRepository.delete(firstDataSource.getId());
        dataSourceRepository.restoreDataSources(List.of(firstDataSource.getOddrn()));
        final DataSourceDto restoredFirstDataSource = dataSourceRepository.get(firstDataSource.getId()).orElseThrow();
        assertThat(restoredFirstDataSource.dataSource().getIsDeleted()).isFalse();
    }

    @Test
    public void bulkCreateTest() {
        final DataSourceDto firstDataSource =
            generateDataSource(UUID.randomUUID().toString(), UUID.randomUUID().toString());
        final DataSourceDto secondDataSource =
            generateDataSource(UUID.randomUUID().toString(), UUID.randomUUID().toString());
        final List<DataSourceDto> dtos =
            dataSourceRepository.bulkCreate(List.of(firstDataSource, secondDataSource));

        assertThat(dtos)
            .hasSize(2)
            .extracting(dto -> dto.dataSource().getId())
            .doesNotContainNull();

        assertThat(dtos)
            .extracting(dto -> dto.dataSource().getOddrn())
            .containsExactlyInAnyOrder(firstDataSource.dataSource().getOddrn(),
                secondDataSource.dataSource().getOddrn());
    }

//    @Test
    public void createFromIngestionTest() {
//        final DataSourceDto firstDataSource = dataSourceRepository.create(
//            generateDataSource(UUID.randomUUID().toString(), UUID.randomUUID().toString())
//        );
//        final DataSourceDto secondDataSource = dataSourceRepository.create(
//            generateDataSource(UUID.randomUUID().toString(), UUID.randomUUID().toString())
//        );
//        dataSourceRepository.delete(firstDataSource.dataSource().getId());
//
//        final DataSourceDto firstClone = generateDataSource(
//            firstDataSource.dataSource().getOddrn(),
//            firstDataSource.dataSource().getName()
//        );
//        final DataSourceDto secondClone = generateDataSource(
//            secondDataSource.dataSource().getOddrn(),
//            UUID.randomUUID().toString()
//        );
//
//        final DataSourceDto thirdDataSource = generateDataSource(
//            UUID.randomUUID().toString(), UUID.randomUUID().toString());
//        final List<DataSourceDto> fromIngestion = dataSourceRepository.createFromIngestion(
//            List.of(firstClone, secondClone, thirdDataSource)
//        );
//        assertThat(fromIngestion)
//            .hasSize(3)
//            .extracting(dto -> dto.dataSource().getOddrn())
//            .containsExactlyInAnyOrder(firstClone.dataSource().getOddrn(),
//                secondClone.dataSource().getOddrn(),
//                thirdDataSource.dataSource().getOddrn());
//
//        assertThat(fromIngestion)
//            .extracting(dto -> dto.dataSource().getId())
//            .doesNotContainNull()
//            .contains(firstDataSource.dataSource().getId(),
//                secondDataSource.dataSource().getId());
//
//        assertThat(fromIngestion)
//            .extracting(dto -> dto.dataSource().getName())
//            .containsExactlyInAnyOrder(firstClone.dataSource().getName(),
//                secondDataSource.dataSource().getName(), thirdDataSource.dataSource().getName());
    }

    private DataSourceDto generateDataSource(final String oddrn, final String name) {
        return new DataSourceDto(
            new DataSourcePojo()
                .setOddrn(oddrn)
                .setName(name),
            null
        );
    }
}
