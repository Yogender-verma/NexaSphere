package org.nexasphere.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
public class CoreTeamMember {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
  public String name, role, year, branch, section, email, whatsapp, linkedin, instagram, photoUrl;
  public LocalDateTime createdAt;
}
