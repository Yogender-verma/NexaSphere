package org.nexasphere.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
public class ActivityEvent {
  @Id public String id;
  public String activityKey,name,date,tagline,description,status;
  public LocalDateTime createdAt;
}
