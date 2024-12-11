package com.tritux.vidsecure.repository;

import com.tritux.vidsecure.model.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByUsername(String username);
    Optional<Member> findByUid(String uid);
    Page<Member> findByBlocked(Boolean blocked, Pageable pageable);
}
