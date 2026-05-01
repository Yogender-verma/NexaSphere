package org.nexasphere.controller;
import org.nexasphere.service.AuthService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/admin")
public class AdminAuthController { private final AuthService auth; public AdminAuthController(AuthService a){this.auth=a;}
  @PostMapping("/login") public ResponseEntity<?> login(@RequestBody Map<String,String> body){ var t=auth.login(body.get("email"),body.get("password")); if(t==null) return ResponseEntity.status(401).body(Map.of("error","Invalid credentials")); return ResponseEntity.ok(Map.of("token",t,"email",auth.adminEmail())); }
  @PostMapping("/logout") public Map<String,Boolean> logout(@RequestHeader("Authorization") String h){ auth.logout(h.replace("Bearer ","")); return Map.of("ok",true);} 
  @GetMapping("/me") public ResponseEntity<?> me(@RequestHeader("Authorization") String h){ return auth.valid(h.replace("Bearer ",""))?ResponseEntity.ok(Map.of("email",auth.adminEmail())):ResponseEntity.status(401).body(Map.of("error","Unauthorized")); }
}
