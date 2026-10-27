import { screen } from "@testing-library/react";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { renderWithUser } from "tests/testutils/renderWithUser";

test("HelpRequest index placeholder links to create and edit pages", () => {
  renderWithUser(<HelpRequestIndexPage />);
  expect(
    screen.getByRole("heading", {
      name: "HelpRequest index page not yet implemented",
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Create" })).toHaveAttribute(
    "href",
    "/helprequest/create",
  );
  expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
    "href",
    "/helprequest/edit/1",
  );
});
