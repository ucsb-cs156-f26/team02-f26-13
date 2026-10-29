package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBOrganization;
import edu.ucsb.cs156.example.repositories.UCSBOrganizationRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = UCSBOrganizationController.class)
@Import(TestConfig.class)
public class UCSBOrganizationControllerTests extends ControllerTestCase {

  @MockBean UCSBOrganizationRepository ucsbOrganizationRepository;

  @MockBean UserRepository userRepository;

  // Tests for GET /api/ucsborganizations/all

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/ucsborganizations/all"))
        .andExpect(status().is(403)); // logged out users get 403 Forbidden
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    UCSBOrganization zpr =
        UCSBOrganization.builder()
            .orgCode("ZPR")
            .orgTranslationShort("ZETA PHI RHO")
            .orgTranslation("ZETA PHI RHO")
            .inactive(false)
            .build();

    UCSBOrganization sky =
        UCSBOrganization.builder()
            .orgCode("SKY")
            .orgTranslationShort("SKYDIVING CLUB")
            .orgTranslation("SKYDIVING CLUB AT UCSB")
            .inactive(false)
            .build();

    ArrayList<UCSBOrganization> expectedOrgs = new ArrayList<>(Arrays.asList(zpr, sky));
    when(ucsbOrganizationRepository.findAll()).thenReturn(expectedOrgs);

    MvcResult response =
        mockMvc.perform(get("/api/ucsborganizations/all")).andExpect(status().isOk()).andReturn();
    verify(ucsbOrganizationRepository, times(1)).findAll();
    String responseString = response.getResponse().getContentAsString();
    String expectedJson = mapper.writeValueAsString(expectedOrgs);

