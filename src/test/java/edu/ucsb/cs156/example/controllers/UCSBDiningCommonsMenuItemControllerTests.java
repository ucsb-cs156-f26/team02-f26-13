package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = UCSBDiningCommonsMenuItemController.class)
@Import(TestConfig.class)
public class UCSBDiningCommonsMenuItemControllerTests extends ControllerTestCase {

  @MockitoBean UCSBDiningCommonsMenuItemRepository ucsbDiningCommonsMenuItemRepository;

  @MockitoBean UserRepository userRepository;

  private static final String BASE_URL = "/api/UCSBDiningCommonsMenuItem";

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc.perform(get(BASE_URL + "/all")).andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    UCSBDiningCommonsMenuItem item1 =
        UCSBDiningCommonsMenuItem.builder()
            .id(1L)
            .diningCommonsCode("carrillo")
            .name("Pizza")
            .station("Pizza Station")
            .build();

    UCSBDiningCommonsMenuItem item2 =
        UCSBDiningCommonsMenuItem.builder()
            .id(2L)
            .diningCommonsCode("portola")
            .name("Pasta")
            .station("Pasta Station")
            .build();

    List<UCSBDiningCommonsMenuItem> items = List.of(item1, item2);

    when(ucsbDiningCommonsMenuItemRepository.findAll()).thenReturn(items);

    MvcResult response =
        mockMvc.perform(get(BASE_URL + "/all")).andExpect(status().isOk()).andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findAll();
    assertEquals(mapper.writeValueAsString(items), response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_empty_list() throws Exception {
    when(ucsbDiningCommonsMenuItemRepository.findAll()).thenReturn(List.of());

    MvcResult response =
        mockMvc.perform(get(BASE_URL + "/all")).andExpect(status().isOk()).andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findAll();
    assertEquals("[]", response.getResponse().getContentAsString());
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc.perform(get(BASE_URL).param("id", "7")).andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_by_id_when_it_exists() throws Exception {
    UCSBDiningCommonsMenuItem item =
        UCSBDiningCommonsMenuItem.builder()
            .id(7L)
            .diningCommonsCode("carrillo")
            .name("Pizza")
            .station("Pizza Station")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(7L)).thenReturn(Optional.of(item));

    MvcResult response =
        mockMvc.perform(get(BASE_URL).param("id", "7")).andExpect(status().isOk()).andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(7L);
    assertEquals(mapper.writeValueAsString(item), response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_gets_404_when_id_does_not_exist() throws Exception {
    when(ucsbDiningCommonsMenuItemRepository.findById(7L)).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(get(BASE_URL).param("id", "7"))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(7L);

    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("UCSBDiningCommonsMenuItem with id 7 not found", json.get("message"));
  }

  @Test
  public void logged_out_users_cannot_put() throws Exception {
    String requestBody =
        "{\"diningCommonsCode\":\"portola\",\"name\":\"Pasta\",\"station\":\"Pasta Station\"}";

    mockMvc
        .perform(
            put(BASE_URL)
                .param("id", "67")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_users_cannot_put() throws Exception {
    String requestBody =
        "{\"diningCommonsCode\":\"portola\",\"name\":\"Pasta\",\"station\":\"Pasta Station\"}";

    mockMvc
        .perform(
            put(BASE_URL)
                .param("id", "67")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_update_existing_menu_item() throws Exception {
    UCSBDiningCommonsMenuItem original =
        UCSBDiningCommonsMenuItem.builder()
            .id(67L)
            .diningCommonsCode("carrillo")
            .name("Pizza")
            .station("Pizza Station")
            .build();

    UCSBDiningCommonsMenuItem incoming =
        UCSBDiningCommonsMenuItem.builder()
            .id(999L)
            .diningCommonsCode("portola")
            .name("Pasta")
            .station("Pasta Station")
            .build();

    UCSBDiningCommonsMenuItem expected =
        UCSBDiningCommonsMenuItem.builder()
            .id(67L)
            .diningCommonsCode("portola")
            .name("Pasta")
            .station("Pasta Station")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(67L)).thenReturn(Optional.of(original));

    MvcResult response =
        mockMvc
            .perform(
                put(BASE_URL)
                    .param("id", "67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(incoming))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(67L);
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).save(expected);
    assertEquals(mapper.writeValueAsString(expected), response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_update_nonexistent_menu_item() throws Exception {
    UCSBDiningCommonsMenuItem incoming =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("portola")
            .name("Pasta")
            .station("Pasta Station")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(67L)).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(
                put(BASE_URL)
                    .param("id", "67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(incoming))
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(67L);

    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("UCSBDiningCommonsMenuItem with id 67 not found", json.get("message"));
  }

  @Test
  public void logged_out_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete(BASE_URL).param("id", "7").with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete(BASE_URL).param("id", "7").with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_existing_menu_item() throws Exception {
    UCSBDiningCommonsMenuItem item =
        UCSBDiningCommonsMenuItem.builder()
            .id(7L)
            .diningCommonsCode("carrillo")
            .name("Pizza")
            .station("Pizza Station")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(7L)).thenReturn(Optional.of(item));

    MvcResult response =
        mockMvc
            .perform(delete(BASE_URL).param("id", "7").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(7L);
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).delete(item);

    Map<String, Object> json = responseToJson(response);
    assertEquals("record 7 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_delete_nonexistent_menu_item() throws Exception {
    when(ucsbDiningCommonsMenuItemRepository.findById(7L)).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(delete(BASE_URL).param("id", "7").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(7L);
    verify(ucsbDiningCommonsMenuItemRepository, never()).delete(any());

    Map<String, Object> json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("UCSBDiningCommonsMenuItem with id 7 not found", json.get("message"));
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post(BASE_URL + "/post")
                .param("diningCommonsCode", "carrillo")
                .param("name", "Pizza")
                .param("station", "Pizza Station")
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post(BASE_URL + "/post")
                .param("diningCommonsCode", "carrillo")
                .param("name", "Pizza")
                .param("station", "Pizza Station")
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_post_new_menu_item() throws Exception {
    UCSBDiningCommonsMenuItem incoming =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("carrillo")
            .name("Pizza")
            .station("Pizza Station")
            .build();

    UCSBDiningCommonsMenuItem saved =
        UCSBDiningCommonsMenuItem.builder()
            .id(1L)
            .diningCommonsCode("carrillo")
            .name("Pizza")
            .station("Pizza Station")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.save(incoming)).thenReturn(saved);

    MvcResult response =
        mockMvc
            .perform(
                post(BASE_URL + "/post")
                    .param("diningCommonsCode", "carrillo")
                    .param("name", "Pizza")
                    .param("station", "Pizza Station")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).save(incoming);
    assertEquals(mapper.writeValueAsString(saved), response.getResponse().getContentAsString());
  }
}
