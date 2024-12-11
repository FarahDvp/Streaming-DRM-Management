package com.tritux.vidsecure.repository;

import com.tritux.vidsecure.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    Optional<Video> findByReference(String reference);
    Video getVideoById(Long id);
}