    assertEquals(expectedJson, responseString);
  }

  // Tests for POST /api/ucsborganizations/post

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/ucsborganizations/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/ucsborganizations/post")
                .param("orgCode", "ZPR")
                .param("orgTranslationShort", "ZETA PHI RHO")
                .param("orgTranslation", "ZETA PHI RHO")
                .param("inactive", "true")
                .with(csrf()))
        .andExpect(status().is(403)); // only admins can post
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_organization() throws Exception {
    UCSBOrganization zpr =
        UCSBOrganization.builder()
            .orgCode("ZPR")
            .orgTranslationShort("ZETA PHI RHO")
            .orgTranslation("ZETA PHI RHO")
            .inactive(true)
            .build();

    when(ucsbOrganizationRepository.save(any())).thenReturn(zpr);
    MvcResult response =
        mockMvc
            .perform(
                post("/api/ucsborganizations/post")
                    .param("orgCode", "ZPR")
                    .param("orgTranslationShort", "ZETA PHI RHO")
                    .param("orgTranslation", "ZETA PHI RHO")
                    .param("inactive", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();
    org.mockito.ArgumentCaptor<UCSBOrganization> captor =
        org.mockito.ArgumentCaptor.forClass(UCSBOrganization.class);
    verify(ucsbOrganizationRepository, times(1)).save(captor.capture());

    UCSBOrganization savedOrganization = captor.getValue();
    assertEquals("ZPR", savedOrganization.getOrgCode());
    assertEquals("ZETA PHI RHO", savedOrganization.getOrgTranslationShort());
    assertEquals("ZETA PHI RHO", savedOrganization.getOrgTranslation());
    assertEquals(true, savedOrganization.getInactive());

    String expectedJson = mapper.writeValueAsString(zpr);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc.perform(get("/api/ucsborganizations?orgCode=ZPR")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    UCSBOrganization zpr =
        UCSBOrganization.builder()
            .orgCode("ZPR")
            .orgTranslationShort("ZETA PHI RHO")
            .orgTranslation("ZETA PHI RHO")
            .inactive(false)
            .build();

    when(ucsbOrganizationRepository.findById(eq("ZPR"))).thenReturn(Optional.of(zpr));

    MvcResult response =
        mockMvc
            .perform(get("/api/ucsborganizations?orgCode=ZPR"))
            .andExpect(status().isOk())
            .andReturn();

    verify(ucsbOrganizationRepository, times(1)).findById(eq("ZPR"));
    String expectedJson = mapper.writeValueAsString(zpr);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_does_not_exist() throws Exception {
    when(ucsbOrganizationRepository.findById(eq("MOCK"))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(get("/api/ucsborganizations?orgCode=MOCK"))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(ucsbOrganizationRepository, times(1)).findById(eq("MOCK"));
    String responseString = response.getResponse().getContentAsString();
    org.junit.jupiter.api.Assertions.assertTrue(responseString.contains("EntityNotFoundException"));
  }

  @Test
  public void logged_out_users_cannot_delete() throws Exception {
    mockMvc.perform(delete("/api/ucsborganizations?orgCode=ZPR")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/ucsborganizations?orgCode=ZPR").with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_an_organization() throws Exception {
    UCSBOrganization zpr =
        UCSBOrganization.builder()
            .orgCode("ZPR")
            .orgTranslationShort("ZETA PHI RHO")
            .orgTranslation("ZETA PHI RHO")
            .inactive(false)
            .build();

    when(ucsbOrganizationRepository.findById(eq("ZPR"))).thenReturn(Optional.of(zpr));

    MvcResult response =
        mockMvc
            .perform(delete("/api/ucsborganizations?orgCode=ZPR").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(ucsbOrganizationRepository, times(1)).findById(eq("ZPR"));
    verify(ucsbOrganizationRepository, times(1)).delete(any(UCSBOrganization.class));

    String responseString = response.getResponse().getContentAsString();
    String expectedJson =
        mapper.writeValueAsString(Map.of("message", "UCSBOrganization with orgCode ZPR deleted"));
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existent_organization_and_gets_not_found()
      throws Exception {
    when(ucsbOrganizationRepository.findById(eq("MOCK"))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(delete("/api/ucsborganizations?orgCode=MOCK").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(ucsbOrganizationRepository, times(1)).findById(eq("MOCK"));
    String responseString = response.getResponse().getContentAsString();
    org.junit.jupiter.api.Assertions.assertTrue(responseString.contains("EntityNotFoundException"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_organization() throws Exception {
    UCSBOrganization zpr1 =
        UCSBOrganization.builder()
            .orgCode("ZPR")
            .orgTranslationShort("ZETA PHI RHO")
            .orgTranslation("ZETA PHI RHO")
            .inactive(false)
            .build();

    UCSBOrganization zpr2 =
        UCSBOrganization.builder()
            .orgCode("ZPR")
            .orgTranslationShort("Zeta Phi Rho")
            .orgTranslation("Zeta Phi Rho Fraternity")
            .inactive(true)
            .build();

    String requestBody = mapper.writeValueAsString(zpr2);

    when(ucsbOrganizationRepository.findById(eq("ZPR"))).thenReturn(Optional.of(zpr1));

    MvcResult response =
        mockMvc
            .perform(
                put("/api/ucsborganizations?orgCode=ZPR")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(ucsbOrganizationRepository, times(1)).findById(eq("ZPR"));
    verify(ucsbOrganizationRepository, times(1)).save(any(UCSBOrganization.class));
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_organization_that_does_not_exist() throws Exception {
    UCSBOrganization editedOrg =
        UCSBOrganization.builder()
            .orgCode("MOCK")
            .orgTranslationShort("Mock Org")
            .orgTranslation("Mock Organization")
            .inactive(true)
            .build();

    String requestBody = mapper.writeValueAsString(editedOrg);

    when(ucsbOrganizationRepository.findById(eq("MOCK"))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(
                put("/api/ucsborganizations?orgCode=MOCK")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(ucsbOrganizationRepository, times(1)).findById(eq("MOCK"));
    String responseString = response.getResponse().getContentAsString();
    org.junit.jupiter.api.Assertions.assertTrue(responseString.contains("EntityNotFoundException"));
  }
}
