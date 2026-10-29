import { screen } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { renderWithUser } from "tests/testutils/renderWithUser";

test("HelpRequest create placeholder renders inside the app layout", () => {
  renderWithUser(<HelpRequestCreatePage />);
  expect(
    screen.getByRole("heading", {
      name: "HelpRequest create page not yet implemented",
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "HelpRequest" })).toHaveAttribute(
    "href",
    "/helprequest",
  );
});
