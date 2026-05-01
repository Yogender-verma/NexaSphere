package org.nexasphere.controller;
import org.nexasphere.model.CoreTeamMember;
import org.nexasphere.repository.CoreTeamMemberRepository;
import org.nexasphere.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
@RestController
public class CoreTeamController { private final CoreTeamMemberRepository repo; private final AuthService auth; public CoreTeamController(CoreTeamMemberRepository r,AuthService a){repo=r;auth=a;}
  @GetMapping("/api/content/core-team") List<CoreTeamMember> pub(){ return repo.findAll(); }
  @GetMapping("/api/admin/core-team") ResponseEntity<?> all(@RequestHeader("Authorization") String h){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); return ResponseEntity.ok(repo.findAll());}
  @PostMapping("/api/admin/core-team") ResponseEntity<?> add(@RequestHeader("Authorization") String h,@RequestBody CoreTeamMember m){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); m.createdAt=LocalDateTime.now(); return ResponseEntity.ok(repo.save(m));}
  @DeleteMapping("/api/admin/core-team/{id}") ResponseEntity<?> del(@RequestHeader("Authorization") String h,@PathVariable Long id){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); repo.deleteById(id); return ResponseEntity.ok(Map.of("ok",true));}
}
