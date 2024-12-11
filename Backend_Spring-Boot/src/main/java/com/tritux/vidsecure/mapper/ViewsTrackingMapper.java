package com.tritux.vidsecure.mapper;
import com.tritux.vidsecure.dto.ViewsTrackingDTO;
import com.tritux.vidsecure.model.ViewsTracking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ViewsTrackingMapper extends EntityMapper<ViewsTrackingDTO, ViewsTracking> {
    @Override
    @Mapping(target = "id")
    ViewsTrackingDTO toDto(ViewsTracking entity);

    @Override
    @Mapping(target = "id")
    ViewsTracking toEntity(ViewsTrackingDTO dto);
}
