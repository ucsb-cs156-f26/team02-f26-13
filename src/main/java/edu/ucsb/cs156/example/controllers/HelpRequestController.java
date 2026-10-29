package edu.ucsb.cs156.example.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
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

/** This is a REST controller for HelpRequests */
@Tag(name = "HelpRequests")
@RequestMapping("/api/helprequests")
@RestController
@Slf4j
public class HelpRequestController extends ApiController {

  @Autowired HelpRequestRepository helpRequestRepository;

  /**
   * List all help requests
   *
   * @return an iterable of HelpRequest
   */
  @Operation(summary = "List all help requests")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<HelpRequest> allHelpRequests() {
    Iterable<HelpRequest> helpRequests = helpRequestRepository.findAll();
    return helpRequests;
  }

  /**
   * Get a single help request by id
   *
   * @param id the id of the help request
   * @return a HelpRequest
   */
  @Operation(summary = "Get a single help request")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public HelpRequest getById(
      @Parameter(name = "id", description = "id of the help request") @RequestParam Long id) {
    HelpRequest helpRequest =
        helpRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

    return helpRequest;
  }

  /**
   * Create a new help request
   *
   * @param requesterEmail the email of the person requesting help
   * @param teamId the id of the requester's team
   * @param tableOrBreakoutRoom the table or breakout room where the requester can be found
   * @param requestTime the time the help was requested
   * @param explanation a description of what the requester needs help with
   * @param solved whether the request has been solved
   * @return the saved help request
   */
  @Operation(summary = "Create a new help request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public HelpRequest postHelpRequest(
      @Parameter(name = "requesterEmail", description = "email of the person requesting help")
          @RequestParam
          String requesterEmail,
      @Parameter(name = "teamId", description = "team id, e.g. f26-13") @RequestParam String teamId,
      @Parameter(
              name = "tableOrBreakoutRoom",
              description = "table number or breakout room where the requester can be found")
          @RequestParam
          String tableOrBreakoutRoom,
      @Parameter(
              name = "requestTime",
              description =
                  "time of the request (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)")
          @RequestParam("requestTime")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime requestTime,
      @Parameter(name = "explanation", description = "what the requester needs help with")
          @RequestParam
          String explanation,
      @Parameter(name = "solved", description = "whether the request has been solved") @RequestParam
          boolean solved)
      throws JsonProcessingException {

    // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    // See: https://www.baeldung.com/spring-date-parameters

    log.info("requestTime={}", requestTime);

    HelpRequest helpRequest = new HelpRequest();
    helpRequest.setRequesterEmail(requesterEmail);
    helpRequest.setTeamId(teamId);
    helpRequest.setTableOrBreakoutRoom(tableOrBreakoutRoom);
    helpRequest.setRequestTime(requestTime);
    helpRequest.setExplanation(explanation);
    helpRequest.setSolved(solved);

    HelpRequest savedHelpRequest = helpRequestRepository.save(helpRequest);

    return savedHelpRequest;
  }

  /**
   * Delete a HelpRequest
   *
   * @param id the id of the help request to delete
   * @return a message indicating the help request was deleted
   */
  @Operation(summary = "Delete a HelpRequest")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteHelpRequest(
      @Parameter(name = "id", description = "id of the help request to delete") @RequestParam
          Long id) {
    HelpRequest helpRequest =
        helpRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

    helpRequestRepository.delete(helpRequest);
    return genericMessage("HelpRequest with id %s deleted".formatted(id));
  }

  /**
   * Update a single help request
   *
   * @param id id of the help request to update
   * @param incoming the new values for the help request
   * @return the updated help request object
   */
  @Operation(summary = "Update a single help request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public HelpRequest updateHelpRequest(
      @Parameter(name = "id", description = "id of the help request to update") @RequestParam
          Long id,
      @RequestBody @Valid HelpRequest incoming) {

    HelpRequest helpRequest =
        helpRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

    helpRequest.setRequesterEmail(incoming.getRequesterEmail());
    helpRequest.setTeamId(incoming.getTeamId());
    helpRequest.setTableOrBreakoutRoom(incoming.getTableOrBreakoutRoom());
    helpRequest.setRequestTime(incoming.getRequestTime());
    helpRequest.setExplanation(incoming.getExplanation());
    helpRequest.setSolved(incoming.getSolved());

    helpRequestRepository.save(helpRequest);

    return helpRequest;
  }
}
