package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuItemReviewWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_menuitemreview() throws Exception {
    setupUser(true);

    page.getByText("Menu Item Reviews").click(); // navbar link
    page.getByText("Create MenuItemReview").click(); // button on index page
    assertThat(page.getByText("Create New MenuItemReview")).isVisible();

    page.getByTestId("MenuItemReviewForm-itemId").fill("7");
    page.getByTestId("MenuItemReviewForm-reviewerEmail").fill("alex@bob.com");
    page.getByTestId("MenuItemReviewForm-stars").fill("4"); // must be 0 to 5
    page.getByTestId("MenuItemReviewForm-dateReviewed").fill("2022-01-03T12:00");
    page.getByTestId("MenuItemReviewForm-comments").fill("yummers");
    page.getByTestId("MenuItemReviewForm-submit").click();

    assertThat(page.getByTestId("MenuItemReviewTable-cell-row-0-col-comments")).hasText("yummers");
  }
  /*
  @Test
  public void regular_user_cannot_create_restaurant() throws Exception {
    setupUser(false);

    page.getByText("Restaurants").click();

    assertThat(page.getByText("Create Restaurant")).not().isVisible();
    assertThat(page.getByTestId("RestaurantTable-cell-row-0-col-name")).not().isVisible();
  }*/
}
