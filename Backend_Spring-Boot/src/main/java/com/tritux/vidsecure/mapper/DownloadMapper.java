package com.tritux.vidsecure.mapper;

import com.tritux.vidsecure.dto.DownloadDTO;
import com.tritux.vidsecure.model.Download;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DownloadMapper extends EntityMapper<DownloadDTO, Download> {
    @Override
    @Mapping(target = "id")
    DownloadDTO toDto(Download entity);

    @Override
    @Mapping(target = "id")
    Download toEntity(DownloadDTO dto);
}
