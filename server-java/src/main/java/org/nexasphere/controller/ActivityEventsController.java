package org.nexasphere.controller;
import org.nexasphere.model.ActivityEvent;
import org.nexasphere.repository.ActivityEventRepository;
import org.nexasphere.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
@RestController
public class ActivityEventsController { private final ActivityEventRepository repo; private final AuthService auth; public ActivityEventsController(ActivityEventRepository r,AuthService a){repo=r;auth=a;}
  @GetMapping("/api/content/activity-events/{activityKey}") List<ActivityEvent> pub(@PathVariable String activityKey){ return repo.findByActivityKey(activityKey); }
  @PostMapping("/api/admin/activity-events/{activityKey}") ResponseEntity<?> create(@RequestHeader("Authorization") String h,@PathVariable String activityKey,@RequestBody ActivityEvent e){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); e.id="manual-"+System.currentTimeMillis(); e.activityKey=activityKey; e.createdAt=LocalDateTime.now(); return ResponseEntity.ok(repo.save(e)); }
  @DeleteMapping("/api/admin/activity-events/{activityKey}/{eventId}") ResponseEntity<?> del(@RequestHeader("Authorization") String h,@PathVariable String eventId){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); repo.deleteById(eventId); return ResponseEntity.ok(Map.of("ok",true)); }
}
