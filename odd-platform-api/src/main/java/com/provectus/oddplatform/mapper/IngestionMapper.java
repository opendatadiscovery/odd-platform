package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.DataEntityType;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntitySubtypePojo;
import com.provectus.oddplatform.model.tables.pojos.DataEntityTypePojo;
import com.provectus.oddplatform.repository.DataEntityTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.JSONB;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class IngestionMapper {
    // TODO: filth
    private final DataEntityTypeRepository dataEntityTypeRepository;

    public DataEntityPojo dtoToPojo(final DataEntityIngestionDto dto) {
        final OffsetDateTime createdAt = dto.getCreatedAt();
        final OffsetDateTime updatedAt = dto.getUpdatedAt();

        final DataEntitySubtypePojo subtype = dataEntityTypeRepository.findSubtypeByName(dto.getSubType().toString());

        return new DataEntityPojo()
            .setId(dto.getId())
            .setExternalName(dto.getName())
            .setExternalDescription(dto.getExternalDescription())
            .setOddrn(dto.getOddrn().toLowerCase())
            .setDataSourceId(dto.getDataSourceId())
            .setCreatedAt(createdAt != null ? createdAt.toLocalDateTime() : null)
            .setUpdatedAt(updatedAt != null ? updatedAt.toLocalDateTime() : null)
            .setSubtypeId(subtype.getId())
            .setHollow(false)
            .setSpecificAttributes(JSONB.jsonb(dto.getSpecificAttributes()));
    }

    public List<DataEntityPojo> dtoToPojo(final List<DataEntityIngestionDto> dtos) {
        return dtos.stream().map(this::dtoToPojo).collect(Collectors.toList());
    }

    public DataEntityDto ingestDtoToDto(final DataEntityIngestionDto ingestionDto) {
        final Set<DataEntityTypePojo> types = ingestionDto.getTypes().stream()
            .map(DataEntityType::toString)
            .map(dataEntityTypeRepository::findTypeByName)
            .collect(Collectors.toSet());

        return DataEntityDto.builder()
            .dataEntity(dtoToPojo(ingestionDto))
            .subtype(dataEntityTypeRepository.findSubtypeByName(ingestionDto.getSubType().toString()))
            .types(types)
            .build();
    }

    public List<DataEntityDto> ingestDtoToDto(final List<DataEntityIngestionDto> ingestionDtos) {
        return ingestionDtos.stream().map(this::ingestDtoToDto).collect(Collectors.toList());
    }
}
