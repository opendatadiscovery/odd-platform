package org.opendatadiscovery.oddplatform.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.QueryExamplePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveQueryExampleSearchEntrypointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.assertEquals;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestExecutionListeners(listeners = {DependencyInjectionTestExecutionListener.class})
public class QueryExampleRepositoryTest extends BaseIntegrationTest {
    public static final String FIRST_PART = "firstPart";
    public static final String SECOND_PART = "secondPart";
    public static final String THIRD_PART = "thirdPart";

    @Autowired
    private ReactiveQueryExampleRepository queryExampleRepository;
    @Autowired
    private ReactiveQueryExampleSearchEntrypointRepository queryExampleSearchEntrypointRepository;

    @BeforeAll
    public void initData() {
        generateSearchData();
    }

    @Test
    @DisplayName("Find all Query Examples by State")
    public void testQueryExampleFindByState() {
        queryExampleRepository.findByState(FacetStateDto.empty(), 1, 15)
            .as(StepVerifier::create)
            .assertNext(item -> {
                assertEquals(15, item.getTotal());
            }).verifyComplete();
    }

    @Test
    @DisplayName("Find first part Query Examples by State")
    void testQueryExampleFindByStateByPart() {
        final FacetStateDto stateDto = FacetStateDto.empty();

        stateDto.setQuery(FIRST_PART);
        stateDto.setState(Map.of());

        queryExampleRepository.findByState(stateDto, 1, 15)
            .as(StepVerifier::create)
            .assertNext(item -> {
                assertEquals(5, item.getTotal());

                item.getData().stream()
                    .map(element -> element.queryExamplePojo()
                        .getDefinition()
                        .contains(FIRST_PART))
                    .forEach(Assertions::assertTrue);
            }).verifyComplete();
    }

    @Test
    @DisplayName("Find Query Examples by State using query")
    void testQueryExampleFindByStateByQuery() {
        final FacetStateDto stateDto = FacetStateDto.empty();

        stateDto.setQuery("3");
        stateDto.setState(Map.of());

        queryExampleRepository.findByState(stateDto, 1, 15)
            .as(StepVerifier::create)
            .assertNext(item -> {
                assertEquals(3, item.getTotal());

                item.getData().stream()
                    .map(element -> element.queryExamplePojo()
                        .getQuery()
                        .contains("3"))
                    .forEach(Assertions::assertTrue);
            }).verifyComplete();
    }

    private void generateSearchData() {
        final List<QueryExamplePojo> pojos = new ArrayList<>();

        generatePojos(pojos, FIRST_PART);
        generatePojos(pojos, SECOND_PART);
        generatePojos(pojos, THIRD_PART);

        final List<QueryExamplePojo> examples = queryExampleRepository.bulkCreate(pojos).collectList().block();
        examples.forEach(example -> queryExampleSearchEntrypointRepository
            .updateQueryExampleVectors(example.getId())
            .block());
    }

    private static void generatePojos(final List<QueryExamplePojo> pojos, final String thirdPart) {
        IntStream.range(0, 5).mapToObj(i -> new QueryExamplePojo()
            .setQuery("select " + i + " from " + thirdPart + i)
            .setDefinition(thirdPart + i)).forEach(pojos::add);
    }
}
