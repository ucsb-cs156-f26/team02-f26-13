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
public class UCSBDiningCommonsMenuItemWebIT extends WebTestCase {

  @Test
  public void admin_can_create_menu_item() throws Exception {
    setupUser(true);

    page.getByText("UCSBDiningCommonsMenuItem").click();

    page.getByText("Create Menu Item").click();
    assertThat(page.getByText("Create New UCSB Dining Commons Menu Item")).isVisible();

    page.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode").fill("carrillo");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-name").fill("AK JPA04 Browser Dish");
    page.getByTestId("UCSBDiningCommonsMenuItemForm-station").fill("Main Station");

    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    assertThat(
            page.getByTestId("UCSBDiningCommonsMenuItemTable").getByText("AK JPA04 Browser Dish"))
        .isVisible();

    // Reload to verify that the record was persisted.
    page.reload();

    assertThat(
            page.getByTestId("UCSBDiningCommonsMenuItemTable").getByText("AK JPA04 Browser Dish"))
        .isVisible();
  }
}
