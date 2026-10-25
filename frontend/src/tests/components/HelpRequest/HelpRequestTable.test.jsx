import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const navigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => navigate,
}));
vi.mock("react-toastify", async () => ({
  ...(await vi.importActual("react-toastify")),
  toast: vi.fn(),
}));

const headers = [
  "Id",
  "Requester Email",
  "Team Id",
  "Table or Breakout Room",
  "Request Time",
  "Explanation",
  "Solved",
];

describe("HelpRequestTable", () => {
  let queryClient;
  let axiosMock;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    axiosMock = new AxiosMockAdapter(axios);
  });
  afterEach(() => {
    axiosMock.restore();
    queryClient.clear();
  });

  function renderTable(
    currentUser,
    helpRequests = helpRequestFixtures.threeHelpRequests,
  ) {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("renders an empty table with all field headers", () => {
    renderTable(currentUserFixtures.userOnly, []);
    expect(screen.getByTestId("HelpRequestTable")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(1);
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
    for (const name of headers) {
      expect(screen.getByRole("columnheader", { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test.each([
    ["ordinary user", currentUserFixtures.userOnly],
    ["logged-out user", currentUserFixtures.notLoggedIn],
    ["missing current user", undefined],
  ])("shows all data and no actions for %s", (_label, currentUser) => {
    renderTable(currentUser);
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
    for (const name of headers) {
      expect(screen.getByRole("columnheader", { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("row")).toHaveLength(4);
    helpRequestFixtures.threeHelpRequests.forEach((request, row) => {
      for (const [field, value] of Object.entries(request)) {
        const cell = screen.getByTestId(
          `HelpRequestTable-cell-row-${row}-col-${field}`,
        );
        expect(cell.textContent).toBe(
          field === "solved" ? (value ? "Yes" : "No") : String(value),
        );
      }
    });
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  test("admins see Edit and Delete for every row", () => {
    renderTable(currentUserFixtures.adminUser);
    expect(screen.getAllByRole("columnheader")).toHaveLength(9);
    for (const name of [...headers, "Edit", "Delete"]) {
      expect(screen.getByRole("columnheader", { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(3);
    for (let row = 0; row < 3; row++) {
      expect(
        screen.getByTestId(`HelpRequestTable-cell-row-${row}-col-Edit-button`),
      ).toHaveClass("btn-primary");
      expect(
        screen.getByTestId(
          `HelpRequestTable-cell-row-${row}-col-Delete-button`,
        ),
      ).toHaveClass("btn-danger");
    }
  });

  test("Edit navigates to the selected request's edit page", () => {
    renderTable(currentUserFixtures.adminUser);
    fireEvent.click(
      screen.getByTestId("HelpRequestTable-cell-row-1-col-Edit-button"),
    );
    expect(navigate).toHaveBeenCalledExactlyOnceWith("/helprequests/edit/2");
    expect(axiosMock.history.delete).toHaveLength(0);
  });

  test("Delete sends the selected id, shows the backend message, and invalidates only the help-request list", async () => {
    queryClient.setQueryData(
      ["/api/helprequests/all"],
      helpRequestFixtures.threeHelpRequests,
    );
    queryClient.setQueryData(["/api/restaurants/all"], []);
    axiosMock.onDelete("/api/helprequests", { params: { id: 3 } }).reply(200, {
      message: "HelpRequest with id 3 deleted",
    });
    renderTable(currentUserFixtures.adminUser);
    fireEvent.click(
      screen.getByTestId("HelpRequestTable-cell-row-2-col-Delete-button"),
    );
    await waitFor(() =>
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "HelpRequest with id 3 deleted",
      ),
    );
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].params).toEqual({ id: 3 });
    await waitFor(() =>
      expect(
        queryClient.getQueryState(["/api/helprequests/all"]).isInvalidated,
      ).toBe(true),
    );
    expect(
      queryClient.getQueryState(["/api/restaurants/all"]).isInvalidated,
    ).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  test("a failed delete reports the error without a success message", async () => {
    axiosMock.onDelete("/api/helprequests").reply(500);
    renderTable(currentUserFixtures.adminUser);
    fireEvent.click(
      screen.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button"),
    );
    await waitFor(() =>
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "Error: Request failed with status code 500",
      ),
    );
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});
