import { screen } from "@testing-library/react";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";
import { renderWithUser } from "tests/testutils/renderWithUser";

test("HelpRequest edit placeholder renders inside the app layout", () => {
  renderWithUser(<HelpRequestEditPage />);
  expect(
    screen.getByRole("heading", {
      name: "HelpRequest edit page not yet implemented",
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "HelpRequest" })).toHaveAttribute(
    "href",
    "/helprequest",
  );
});
