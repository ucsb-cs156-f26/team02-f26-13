package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired UCSBOrganizationRepository ucsbOrganizationRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_organization_by_id() throws Exception {
    UCSBOrganization organization =
        UCSBOrganization.builder()
            .orgCode("TEST")
            .orgTranslationShort("Test Org")
            .orgTranslation("Test Organization")
            .inactive(false)
            .build();

    ucsbOrganizationRepository.save(organization);

    MvcResult response =
        mockMvc
            .perform(get("/api/ucsborganizations?orgCode=TEST"))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson = mapper.writeValueAsString(organization);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void an_admin_user_can_post_a_new_organization() throws Exception {
    MvcResult response =
        mockMvc
            .perform(
                post("/api/ucsborganizations/post")
                    .param("orgCode", "TEST2")
                    .param("orgTranslationShort", "Test2")
                    .param("orgTranslation", "Test Organization 2")
                    .param("inactive", "false")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    UCSBOrganization expectedOrganization =
        UCSBOrganization.builder()
            .orgCode("TEST2")
            .orgTranslationShort("Test2")
            .orgTranslation("Test Organization 2")
            .inactive(false)
            .build();

    String expectedJson = mapper.writeValueAsString(expectedOrganization);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void an_admin_user_can_delete_an_organization() throws Exception {
    UCSBOrganization organization =
        UCSBOrganization.builder()
            .orgCode("DELETE_ME")
            .orgTranslationShort("Delete Me")
            .orgTranslation("Organization to delete")
            .inactive(false)
            .build();

    ucsbOrganizationRepository.save(organization);

    MvcResult response =
        mockMvc
            .perform(delete("/api/ucsborganizations?orgCode=DELETE_ME").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson =
        mapper.writeValueAsString(
            Map.of("message", "UCSBOrganization with orgCode DELETE_ME deleted"));
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void an_admin_user_can_update_an_organization() throws Exception {
    UCSBOrganization originalOrganization =
        UCSBOrganization.builder()
            .orgCode("UPDATE_ME")
            .orgTranslationShort("Original")
            .orgTranslation("Original Organization")
            .inactive(false)
            .build();

    ucsbOrganizationRepository.save(originalOrganization);

    UCSBOrganization updatedOrganization =
        UCSBOrganization.builder()
            .orgCode("UPDATE_ME")
            .orgTranslationShort("Updated")
            .orgTranslation("Updated Organization")
            .inactive(true)
            .build();

    MvcResult response =
        mockMvc
            .perform(
                put("/api/ucsborganizations?orgCode=UPDATE_ME")
                    .with(csrf())
                    .content(mapper.writeValueAsString(updatedOrganization))
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJson = mapper.writeValueAsString(updatedOrganization);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_all_organizations() throws Exception {
    UCSBOrganization organization1 =
        UCSBOrganization.builder()
            .orgCode("ORG1")
            .orgTranslationShort("Org 1")
            .orgTranslation("Organization 1")
            .inactive(false)
            .build();

    UCSBOrganization organization2 =
        UCSBOrganization.builder()
            .orgCode("ORG2")
            .orgTranslationShort("Org 2")
            .orgTranslation("Organization 2")
            .inactive(true)
            .build();

    ucsbOrganizationRepository.save(organization1);
    ucsbOrganizationRepository.save(organization2);

    MvcResult response =
        mockMvc.perform(get("/api/ucsborganizations/all")).andExpect(status().isOk()).andReturn();

    String responseString = response.getResponse().getContentAsString();
    assertEquals(2, mapper.readTree(responseString).size());
  }
}
