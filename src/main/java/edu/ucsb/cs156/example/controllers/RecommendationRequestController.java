package edu.ucsb.cs156.example.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.example.entities.Recommendation_Request;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This is a REST controller for Recommendation Request */
@Tag(name = "RecommendationRequest")
@RequestMapping("/api/recommendationRequest")
@RestController
@Slf4j
public class RecommendationRequestController extends ApiController {

  @Autowired RecommendationRequestRepository recommendationRequestRepository;

  /**
   * List all Recommendation Requests
   *
   * @return an iterable of Recommendation Request
   */
  @Operation(summary = "List all Recommendation Requests")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<Recommendation_Request> allRecommendationRequests() {
    Iterable<Recommendation_Request> recommendationRequests =
        recommendationRequestRepository.findAll();
    return recommendationRequests;
  }

  /**
   * Create a new Recommendation Request
   *
   * @param requesterEmail requester's email
   * @param professorEmail professor's email
   * @param explanation explaination for request
   * @param dateRequested date requested for
   * @param dateNeeded date needed by
   * @param done is it done?
   * @return the saved recommendation request
   */
  @Operation(summary = "Create a new recommendation request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public Recommendation_Request postRecommendation_Request(
      @Parameter(name = "requesterEmail") @RequestParam String requesterEmail,
      @Parameter(name = "professorEmail") @RequestParam String professorEmail,
      @Parameter(name = "explanation") @RequestParam String explanation,
      @Parameter(
              name = "dateRequested",
              description =
                  "date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)")
          @RequestParam("dateRequested")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime dateRequested,
      @Parameter(
              name = "dateNeeded",
              description =
                  "date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)")
          @RequestParam("dateNeeded")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime dateNeeded,
      @Parameter(name = "done") @RequestParam boolean done)
      throws JsonProcessingException {

    // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    // See: https://www.baeldung.com/spring-date-parameters

    log.info("dateRequested={}", dateRequested);
    log.info("dataNeeded={}", dateNeeded);

    Recommendation_Request recommendation_Request = new Recommendation_Request();
    recommendation_Request.setRequesterEmail(requesterEmail);
    recommendation_Request.setProfessorEmail(professorEmail);
    recommendation_Request.setExplanation(explanation);
    recommendation_Request.setDateRequested(dateRequested);
    recommendation_Request.setDateNeeded(dateNeeded);
    recommendation_Request.setDone(done);

    Recommendation_Request savedRecommendation_Request =
        recommendationRequestRepository.save(recommendation_Request);

    return savedRecommendation_Request;
  }

  /**
   * Get a single request by id
   *
   * @param id the id of the request
   * @return a recommendation request
   */
  @Operation(summary = "Get a single recommendation request")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public Recommendation_Request getById(@Parameter(name = "id") @RequestParam Long id) {
    Recommendation_Request recommendation_Request =
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Recommendation_Request.class, id));

    return recommendation_Request;
  }

  /**
   * Update a single recommendation request
   *
   * @param id id of the recommendation request to update
   * @param incoming the new recommendaiton request
   * @return the updated recommendation request object
   */
  @Operation(summary = "Update a single recommendation request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public Recommendation_Request updateRecommendationRequest(
      @Parameter(name = "id") @RequestParam Long id,
      @RequestBody @Valid Recommendation_Request incoming) {

    Recommendation_Request recommendationRequest =
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Recommendation_Request.class, id));

    recommendationRequest.setRequesterEmail(incoming.getRequesterEmail());
    recommendationRequest.setProfessorEmail(incoming.getProfessorEmail());
    recommendationRequest.setExplanation(incoming.getExplanation());
    recommendationRequest.setDateRequested(incoming.getDateRequested());
    recommendationRequest.setDateNeeded(incoming.getDateNeeded());
    recommendationRequest.setDone(incoming.getDone());

    recommendationRequestRepository.save(recommendationRequest);

    return recommendationRequest;
  }

  /**
   * Delete a recommendation request
   *
   * @param id the id of the recommendation request to delete
   * @return a message indicating the request was deleted
   */
  @Operation(summary = "Delete a Recommendation Request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteRecommendationRequest(@Parameter(name = "id") @RequestParam Long id) {
    Recommendation_Request recommendation_Request =
        recommendationRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(Recommendation_Request.class, id));

    recommendationRequestRepository.delete(recommendation_Request);
    return genericMessage("Recommendation_Request with id %s deleted".formatted(id));
  }
}
