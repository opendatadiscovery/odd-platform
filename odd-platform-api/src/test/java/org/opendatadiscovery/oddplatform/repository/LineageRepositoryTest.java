package org.opendatadiscovery.oddplatform.repository;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.commons.lang3.RandomStringUtils;
import org.jeasy.random.EasyRandom;
import org.jeasy.random.EasyRandomParameters;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.DataEntityDimensionsDto;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageDepth;
import org.opendatadiscovery.oddplatform.dto.lineage.LineageStreamKind;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LineagePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveLineageRepository;
import org.opendatadiscovery.oddplatform.utils.RecordFactory;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;

class LineageRepositoryTest extends BaseIntegrationTest {

    private static final EasyRandom EASY_RANDOM;

    static {
        final EasyRandomParameters EASY_RANDOMParameters = new EasyRandomParameters()
            .scanClasspathForConcreteTypes(true)
            .randomizationDepth(10)
            .objectFactory(new RecordFactory());

        EASY_RANDOM = new EasyRandom(EASY_RANDOMParameters);
    }

    @Autowired
    ReactiveLineageRepository lineageRepository;
    @Autowired
    ReactiveDataEntityRepository dataEntityRepository;

    @Test
    void batchDeleteByEstablisherOddrnTest() {
        final var firstEstablisherOddrnToDelete = RandomStringUtils.randomAlphabetic(5);
        final var secondEstablisherOddrnToDelete = RandomStringUtils.randomAlphabetic(5);
        final var establisherOddrnToKeep = RandomStringUtils.randomAlphabetic(5);
        final var firstPojoToDelete =
            EASY_RANDOM.nextObject(LineagePojo.class).setEstablisherOddrn(firstEstablisherOddrnToDelete);
        final var secondPojoToDelete =
            EASY_RANDOM.nextObject(LineagePojo.class).setEstablisherOddrn(secondEstablisherOddrnToDelete);
        final var pojoToKeep = EASY_RANDOM.nextObject(LineagePojo.class).setEstablisherOddrn(establisherOddrnToKeep);
        lineageRepository.bulkCreate(List.of(firstPojoToDelete, secondPojoToDelete, pojoToKeep)).blockLast();
        lineageRepository.batchDeleteByEstablisherOddrn(
                List.of(firstEstablisherOddrnToDelete, secondEstablisherOddrnToDelete))
            .as(StepVerifier::create)
            .expectNext(firstPojoToDelete)
            .expectNext(secondPojoToDelete)
            .verifyComplete();
    }

    @Test
    void batchInsertLineagesTest() {
        final var firstPojoToInsert = EASY_RANDOM.nextObject(LineagePojo.class);
        final var secondPojoToInsert = EASY_RANDOM.nextObject(LineagePojo.class);
        final var duplicatedPojo = EASY_RANDOM.nextObject(LineagePojo.class);
        lineageRepository.create(duplicatedPojo).block();
        lineageRepository.batchInsertLineages(List.of(firstPojoToInsert, secondPojoToInsert, duplicatedPojo))
            .as(StepVerifier::create)
            .expectNext(firstPojoToInsert)
            .expectNext(secondPojoToInsert)
            .verifyComplete();
    }

    @Test
    void getTargetsCountTest() {
        final var parentId = EASY_RANDOM.nextLong();
        final var parentOddrn = RandomStringUtils.randomAlphabetic(5);
        final var pojo = new DataEntityPojo().setId(parentId).setOddrn(parentOddrn);
        final var entity = new DataEntityDimensionsDto();
        entity.setDataEntity(pojo);
        final var firstLineagePojo = new LineagePojo()
            .setParentOddrn(parentOddrn)
            .setChildOddrn(RandomStringUtils.randomAlphabetic(5))
            .setEstablisherOddrn(RandomStringUtils.randomAlphabetic(5));
        final var secondLineagePojo = new LineagePojo()
            .setParentOddrn(parentOddrn)
            .setChildOddrn(RandomStringUtils.randomAlphabetic(5))
            .setEstablisherOddrn(RandomStringUtils.randomAlphabetic(5));
        final var notCountedLineagePojo = new LineagePojo()
            .setParentOddrn(RandomStringUtils.randomAlphabetic(5))
            .setChildOddrn(RandomStringUtils.randomAlphabetic(5))
            .setEstablisherOddrn(RandomStringUtils.randomAlphabetic(5));
        dataEntityRepository.create(pojo).block();
        lineageRepository.bulkCreate(List.of(firstLineagePojo, secondLineagePojo, notCountedLineagePojo)).blockLast();
        lineageRepository.getTargetsCount(Set.of(parentOddrn))
            .as(StepVerifier::create)
            .assertNext(r -> assertThat(r.get(parentOddrn)).isEqualTo(2L))
            .verifyComplete();
    }

