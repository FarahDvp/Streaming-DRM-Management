package com.tritux.vidsecure.controller;
import com.tritux.vidsecure.dto.MemberDTO;
import com.tritux.vidsecure.service.AuthenticationService;
import com.tritux.vidsecure.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;


@RestController
@RequestMapping("/api/members")
public class MemberController {
    @Autowired
    private MemberService memberService;
    @Autowired
    private AuthenticationService authenticationService;

    @GetMapping("/all")
    public ResponseEntity<Page<MemberDTO>> getAllMembers(@RequestParam(name = "page", defaultValue = "0") int page,
                                                         @RequestParam(name = "size", defaultValue = "10") int size) {
        Page<MemberDTO> memberPage = memberService.getMembersPageable(page, size);
        return ResponseEntity.ok().body(memberPage);
    }

    @GetMapping("/blocked")
    public ResponseEntity<Page<MemberDTO>> getBlockedMembersPageable(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<MemberDTO> blockedMembersPage = memberService.getBlockedMembersPageable(page, size);
        return ResponseEntity.ok(blockedMembersPage);
    }

    @GetMapping("/active")
    public ResponseEntity<Page<MemberDTO>> getActiveMembersPageable(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<MemberDTO> activeMembersPage = memberService.getActiveMembersPageable(page, size);
        return ResponseEntity.ok(activeMembersPage);
    }


    @PostMapping("/save")
    public ResponseEntity<MemberDTO> create(@RequestBody MemberDTO memberDTO) {
        MemberDTO member = memberService.save(memberDTO);
        return ResponseEntity.ok().body(member);
    }

    @GetMapping("/one/id/{username}")
    public ResponseEntity<MemberDTO> getMemberByUsername(@PathVariable("username") String username) {
        try {
            MemberDTO memberDTO = memberService.getOne(username);
            return ResponseEntity.ok().body(memberDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/one/{id}")
    public ResponseEntity<MemberDTO> getMemberById(@PathVariable("id") Long id) {
        try {
            MemberDTO memberDTO = memberService.getOneById(id);
            return ResponseEntity.ok().body(memberDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/get_one/{uid}")
    public ResponseEntity<MemberDTO> getMemberByUid(@PathVariable("uid") String uid) {
        try {
            MemberDTO memberDTO = memberService.getOneByUid(uid);
            return ResponseEntity.ok().body(memberDTO);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update/{uid}")
    public ResponseEntity<MemberDTO> update(@PathVariable("uid") String uid, @RequestBody MemberDTO memberDTO) {
        MemberDTO updatedMember = memberService.update(uid, memberDTO);
        if (updatedMember != null) {
            return ResponseEntity.ok().body(updatedMember);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{uid}/block")
    public ResponseEntity<Void> blockUser(@PathVariable String uid) {
        memberService.blockUser(uid);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{uid}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable String uid) {
        memberService.unblockUser(uid);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete_one/{id}")
    public ResponseEntity<Void> deleteMemberById(@PathVariable("id") Long id) {
        memberService.deleteMemberById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/{uid}")
    public ResponseEntity<Void> deleteMemberByUid(@PathVariable("uid") String uid) {
        memberService.deleteMemberByUid(uid);
        return ResponseEntity.noContent().build();
    }


}
