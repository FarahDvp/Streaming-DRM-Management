package com.tritux.vidsecure.service;

import com.tritux.vidsecure.dto.MemberDTO;
import org.springframework.data.domain.Page;

public interface MemberService {
    MemberDTO save(MemberDTO memberDTO);
    MemberDTO update(String uid, MemberDTO memberDTO);
    Page<MemberDTO> getMembersPageable(int page, int size);
    Page<MemberDTO> getBlockedMembersPageable(int page, int size);
    Page<MemberDTO> getActiveMembersPageable(int page, int size);
    MemberDTO getOneByUid(String uid);
    MemberDTO getOne(String username);
    MemberDTO getOneById(Long id);
    void deleteMemberByUid(String uid);
    void deleteMemberById(Long id);
    void blockUser(String uid);
    void unblockUser(String uid);

}
