package org.nexasphere.controller;
import org.nexasphere.model.Event;
import org.nexasphere.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
public class EventsController { private final EventService svc; private final AuthService auth; public EventsController(EventService s,AuthService a){svc=s;auth=a;}
  @GetMapping("/api/content/events") public List<Event> pub(){ return svc.all(); }
  @GetMapping("/api/admin/events") public ResponseEntity<?> list(@RequestHeader("Authorization") String h){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); return ResponseEntity.ok(svc.all()); }
  @PostMapping("/api/admin/events") public ResponseEntity<?> create(@RequestHeader("Authorization") String h,@RequestBody Event e){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); return ResponseEntity.ok(svc.save(e)); }
  @PutMapping("/api/admin/events/{id}") public ResponseEntity<?> upd(@RequestHeader("Authorization") String h,@PathVariable String id,@RequestBody Event e){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); e.id=id; return ResponseEntity.ok(svc.save(e)); }
  @DeleteMapping("/api/admin/events/{id}") public ResponseEntity<?> del(@RequestHeader("Authorization") String h,@PathVariable String id){ if(!auth.valid(h.replace("Bearer ",""))) return ResponseEntity.status(401).build(); svc.del(id); return ResponseEntity.ok(Map.of("ok",true)); }
}
