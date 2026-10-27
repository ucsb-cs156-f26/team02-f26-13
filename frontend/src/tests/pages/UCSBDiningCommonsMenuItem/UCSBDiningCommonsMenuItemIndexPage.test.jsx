import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "UCSBDiningCommonsMenuItemTable";
  const apiUrl = "/api/UCSBDiningCommonsMenuItem/all";

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  afterAll(() => {
    axiosMock.restore();
  });

  const renderPage = (user) => {
    axiosMock.onGet("/api/currentUser").reply(200, user);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders an empty table and Create button for admin", async () => {
    axiosMock.onGet(apiUrl).reply(200, []);

    renderPage(apiCurrentUserFixtures.adminUser);

    expect(
      await screen.findByRole("heading", {
        name: "UCSB Dining Commons Menu Items",
      }),
    ).toBeInTheDocument();

    expect(await screen.findByText("Create Menu Item")).toHaveAttribute(
      "href",
      "/diningcommonsmenuitem/create",
    );

    await waitFor(() => {
      expect(
        axiosMock.history.get.some((request) => request.url === apiUrl),
      ).toBe(true);
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("ordinary user sees all records but no action buttons", async () => {
    axiosMock
      .onGet(apiUrl)
      .reply(200, ucsbDiningCommonsMenuItemFixtures.threeMenuItems);

    renderPage(apiCurrentUserFixtures.userOnly);

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Pizza");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("Pasta");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-name`),
    ).toHaveTextContent("Grilled Chicken");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-diningCommonsCode`),
    ).toHaveTextContent("carrillo");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-station`),
    ).toHaveTextContent("Pizza Station");

    expect(screen.queryByText("Create Menu Item")).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("admin sees Create, Edit, and Delete controls", async () => {
    axiosMock
      .onGet(apiUrl)
      .reply(200, ucsbDiningCommonsMenuItemFixtures.threeMenuItems);

    renderPage(apiCurrentUserFixtures.adminUser);

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Pizza");

    expect(await screen.findByText("Create Menu Item")).toHaveAttribute(
      "href",
      "/diningcommonsmenuitem/create",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toBeInTheDocument();
  });

  test("admin Edit button navigates to the correct record", async () => {
    axiosMock
      .onGet(apiUrl)
      .reply(200, ucsbDiningCommonsMenuItemFixtures.threeMenuItems);

    renderPage(apiCurrentUserFixtures.adminUser);

    const editButton = await screen.findByTestId(
      `${testId}-cell-row-1-col-Edit-button`,
    );

    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/diningcommonsmenuitem/edit/2",
      );
    });
  });

  test("admin Delete removes a record and refreshes the table", async () => {
    let menuItems = ucsbDiningCommonsMenuItemFixtures.threeMenuItems.map(
      (item) => ({ ...item }),
    );

    axiosMock.onGet(apiUrl).reply(() => [200, menuItems]);

    axiosMock.onDelete("/api/UCSBDiningCommonsMenuItem").reply((request) => {
      const id = Number(request.params.id);
      menuItems = menuItems.filter((item) => item.id !== id);

      return [200, { message: `record ${id} deleted` }];
    });

    renderPage(apiCurrentUserFixtures.adminUser);

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-1-col-Delete-button`,
    );

    expect(screen.getByText("Pasta")).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });

    await waitFor(() => {
      expect(screen.queryByText("Pasta")).not.toBeInTheDocument();
      expect(screen.getByText("Grilled Chicken")).toBeInTheDocument();
    });

    expect(
      axiosMock.history.get.filter((request) => request.url === apiUrl).length,
    ).toBeGreaterThanOrEqual(2);
  });
});
