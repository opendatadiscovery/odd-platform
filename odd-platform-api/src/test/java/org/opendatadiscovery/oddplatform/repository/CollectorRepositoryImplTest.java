package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.opendatadiscovery.oddplatform.BaseIntegrationTest;
import org.opendatadiscovery.oddplatform.dto.CollectorDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.CollectorPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TokenPojo;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

public class CollectorRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private CollectorRepository collectorRepository;

    @Test
    public void createTest() {
        final CollectorPojo collectorPojo = createPojo();
        final NamespacePojo namespacePojo = createNamespacePojo();
        final TokenDto tokenDto = createTokenDto();
        final CollectorDto dto = new CollectorDto(collectorPojo, namespacePojo, tokenDto);
        final CollectorDto createdDto = collectorRepository.create(dto);

        assertThat(createdDto.collectorPojo()).isNotNull();
        assertThat(createdDto.collectorPojo().getId()).isNotNull();
        assertThat(createdDto.collectorPojo().getName()).isEqualTo(collectorPojo.getName());
        assertThat(createdDto.collectorPojo().getOddrn()).isNotNull();
        assertThat(createdDto.collectorPojo().getDescription()).isEqualTo(collectorPojo.getDescription());
        assertThat(createdDto.collectorPojo().getNamespaceId()).isEqualTo(createdDto.namespace().getId());
        assertThat(createdDto.collectorPojo().getTokenId()).isEqualTo(createdDto.tokenDto().tokenPojo().getId());
        assertThat(createdDto.collectorPojo().getIsDeleted()).isFalse();
        assertThat(createdDto.collectorPojo().getCreatedAt()).isNotNull();
        assertThat(createdDto.collectorPojo().getUpdatedAt()).isNotNull();
        assertThat(createdDto.namespace().getName()).isEqualTo(namespacePojo.getName());
        assertThat(createdDto.namespace().getIsDeleted()).isFalse();
        assertThat(createdDto.namespace().getCreatedAt()).isNotNull();
        assertThat(createdDto.namespace().getUpdatedAt()).isNotNull();
        assertThat(createdDto.tokenDto().showToken()).isTrue();
        assertThat(createdDto.tokenDto().tokenPojo().getValue()).isEqualTo(tokenDto.tokenPojo().getValue());
    }

    @Test
    public void getTest() {
        final CollectorPojo collectorPojo = createPojo();
        final NamespacePojo namespacePojo = createNamespacePojo();
        final TokenDto tokenDto = createTokenDto();
        final CollectorDto dto = new CollectorDto(collectorPojo, namespacePojo, tokenDto);
        final CollectorDto createdDto = collectorRepository.create(dto);

        final Optional<CollectorDto> dtoOptional = collectorRepository.get(createdDto.collectorPojo().getId());
        assertThat(dtoOptional).isPresent();

        final CollectorDto collectorDto = dtoOptional.get();
        assertThat(collectorDto.collectorPojo()).isEqualTo(createdDto.collectorPojo());
        assertThat(collectorDto.namespace()).isEqualTo(createdDto.namespace());
        assertThat(collectorDto.tokenDto().showToken()).isFalse();
        assertThat(collectorDto.tokenDto().tokenPojo().getValue()).isEqualTo(tokenDto.tokenPojo().getValue());
    }

    @Test
    public void updateTest() {
        final CollectorPojo collectorPojo = createPojo();
        final NamespacePojo namespacePojo = createNamespacePojo();
        final TokenDto tokenDto = createTokenDto();
        final CollectorDto dto = new CollectorDto(collectorPojo, namespacePojo, tokenDto);
        final CollectorDto createdDto = collectorRepository.create(dto);

        final NamespacePojo newNamespacePojo = createNamespacePojo();
        final CollectorPojo updatedPojo = createPojo(createdDto.collectorPojo().getId());

        final CollectorDto update = collectorRepository.update(
            new CollectorDto(updatedPojo, newNamespacePojo, new TokenDto(createdDto.tokenDto().tokenPojo())));

        assertThat(update.collectorPojo().getId()).isEqualTo(createdDto.collectorPojo().getId());
        assertThat(update.collectorPojo().getName()).isEqualTo(updatedPojo.getName());
        assertThat(update.collectorPojo().getOddrn()).isEqualTo(createdDto.collectorPojo().getOddrn());
        assertThat(update.collectorPojo().getDescription()).isEqualTo(updatedPojo.getDescription());
        assertThat(update.collectorPojo().getNamespaceId()).isNotEqualTo(createdDto.collectorPojo().getNamespaceId());
        assertThat(update.collectorPojo().getTokenId()).isEqualTo(createdDto.collectorPojo().getTokenId());
        assertThat(update.collectorPojo().getIsDeleted()).isFalse();
        assertThat(update.collectorPojo().getCreatedAt()).isEqualTo(createdDto.collectorPojo().getCreatedAt());
        assertThat(update.collectorPojo().getUpdatedAt()).isNotEqualTo(createdDto.collectorPojo().getUpdatedAt());

        assertThat(update.namespace().getId()).isNotEqualTo(createdDto.namespace().getId());
        assertThat(update.namespace().getName()).isEqualTo(newNamespacePojo.getName());
        assertThat(update.namespace().getIsDeleted()).isFalse();
        assertThat(update.namespace().getCreatedAt()).isNotNull();
        assertThat(update.namespace().getUpdatedAt()).isNotNull();

        assertThat(update.tokenDto().showToken()).isFalse();
        assertThat(update.tokenDto().tokenPojo()).isEqualTo(createdDto.tokenDto().tokenPojo());
    }

    @Test
    public void deleteTest() {
        final CollectorPojo collectorPojo = createPojo();
        final NamespacePojo namespacePojo = createNamespacePojo();
        final TokenDto tokenDto = createTokenDto();
        final CollectorDto dto = new CollectorDto(collectorPojo, namespacePojo, tokenDto);
        final CollectorDto createdDto = collectorRepository.create(dto);

        collectorRepository.delete(createdDto.collectorPojo().getId());
        final Optional<CollectorDto> dtoOptional = collectorRepository.get(createdDto.collectorPojo().getId());
        assertThat(dtoOptional).isEmpty();
    }

    private CollectorPojo createPojo() {
        return createPojo(null);
    }

    private CollectorPojo createPojo(final Long id) {
        return new CollectorPojo()
            .setId(id)
            .setName(UUID.randomUUID().toString())
            .setDescription(UUID.randomUUID().toString());
    }

    private NamespacePojo createNamespacePojo() {
        return new NamespacePojo()
            .setName(UUID.randomUUID().toString());
    }

    private TokenDto createTokenDto() {
        final TokenPojo tokenPojo = new TokenPojo()
            .setValue(UUID.randomUUID().toString());
        return new TokenDto(tokenPojo, false);
    }
}
