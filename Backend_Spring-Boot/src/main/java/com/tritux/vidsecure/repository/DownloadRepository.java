package com.tritux.vidsecure.repository;
import com.tritux.vidsecure.model.Download;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface DownloadRepository extends JpaRepository<Download, Long> {
    @Query("SELECT d FROM Download d " +
            "WHERE d.userId IN (SELECT m.uid FROM Member m) " +
            "AND d.videoId IN (SELECT v.reference FROM Video v) " +
            "AND (d.deletedForAdmin IS NULL OR d.deletedForAdmin = FALSE) " +
            "AND (d.deletedForUser IS NULL OR d.deletedForUser = FALSE)")
    Page<Download> findAllByAdmin(Pageable pageable);

    @Query("SELECT d FROM Download d " +
            "WHERE d.userId = :userId " +
            "AND d.videoId IN (SELECT v.reference FROM Video v) " +
            "AND (d.deletedForUser IS NULL OR d.deletedForUser = FALSE)")
    Page<Download> findAllByUserId(@Param("userId") String userId, Pageable pageable);


    boolean existsByVideoIdAndUserId(String videoId, String userId);

    @Query("SELECT COUNT(d) FROM Download d " +
            "WHERE d.userId = :userId " +
            "AND d.videoId IN (SELECT v.reference FROM Video v) " +
            "AND (d.deletedForUser IS NULL OR d.deletedForUser = FALSE)")
    long countDownloadsWithExistingVideos(@Param("userId") String userId);



    @Modifying
    @Transactional
    @Query("DELETE FROM Download d WHERE d.userId = :userId")
    void deleteAllByUserId(@Param("userId") String userId);


    @Modifying
    @Transactional
    @Query("UPDATE Download d SET d.deletedForAdmin = TRUE WHERE d.id IN :ids")
    void markDeletedForAdminByIds(@Param("ids") List<Long> ids);
}
