package org.nexasphere.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
@Service
public class AuthService {
  @Value("${ADMIN_EMAIL}") private String email;
  @Value("${ADMIN_PASSWORD}") private String password;
  private final Map<String, Instant> sessions = new ConcurrentHashMap<>();
  private final SecureRandom random = new SecureRandom();
  public String login(String e,String p){ if(!email.equals(e)||!password.equals(p)) return null; byte[] b=new byte[24]; random.nextBytes(b); String t=HexFormat.of().formatHex(b); sessions.put(t, Instant.now().plus(Duration.ofHours(8))); return t; }
  public boolean valid(String t){ var exp=sessions.get(t); if(exp==null||Instant.now().isAfter(exp)){sessions.remove(t); return false;} return true; }
  public void logout(String t){ sessions.remove(t);} public String adminEmail(){return email;}
}