    @Test
    void getLineageRelationsTest_WithOddrns() {
        final var expectedParentOddrn = RandomStringUtils.randomAlphabetic(5);
        final var expectedChildOddrn = RandomStringUtils.randomAlphabetic(5);
        final var expectedLineage = new LineagePojo()
            .setParentOddrn(expectedParentOddrn)
            .setChildOddrn(expectedChildOddrn)
            .setEstablisherOddrn(RandomStringUtils.randomAlphabetic(5));
        final var excludedLineage = EASY_RANDOM.nextObject(LineagePojo.class);
        lineageRepository.bulkCreate(List.of(expectedLineage, excludedLineage)).blockLast();
        lineageRepository.getLineageRelations(List.of(expectedChildOddrn, expectedParentOddrn))
            .as(StepVerifier::create)
            .assertNext(r -> assertThat(r)
                .usingRecursiveComparison()
                .ignoringFields("establisherOddrn")
                .isEqualTo(expectedLineage))
            .verifyComplete();
    }

    @Test
    void getLineageRelationsTest_WithRoots() {
        final var firstRootOddrn = "firstRootOddrn";
        final var secondRootOddrn = "secondRootOddrn";
        final var firstRootFirstChildOddrn = "firstRootFirstChildOddrn";
        final var firstRootSecondChildOddrn = "firstRootSecondChildOddrn";
        final var firstRootFirstChildFirstChildOddrn = "firstRootFirstChildFirstChildOddrn";
        final var firstRootFirstChildSecondChildOddrn = "firstRootFirstChildSecondChildOddrn";
        final var firstRootFirstChildFirstChildFirstChildOddrn = "firstRootFirstChildFirstChildFirstChildOddrn";
        final var secondRootFirstChildOddrn = "secondRootFirstChildOddrn";

        final var firstRootFirstChildLineage =
            new LineagePojo(firstRootOddrn, firstRootFirstChildOddrn, RandomStringUtils.randomAlphabetic(5));
        final var firstRootSecondChildLineage =
            new LineagePojo(firstRootOddrn, firstRootSecondChildOddrn, RandomStringUtils.randomAlphabetic(5));
        final var firstRootFirstChildFirstChildLineage =
            new LineagePojo(firstRootFirstChildOddrn, firstRootFirstChildFirstChildOddrn,
                RandomStringUtils.randomAlphabetic(5));
        final var firstRootFirstChildSecondChildLineage =
            new LineagePojo(firstRootFirstChildOddrn, firstRootFirstChildSecondChildOddrn,
                RandomStringUtils.randomAlphabetic(5));
        final var firstRootFirstChildFirstChildFirstChildLineage =
            new LineagePojo(firstRootFirstChildFirstChildOddrn, firstRootFirstChildFirstChildFirstChildOddrn,
                RandomStringUtils.randomAlphabetic(5));
        final var secondRootFirstChildLineage =
            new LineagePojo(secondRootOddrn, secondRootFirstChildOddrn, RandomStringUtils.randomAlphabetic(5));
        final var randomLineage = generateLineageWithParent(RandomStringUtils.randomAlphabetic(5));

        lineageRepository.bulkCreate(
            List.of(firstRootFirstChildLineage, firstRootSecondChildLineage, firstRootFirstChildFirstChildLineage,
                firstRootFirstChildSecondChildLineage, firstRootFirstChildFirstChildFirstChildLineage,
                secondRootFirstChildLineage, randomLineage)).blockLast();

        final var expectedDownstreamWithDepth3 = Stream.of(
                firstRootFirstChildLineage,
                firstRootSecondChildLineage,
                firstRootFirstChildFirstChildLineage,
                firstRootFirstChildSecondChildLineage,
                firstRootFirstChildFirstChildFirstChildLineage,
                secondRootFirstChildLineage)
            .map(l -> new LineagePojo(l.getParentOddrn(), l.getChildOddrn(), null))
            .collect(Collectors.toSet());

        final var expectedDownstreamWithDepth2 = Stream.of(
                firstRootFirstChildLineage,
                firstRootSecondChildLineage,
                firstRootFirstChildFirstChildLineage,
                firstRootFirstChildSecondChildLineage,
                secondRootFirstChildLineage)
            .map(l -> new LineagePojo(l.getParentOddrn(), l.getChildOddrn(), null))
            .collect(Collectors.toSet());

        final var expectedDownstreamWithDepth1 = Stream.of(
                firstRootFirstChildLineage,
                firstRootSecondChildLineage,
                secondRootFirstChildLineage)
            .map(l -> new LineagePojo(l.getParentOddrn(), l.getChildOddrn(), null))
            .collect(Collectors.toSet());

        final var expectedUpstreamWithDepth3 = Stream.of(
                firstRootFirstChildFirstChildFirstChildLineage,
                firstRootFirstChildFirstChildLineage,
                firstRootFirstChildLineage
            ).map(l -> new LineagePojo(l.getParentOddrn(), l.getChildOddrn(), null))
            .collect(Collectors.toSet());

        final var expectedUpstreamWithDepth2 = Stream.of(
                firstRootFirstChildFirstChildFirstChildLineage,
                firstRootFirstChildFirstChildLineage
            ).map(l -> new LineagePojo(l.getParentOddrn(), l.getChildOddrn(), null))
            .collect(Collectors.toSet());

        final var expectedUpstreamWithDepth1 = Stream.of(
                firstRootFirstChildFirstChildFirstChildLineage)
            .map(l -> new LineagePojo(l.getParentOddrn(), l.getChildOddrn(), null))
            .collect(Collectors.toSet());

        lineageRepository.getLineageRelations(Set.of(firstRootOddrn, secondRootOddrn),
                LineageDepth.of(3),
                LineageStreamKind.DOWNSTREAM)
            .as(StepVerifier::create)
            .recordWith(HashSet::new)
            .thenConsumeWhile(r -> true)
            .expectRecordedMatches(lineages -> lineages.equals(expectedDownstreamWithDepth3))
            .verifyComplete();

        lineageRepository.getLineageRelations(Set.of(firstRootOddrn, secondRootOddrn),
                LineageDepth.of(2),
                LineageStreamKind.DOWNSTREAM)
            .as(StepVerifier::create)
            .recordWith(HashSet::new)
            .thenConsumeWhile(r -> true)
            .expectRecordedMatches(lineages -> lineages.equals(expectedDownstreamWithDepth2))
            .verifyComplete();

        lineageRepository.getLineageRelations(Set.of(firstRootOddrn, secondRootOddrn),
                LineageDepth.of(1),
                LineageStreamKind.DOWNSTREAM)
            .as(StepVerifier::create)
            .recordWith(HashSet::new)
            .thenConsumeWhile(r -> true)
            .expectRecordedMatches(lineages -> lineages.equals(expectedDownstreamWithDepth1))
            .verifyComplete();

        lineageRepository.getLineageRelations(Set.of(firstRootOddrn, secondRootOddrn),
                LineageDepth.of(1),
                LineageStreamKind.UPSTREAM)
            .as(StepVerifier::create)
            .recordWith(HashSet::new)
            .thenConsumeWhile(r -> true)
            .expectRecordedMatches(Collection::isEmpty)
            .verifyComplete();

        lineageRepository.getLineageRelations(Set.of(firstRootFirstChildFirstChildFirstChildOddrn),
                LineageDepth.of(3),
                LineageStreamKind.UPSTREAM)
            .as(StepVerifier::create)
            .recordWith(HashSet::new)
            .thenConsumeWhile(r -> true)
            .expectRecordedMatches(lineages -> lineages.equals(expectedUpstreamWithDepth3))
            .verifyComplete();

        lineageRepository.getLineageRelations(Set.of(firstRootFirstChildFirstChildFirstChildOddrn),
                LineageDepth.of(2),
                LineageStreamKind.UPSTREAM)
            .as(StepVerifier::create)
            .recordWith(HashSet::new)
            .thenConsumeWhile(r -> true)
            .expectRecordedMatches(lineages -> lineages.equals(expectedUpstreamWithDepth2))
            .verifyComplete();

        lineageRepository.getLineageRelations(Set.of(firstRootFirstChildFirstChildFirstChildOddrn),
                LineageDepth.of(1),
                LineageStreamKind.UPSTREAM)
            .as(StepVerifier::create)
            .recordWith(HashSet::new)
            .thenConsumeWhile(r -> true)
            .expectRecordedMatches(lineages -> lineages.equals(expectedUpstreamWithDepth1))
            .verifyComplete();
    }

