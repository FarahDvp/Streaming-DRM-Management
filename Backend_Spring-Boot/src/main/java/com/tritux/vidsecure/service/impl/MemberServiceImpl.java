package com.tritux.vidsecure.service.impl;

import com.tritux.vidsecure.dto.MemberDTO;
import com.tritux.vidsecure.exception.EntityNotFoundException;
import com.tritux.vidsecure.mapper.MemberMapper;
import com.tritux.vidsecure.model.Member;
import com.tritux.vidsecure.model.Role;
import com.tritux.vidsecure.repository.MemberRepository;
import com.tritux.vidsecure.service.MemberService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class MemberServiceImpl implements MemberService {
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private MemberMapper memberMapper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Override
    public MemberDTO save(MemberDTO memberDTO) {
        String uid = UUID.randomUUID().toString();
        while (memberRepository.findByUid(uid).isPresent()) {
            uid = UUID.randomUUID().toString();
        }
        Member member = memberMapper.toEntity(memberDTO);
        member.setUid(uid);
        member.setCreationDate(LocalDateTime.now());
        member.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
        member.setBlocked(false);

        member = memberRepository.save(member);
        return memberMapper.toDto(member);
    }
    @Override
    public MemberDTO update(String uid, MemberDTO memberDTO) {
        Optional<Member> optionalMember = memberRepository.findByUid(uid);
        if (optionalMember.isPresent()) {
            Member existingMember = optionalMember.get();
            existingMember.setUsername(memberDTO.getUsername());
            existingMember.setEmail(memberDTO.getEmail());
            existingMember.setFullname(memberDTO.getFullname());
            existingMember.setPhone(memberDTO.getPhone());
            existingMember.setRole(memberDTO.getRole());
            Member updatedMember = memberRepository.save(existingMember);
            return memberMapper.toDto(updatedMember);
        } else {
            return null;
        }
    }
    @Override
    public Page<MemberDTO> getMembersPageable(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "creationDate"));
        Page<Member> memberPage = memberRepository.findAll(pr);

        return memberPage.map(memberMapper::toDto);
    }
    @Override
    public Page<MemberDTO> getBlockedMembersPageable(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "creationDate"));
        Page<Member> blockedMemberPage = memberRepository.findByBlocked(true,pr);

        return blockedMemberPage.map(memberMapper::toDto);
    }
    @Override
    public Page<MemberDTO> getActiveMembersPageable(int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "creationDate"));
        Page<Member> activeMemberPage = memberRepository.findByBlocked(false,pr);

        return activeMemberPage.map(memberMapper::toDto);
    }
    @Override
    public MemberDTO getOneByUid(String uid) {
        Optional<Member> optionalMember = memberRepository.findByUid(uid);
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            return memberMapper.toDto(member);
        } else {
            throw new NoSuchElementException("Member with ID " + uid + " not found");
        }
    }
    @Override
    public MemberDTO getOne(String username) {
        Optional<Member> optionalMember = memberRepository.findByUsername(username);
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            return memberMapper.toDto(member);
        } else {
            throw new NoSuchElementException("Member with ID " + username + " not found");
        }
    }
    @Override
    public MemberDTO getOneById(Long id) {
        Optional<Member> optionalMember = memberRepository.findById(id);
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            return memberMapper.toDto(member);
        } else {
            throw new NoSuchElementException("Member with ID " + id + " not found");
        }
    }
    @Override
    public void deleteMemberByUid(String uid) {
        Optional<Member> optionalMember = memberRepository.findByUid(uid);
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            memberRepository.delete(member);
        } else {
            throw new NoSuchElementException("User with uid " + uid + " not found");
        }
    }
    @Override
    public void deleteMemberById(Long id) {
        Optional<Member> optionalMember = memberRepository.findById(id);
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            memberRepository.delete(member);
        } else {
            throw new NoSuchElementException("User with Id " + id + " not found");
        }
    }
    @Override
    public void blockUser(String uid) {
        Optional<Member> optionalMember = memberRepository.findByUid(uid);
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            member.setBlocked(true);
            memberRepository.save(member);

            messagingTemplate.convertAndSend("/topic/user-blocked", member.getUsername());
        } else {
            throw new EntityNotFoundException("User with ID " + uid + " not found");
        }
    }
    @Override
    public void unblockUser(String uid) {
        Optional<Member> optionalMember = memberRepository.findByUid(uid);
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            member.setBlocked(false);
            memberRepository.save(member);
        } else {
            throw new EntityNotFoundException("User with ID " + uid + " not found");
        }
    }

}
