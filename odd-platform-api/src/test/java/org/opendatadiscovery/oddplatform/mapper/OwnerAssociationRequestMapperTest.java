package org.opendatadiscovery.oddplatform.mapper;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.opendatadiscovery.oddplatform.api.contract.model.AssociatedOwner;
import org.opendatadiscovery.oddplatform.api.contract.model.Identity;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequest;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerAssociationRequestStatus;
import org.opendatadiscovery.oddplatform.dto.AssociatedOwnerDto;
import org.opendatadiscovery.oddplatform.dto.OwnerAssociationRequestDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerAssociationRequestPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class OwnerAssociationRequestMapperTest {
    private OwnerAssociationRequestMapper mapper;
    @Mock
    private OffsetDateTimeMapper offsetDateTimeMapper;
    @Mock
    private AssociatedOwnerMapper associatedOwnerMapper;

    @BeforeEach
    public void before() {
        mapper = new OwnerAssociationRequestMapperImpl(offsetDateTimeMapper, associatedOwnerMapper);
    }

    @Test
    public void mapToPojo() {
        final String username = UUID.randomUUID().toString();
        final Long ownerId = 1L;
        final OwnerAssociationRequestPojo pojo = mapper.mapToPojo(username, ownerId);
        assertThat(pojo.getId()).isNull();
        assertThat(pojo.getOwnerId()).isEqualTo(ownerId);
        assertThat(pojo.getStatus()).isEqualTo(OwnerAssociationRequestStatus.PENDING.getValue());
        assertThat(pojo.getCreatedAt()).isNull();
        assertThat(pojo.getUsername()).isEqualTo(username);
        assertThat(pojo.getStatusUpdatedAt()).isNull();
        assertThat(pojo.getStatusUpdatedBy()).isNull();
    }

    @Test
    public void applyToPojo() {
        final OwnerAssociationRequestPojo initialPojo = createPendingPojo();
        final String updatedUsername = UUID.randomUUID().toString();
        final LocalDateTime updatedDatetime = LocalDateTime.now();
        final OwnerAssociationRequestPojo updatedPojo =
            mapper.applyToPojo(initialPojo, OwnerAssociationRequestStatus.APPROVED, updatedUsername, updatedDatetime);
        assertThat(updatedPojo.getId()).isEqualTo(initialPojo.getId());
        assertThat(updatedPojo.getOwnerId()).isEqualTo(initialPojo.getOwnerId());
        assertThat(updatedPojo.getStatus()).isEqualTo(OwnerAssociationRequestStatus.APPROVED.getValue());
        assertThat(updatedPojo.getCreatedAt()).isEqualTo(initialPojo.getCreatedAt());
        assertThat(updatedPojo.getUsername()).isEqualTo(initialPojo.getUsername());
        assertThat(updatedPojo.getStatusUpdatedAt()).isEqualTo(updatedDatetime);
        assertThat(updatedPojo.getStatusUpdatedBy()).isEqualTo(updatedUsername);
    }

    @Test
    public void mapToPendingOwnerAssociationRequest() {
        final OwnerAssociationRequestPojo pojo = createPendingPojo();
        final String ownerName = UUID.randomUUID().toString();
        final OwnerAssociationRequestDto dto = new OwnerAssociationRequestDto(pojo, ownerName, null);

        when(associatedOwnerMapper.mapAssociatedOwner(null)).thenReturn(null);
        when(offsetDateTimeMapper.map(null)).thenReturn(null);
        final OwnerAssociationRequest request = mapper.mapToOwnerAssociationRequest(dto);
        assertThat(request.getId()).isEqualTo(pojo.getId());
        assertThat(request.getUsername()).isEqualTo(pojo.getUsername());
        assertThat(request.getOwnerName()).isEqualTo(ownerName);
        assertThat(request.getStatus()).isEqualTo(OwnerAssociationRequestStatus.PENDING);
        assertThat(request.getStatusUpdatedBy()).isNull();
        assertThat(request.getStatusUpdatedAt()).isNull();
    }

    @Test
    public void mapToApprovedOwnerAssociationRequest() {
        final OwnerAssociationRequestPojo pojo = createApprovedPojo();
        final String ownerName = UUID.randomUUID().toString();
        final String updatedUserOwnerName = UUID.randomUUID().toString();
        final OffsetDateTime offsetDateTime = pojo.getStatusUpdatedAt().atOffset(ZoneOffset.UTC);
        final AssociatedOwnerDto ownerDto = new AssociatedOwnerDto(pojo.getUsername(),
            new OwnerPojo().setName(updatedUserOwnerName), Set.of(), null);
        final OwnerAssociationRequestDto dto = new OwnerAssociationRequestDto(pojo, ownerName, ownerDto);

        final AssociatedOwner identity = new AssociatedOwner()
            .identity(new Identity().username(pojo.getUsername()))
            .owner(new Owner().name(updatedUserOwnerName));
        when(associatedOwnerMapper.mapAssociatedOwner(ownerDto)).thenReturn(identity);
        when(offsetDateTimeMapper.map(pojo.getStatusUpdatedAt())).thenReturn(offsetDateTime);
        final OwnerAssociationRequest request = mapper.mapToOwnerAssociationRequest(dto);
        assertThat(request.getId()).isEqualTo(pojo.getId());
        assertThat(request.getUsername()).isEqualTo(pojo.getUsername());
        assertThat(request.getOwnerName()).isEqualTo(ownerName);
        assertThat(request.getStatus()).isEqualTo(OwnerAssociationRequestStatus.APPROVED);
        assertThat(request.getStatusUpdatedBy()).isEqualTo(identity);
        assertThat(request.getStatusUpdatedAt()).isEqualTo(offsetDateTime);
    }

    private OwnerAssociationRequestPojo createPendingPojo() {
        return new OwnerAssociationRequestPojo()
            .setId(1L)
            .setUsername(UUID.randomUUID().toString())
            .setOwnerId(1L)
            .setStatus(OwnerAssociationRequestStatus.PENDING.getValue())
            .setCreatedAt(LocalDateTime.now());
    }

    private OwnerAssociationRequestPojo createApprovedPojo() {
        return new OwnerAssociationRequestPojo()
            .setId(1L)
            .setUsername(UUID.randomUUID().toString())
            .setOwnerId(1L)
            .setStatus(OwnerAssociationRequestStatus.APPROVED.getValue())
            .setStatusUpdatedAt(LocalDateTime.now())
            .setStatusUpdatedBy(UUID.randomUUID().toString())
            .setCreatedAt(LocalDateTime.now());
    }
}
