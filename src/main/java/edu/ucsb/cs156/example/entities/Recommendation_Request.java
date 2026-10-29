package edu.ucsb.cs156.example.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** This is a JPA entity that represents a Recommendation Request */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "recommendation_request")
public class Recommendation_Request {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  String requesterEmail;
  String professorEmail;
  String explanation;
  LocalDateTime dateRequested;
  LocalDateTime dateNeeded;
  boolean done;
}
