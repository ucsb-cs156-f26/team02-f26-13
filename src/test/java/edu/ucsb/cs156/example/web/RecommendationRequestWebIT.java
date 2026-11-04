package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
public class RecommendationRequestWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_a_recommendation_request() throws Exception {
    setupUser(true);

    page.getByText("Recommendation Requests").click();
    page.getByText("Create RecommendationRequest").click();

    assertThat(page.getByText("Create New RecommendationRequest")).isVisible();

    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("req@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-professorEmail").fill("prof@ucsb.edu");
    page.getByTestId("RecommendationRequestForm-explanation").fill("Grad school application");
    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2022-02-02T00:00");
    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2022-03-02T00:00");
    page.getByTestId("RecommendationRequestForm-done").check();
    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-requesterEmail"))
        .hasText("req@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-professorEmail"))
        .hasText("prof@ucsb.edu");
    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText("Grad school application");
  }

  @Test
  public void regular_user_cannot_see_the_create_button() throws Exception {
    setupUser(false);

    page.getByText("Recommendation Requests").click();

    assertThat(page.getByText("Create RecommendationRequest")).isHidden();
  }
}
