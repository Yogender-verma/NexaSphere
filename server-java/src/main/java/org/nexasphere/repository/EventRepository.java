package org.nexasphere.repository;
import org.nexasphere.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EventRepository extends JpaRepository<Event,String>{}
