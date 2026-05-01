package org.nexasphere.service;
import org.nexasphere.model.Event;
import org.nexasphere.repository.EventRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
@Service
public class EventService { private final EventRepository repo; public EventService(EventRepository r){this.repo=r;}
  public List<Event> all(){ var l=repo.findAll(); l.sort((a,b)->b.createdAt.compareTo(a.createdAt)); return l; }
  public Event save(Event e){ if(e.id==null||e.id.isBlank()) e.id=e.name.toLowerCase().replaceAll("[^a-z0-9]+","-").replaceAll("^-|-$",""); if(repo.existsById(e.id)) e.id=e.id+"-"+System.currentTimeMillis(); if(e.createdAt==null) e.createdAt=LocalDateTime.now(); e.updatedAt=LocalDateTime.now(); if(e.icon==null) e.icon="📌"; return repo.save(e);} public void del(String id){repo.deleteById(id);} }
