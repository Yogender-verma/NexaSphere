package org.nexasphere.repository;
import org.nexasphere.model.ActivityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ActivityEventRepository extends JpaRepository<ActivityEvent,String>{ List<ActivityEvent> findByActivityKey(String activityKey); }
