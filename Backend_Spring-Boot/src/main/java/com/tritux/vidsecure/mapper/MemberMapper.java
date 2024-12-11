package com.tritux.vidsecure.mapper;

import com.tritux.vidsecure.dto.MemberDTO;
import com.tritux.vidsecure.model.Member;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface MemberMapper extends EntityMapper<MemberDTO, Member>{
    @Override
    @Mapping(target = "id")
    MemberDTO toDto(Member entity);

    @Override
    @Mapping(target = "id")
    Member toEntity(MemberDTO dto);
}
