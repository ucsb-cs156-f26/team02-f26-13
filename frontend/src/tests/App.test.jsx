import { fireEvent, screen } from "@testing-library/react";
import App from "../App";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { renderWithUser } from "tests/testutils/renderWithUser";

describe("HelpRequest routes", () => {
  afterEach(() => vi.restoreAllMocks());

  test.each([
    ["/helprequest", currentUserFixtures.userOnly, "index"],
    ["/helprequest", currentUserFixtures.adminUser, "index"],
    ["/helprequest/create", currentUserFixtures.adminUser, "create"],
    ["/helprequest/edit/17", currentUserFixtures.adminUser, "edit"],
  ])("allows an authorized user at %s", (route, currentUser, page) => {
    renderWithUser(<App />, { route, currentUser });
    expect(
      screen.getByRole("heading", {
        name:
          page === "create"
            ? "Create New HelpRequest"
            : `HelpRequest ${page} page not yet implemented`,
      }),
    ).toBeInTheDocument();
  });

  test.each([
    ["/helprequest/create", currentUserFixtures.userOnly],
    ["/helprequest/edit/1", currentUserFixtures.userOnly],
    ["/helprequest", currentUserFixtures.notLoggedIn],
    ["/helprequest/create", currentUserFixtures.notLoggedIn],
    ["/helprequest/edit/1", currentUserFixtures.notLoggedIn],
  ])("%s is unavailable without the required role", (route, currentUser) => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithUser(<App />, { route, currentUser });
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("No routes matched location"),
    );
  });

  test("an admin can follow the navbar, create, and edit links", async () => {
    renderWithUser(<App />);
    fireEvent.click(screen.getByRole("link", { name: "HelpRequest" }));
    expect(
      await screen.findByRole("heading", {
        name: "HelpRequest index page not yet implemented",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Create" }));
    expect(
      await screen.findByRole("heading", {
        name: "Create New HelpRequest",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "HelpRequest" }));
    fireEvent.click(screen.getByRole("link", { name: "Edit" }));
    expect(
      await screen.findByRole("heading", {
        name: "HelpRequest edit page not yet implemented",
      }),
    ).toBeInTheDocument();
  });
});
