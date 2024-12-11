package com.tritux.vidsecure.repository;
import com.tritux.vidsecure.model.Download;
import com.tritux.vidsecure.model.ViewsTracking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ViewsTrackingRepository extends JpaRepository<ViewsTracking, Long> {
    @Query("SELECT vt FROM ViewsTracking vt " +
            "WHERE vt.userId IN (SELECT m.uid FROM Member m) " +
            "AND vt.videoId IN (SELECT v.reference FROM Video v) " +
            "AND (vt.deletedForAdmin IS NULL OR vt.deletedForAdmin = FALSE) " +
            "AND (vt.deletedForUser IS NULL OR vt.deletedForUser = TRUE OR vt.deletedForUser = FALSE)")
    Page<ViewsTracking> findAllByAdmin(Pageable pageable);


    @Query("SELECT vt FROM ViewsTracking vt " +
            "WHERE vt.userId = :userId " +
            "AND vt.videoId IN (SELECT v.reference FROM Video v) " +
            "AND (vt.deletedForUser IS NULL OR vt.deletedForUser = FALSE)")
    Page<ViewsTracking> findAllByUserId(@Param("userId") String userId, Pageable pageable);



    boolean existsByVideoIdAndUserId(String videoId, String viewsTracking);
    Optional<ViewsTracking> findByVideoIdAndUserId(String videoId, String userId);
    long countByVideoId(String videoId);

    List<ViewsTracking> findByUserIdAndDateBetween(String userId, LocalDateTime start, LocalDateTime end);

    @Modifying
    @Transactional
    @Query("UPDATE ViewsTracking vt SET vt.deletedForAdmin = TRUE WHERE vt.id IN :ids")
    void markDeletedForAdminByIds(@Param("ids") List<Long> ids);

    @Modifying
    @Transactional
    @Query("UPDATE ViewsTracking vt SET vt.deletedForUser = TRUE WHERE vt.id IN :ids")
    void markDeletedForUserByIds(@Param("ids") List<Long> ids);
}
