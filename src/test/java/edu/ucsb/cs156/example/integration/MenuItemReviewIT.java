package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.MenuItemReview;
import edu.ucsb.cs156.example.repositories.MenuItemReviewRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
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
public class MenuItemReviewIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired MenuItemReviewRepository menuItemReviewRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  /*
  @WithMockUser(roles = {"USER"})
  @Test
  public void random_reading_test() throws Exception {
    // arrange

    LocalDateTime ldt = LocalDateTime.parse("2022-01-03T00:00:00");
    MenuItemReview menuItemReview = MenuItemReview.builder().itemId(7).id(1L).reviewerEmail("alex@bob.com").dateReviewed(ldt).stars(4).comments("yummers").build();

    menuItemReviewRepository.save(menuItemReview);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/MenuItemReview?id=1")).andExpect(status().isOk()).andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(menuItemReview);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }*/

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_menuitemreview() throws Exception {
    // arrange
    LocalDateTime ldt = LocalDateTime.parse("2022-01-03T00:00:00");

    MenuItemReview expected =
        MenuItemReview.builder()
            .id(1L)
            .itemId(7)
            .reviewerEmail("bob@gmail.com")
            .stars(4)
            .dateReviewed(ldt)
            .comments("yummers")
            .build();

    MvcResult response =
        mockMvc
            .perform(
                post("/api/MenuItemReview/post?itemId=7&reviewerEmail=bob@gmail.com&stars=4&dateReviewed=2022-01-03T00:00:00&comments=yummers")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    String expectedJSON = mapper.writeValueAsString(expected);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJSON, responseString);

    MenuItemReview actual = menuItemReviewRepository.findById(1L).get();
    assertEquals(expected, actual);
  }

  /*  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_restaurant() throws Exception {
    // arrange

    Restaurant restaurant1 =
        Restaurant.builder().id(1L).name("Chipotle").description("Mexican").build();

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/restaurants/post?name=Chipotle&description=Mexican").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(restaurant1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }
    */
}
