import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemTable tests", () => {
  const testId = "UCSBDiningCommonsMenuItemTable";

  const expectedHeaders = ["ID", "Dining Commons Code", "Name", "Station"];

  const renderTable = (menuItems, currentUser) => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemTable
            menuItems={menuItems}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders an empty table correctly", () => {
    renderTable([], currentUserFixtures.userOnly);

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("shows all fields without action buttons for ordinary users", () => {
    renderTable(
      ucsbDiningCommonsMenuItemFixtures.threeMenuItems,
      currentUserFixtures.userOnly,
    );

    expectedHeaders.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-diningCommonsCode`),
    ).toHaveTextContent("carrillo");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Pizza");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-station`),
    ).toHaveTextContent("Pizza Station");

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("shows Edit and Delete buttons for admins", () => {
    renderTable(
      ucsbDiningCommonsMenuItemFixtures.threeMenuItems,
      currentUserFixtures.adminUser,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("Pasta");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-station`),
    ).toHaveTextContent("Grill");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    expect(editButton).toHaveClass("btn-primary");
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit navigates to the correct record", async () => {
    renderTable(
      ucsbDiningCommonsMenuItemFixtures.threeMenuItems,
      currentUserFixtures.adminUser,
    );

    fireEvent.click(screen.getByTestId(`${testId}-cell-row-1-col-Edit-button`));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/diningcommonsmenuitem/edit/2",
      );
    });
  });

  test("Delete calls the correct backend endpoint with the record ID", async () => {
    const axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onDelete("/api/UCSBDiningCommonsMenuItem")
      .reply(200, { message: "Menu item deleted" });

    renderTable(
      ucsbDiningCommonsMenuItemFixtures.threeMenuItems,
      currentUserFixtures.adminUser,
    );

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-1-col-Delete-button`),
    );

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].params).toEqual({
      id: 2,
    });

    axiosMock.restore();
  });
});
