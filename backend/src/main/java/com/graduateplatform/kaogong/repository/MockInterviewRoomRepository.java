package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.MockInterviewRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface MockInterviewRoomRepository extends JpaRepository<MockInterviewRoom, Long>, JpaSpecificationExecutor<MockInterviewRoom> {
    List<MockInterviewRoom> findAllByOrderByScheduledAtAsc();
    Page<MockInterviewRoom> findAllByOrderByScheduledAtAsc(Pageable pageable);
    List<MockInterviewRoom> findByOwnerIdOrderByScheduledAtDesc(Long ownerId);
}
