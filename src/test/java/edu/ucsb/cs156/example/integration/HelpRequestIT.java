package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestIT {
  @Autowired private HelpRequestRepository helpRequestRepository;
  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper mapper;

  @Test
  @WithMockUser(roles = {"ADMIN", "USER"})
  public void admin_update_persists_all_fields_without_changing_another_request() throws Exception {
    assertEquals(0L, helpRequestRepository.count());
    HelpRequest original =
        helpRequestRepository.save(
            HelpRequest.builder()
                .requesterEmail("cgaucho@ucsb.edu")
                .teamId("f26-12")
                .tableOrBreakoutRoom("7")
                .requestTime(LocalDateTime.parse("2026-10-29T15:30:00"))
                .explanation("Need help with integration tests")
                .solved(false)
                .build());
    HelpRequest other =
        helpRequestRepository.save(
            HelpRequest.builder()
                .requesterEmail("other@ucsb.edu")
                .teamId("f26-11")
                .tableOrBreakoutRoom("3")
                .requestTime(LocalDateTime.parse("2026-10-29T15:31:00"))
                .explanation("An unrelated request")
                .solved(false)
                .build());
    HelpRequest updated =
        HelpRequest.builder()
            .id(original.getId())
            .requesterEmail("kuncheng@ucsb.edu")
            .teamId("f26-13")
            .tableOrBreakoutRoom("9")
            .requestTime(LocalDateTime.parse("2026-10-29T15:42:17"))
            .explanation("Integration test question resolved")
            .solved(true)
            .build();

    mockMvc
        .perform(
            put("/api/helprequests")
                .param("id", Long.toString(original.getId()))
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updated))
                .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(content().json(mapper.writeValueAsString(updated)));

    assertEquals(updated, helpRequestRepository.findById(original.getId()).orElseThrow());
    assertEquals(other, helpRequestRepository.findById(other.getId()).orElseThrow());
    assertEquals(2L, helpRequestRepository.count());
  }
}