    @Test
    void getChildrenCountTest() {
        final var firstParentOddrn = RandomStringUtils.randomAlphabetic(5);
        final var secondParentOddrn = RandomStringUtils.randomAlphabetic(5);
        final var expected = Map.of(firstParentOddrn, 2, secondParentOddrn, 1);

        lineageRepository.bulkCreate(List.of(generateLineageWithParent(firstParentOddrn),
            generateLineageWithParent(firstParentOddrn),
            generateLineageWithParent(secondParentOddrn))).blockLast();

        lineageRepository.getChildrenCount(Set.of(firstParentOddrn, secondParentOddrn))
            .as(StepVerifier::create)
            .assertNext(r -> assertThat(r).isEqualTo(expected))
            .verifyComplete();
    }

    @Test
    void getParentCountTest() {
        final var firstChildOddrn = RandomStringUtils.randomAlphabetic(5);
        final var secondChildOddrn = RandomStringUtils.randomAlphabetic(5);
        final var expected = Map.of(firstChildOddrn, 2, secondChildOddrn, 1);
        lineageRepository.bulkCreate(List.of(generateLineageWithChild(firstChildOddrn),
            generateLineageWithChild(firstChildOddrn),
            generateLineageWithChild(secondChildOddrn))).blockLast();
        lineageRepository.getParentCount(Set.of(firstChildOddrn, secondChildOddrn))
            .as(StepVerifier::create)
            .assertNext(r -> assertThat(r).isEqualTo(expected))
            .verifyComplete();
    }

    private LineagePojo generateLineageWithParent(final String parentOddrn) {
        return new LineagePojo(parentOddrn,
            RandomStringUtils.randomAlphabetic(5),
            RandomStringUtils.randomAlphabetic(5));
    }

    private LineagePojo generateLineageWithChild(final String childOddrn) {
        return new LineagePojo(RandomStringUtils.randomAlphabetic(5),
            childOddrn,
            RandomStringUtils.randomAlphabetic(5));
    }
}