package org.nexasphere.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
@Entity
public class Event {
  @Id public String id;
  public String name, shortName, date, description, status, icon;
  @ElementCollection public List<String> tags = new ArrayList<>();
  public LocalDateTime createdAt; public LocalDateTime updatedAt;
}
