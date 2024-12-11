package com.tritux.vidsecure.mapper;
import com.tritux.vidsecure.dto.VideoDTO;
import com.tritux.vidsecure.model.Video;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VideoMapper extends EntityMapper<VideoDTO, Video> {

    @Override
    @Mapping(target = "id")
    VideoDTO toDto(Video entity);

    @Override
    @Mapping(target = "id")
    Video toEntity(VideoDTO dto);

}
