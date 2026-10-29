import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewIndexPage from "main/pages/MenuItemReview/MenuItemReviewIndexPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("MenuItemReviewIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "MenuItemReviewTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    return queryClient;
  };

  test("renders Create button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/MenuItemReview/all").reply(200, []);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Create MenuItemReview/)).toBeInTheDocument();
    });

    const button = screen.getByText(/Create MenuItemReview/);
    expect(button).toHaveAttribute("href", "/menuitemreview/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders reviews for regular user without Create button", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/MenuItemReview/all").reply(200, [
      {
        id: 1,
        reviewerEmail: "reviewer1@ucsb.edu",
        menuItemId: 1,
        comments: "Great food",
        stars: 5,
      },
      {
        id: 2,
        reviewerEmail: "reviewer2@ucsb.edu",
        menuItemId: 2,
        comments: "Pretty good",
        stars: 4,
      },
      {
        id: 3,
        reviewerEmail: "reviewer3@ucsb.edu",
        menuItemId: 3,
        comments: "It was okay",
        stars: 3,
      },
    ]);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    expect(screen.queryByText(/Create MenuItemReview/)).not.toBeInTheDocument();
  });

  test("renders empty table when backend is unavailable", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/MenuItemReview/all").timeout();

    const restoreConsole = mockConsole();
    renderPage();

    await waitFor(() => {
      expect(
        axiosMock.history.get.some(
          (request) => request.url === "/api/MenuItemReview/all",
        ),
      ).toBe(true);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(
          "Error communicating with backend via GET on /api/MenuItemReview/all",
        ),
        expect.anything(),
      );
    });

    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("deletes a review as admin", async () => {
    setupAdminUser();

    axiosMock.onGet("/api/MenuItemReview/all").reply(200, [
      {
        id: 1,
        reviewerEmail: "reviewer1@ucsb.edu",
        menuItemId: 1,
        comments: "Great food",
        stars: 5,
      },
    ]);

    axiosMock
      .onDelete("/api/MenuItemReview")
      .reply(200, "MenuItemReview with id 1 was deleted");

    renderPage();

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
  });

  test("renders empty table when backend returns null", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/MenuItemReview/all").reply(200, null);

    const queryClient = renderPage();

    await waitFor(() => {
      expect(queryClient.getQueryData(["/api/MenuItemReview/all"])).toBeNull();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });
});
