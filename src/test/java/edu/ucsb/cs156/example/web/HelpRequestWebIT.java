package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestWebIT extends WebTestCase {
  @Autowired private HelpRequestRepository helpRequestRepository;

  @Test
  public void admin_can_edit_a_request_and_see_the_saved_values_after_reloading() {
    HelpRequest original =
        helpRequestRepository.save(
            HelpRequest.builder()
                .requesterEmail("cgaucho@ucsb.edu")
                .teamId("f26-12")
                .tableOrBreakoutRoom("7")
                .requestTime(LocalDateTime.parse("2026-10-29T15:30:00"))
                .explanation("Need help writing a browser test")
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
            .explanation("Browser test question resolved")
            .solved(true)
            .build();

    setupUser(true);
    page.getByRole(AriaRole.LINK, new Page.GetByRoleOptions().setName("HelpRequest").setExact(true))
        .click();
    Locator originalRow =
        page.getByRole(AriaRole.ROW)
            .filter(new Locator.FilterOptions().setHasText(original.getExplanation()));
    originalRow
        .getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Edit").setExact(true))
        .click();

    assertThat(
            page.getByRole(
                AriaRole.HEADING,
                new Page.GetByRoleOptions().setName("Edit HelpRequest").setExact(true)))
        .isVisible();
    assertThat(page.getByLabel("Id", new Page.GetByLabelOptions().setExact(true)))
        .hasValue(Long.toString(original.getId()));
    assertThat(page.getByLabel("Requester Email")).hasValue(original.getRequesterEmail());
    assertThat(page.getByLabel("Explanation")).hasValue(original.getExplanation());
    assertThat(page.getByLabel("Solved")).not().isChecked();

    page.getByLabel("Requester Email").fill(updated.getRequesterEmail());
    page.getByLabel("Team Id").fill(updated.getTeamId());
    page.getByLabel("Table or Breakout Room").fill(updated.getTableOrBreakoutRoom());
    page.getByLabel("Request Time").fill("2026-10-29T15:42:17");
    page.getByLabel("Explanation").fill(updated.getExplanation());
    page.getByLabel("Solved").check();
    page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Update").setExact(true))
        .click();

    assertThat(
            page.getByRole(
                AriaRole.HEADING,
                new Page.GetByRoleOptions().setName("HelpRequests").setExact(true)))
        .isVisible();
    Locator updatedRow =
        page.getByRole(AriaRole.ROW)
            .filter(new Locator.FilterOptions().setHasText(updated.getExplanation()));
    assertThat(updatedRow).containsText(updated.getRequesterEmail());
    assertThat(
            updatedRow.getByRole(
                AriaRole.CELL, new Locator.GetByRoleOptions().setName("Yes").setExact(true)))
        .isVisible();

    page.reload();
    assertThat(updatedRow).isVisible();
    assertThat(updatedRow).containsText(updated.getRequesterEmail());
    assertEquals(updated, helpRequestRepository.findById(original.getId()).orElseThrow());
    assertEquals(other, helpRequestRepository.findById(other.getId()).orElseThrow());
    assertEquals(2L, helpRequestRepository.count());
  }
}
