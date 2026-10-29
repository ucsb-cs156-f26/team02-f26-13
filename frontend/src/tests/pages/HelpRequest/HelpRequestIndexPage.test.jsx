import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes, useParams } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { renderWithUser } from "tests/testutils/renderWithUser";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

vi.mock("react-toastify", async () => ({
  ...(await vi.importActual("react-toastify")),
  toast: vi.fn(),
}));

function EditTarget() {
  return <h1>Edit request {useParams().id}</h1>;
}

function renderIndex(currentUser = currentUserFixtures.adminUser) {
  return renderWithUser(
    <Routes>
      <Route path="/helprequest" element={<HelpRequestIndexPage />} />
      <Route path="/helprequest/create" element={<h1>Create request</h1>} />
      <Route path="/helprequest/edit/:id" element={<EditTarget />} />
    </Routes>,
    { currentUser, route: "/helprequest" },
  );
}

describe("HelpRequestIndexPage", () => {
  let axiosMock;
  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock = new AxiosMockAdapter(axios);
  });
  afterEach(() => {
    axiosMock.restore();
    vi.restoreAllMocks();
  });

  test("ordinary users see every returned field without action buttons", async () => {
    axiosMock
      .onGet("/api/helprequests/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);
    const { queryClient } = renderIndex(currentUserFixtures.userOnly);
    expect(
      await screen.findByTestId("HelpRequestTable-cell-row-0-col-id"),
    ).toHaveTextContent("1");
    expect(
      screen.getByRole("heading", { name: "HelpRequests" }),
    ).toBeInTheDocument();
    helpRequestFixtures.threeHelpRequests.forEach((request, row) => {
      for (const [field, value] of Object.entries(request)) {
        expect(
          screen.getByTestId(`HelpRequestTable-cell-row-${row}-col-${field}`)
            .textContent,
        ).toBe(field === "solved" ? (value ? "Yes" : "No") : String(value));
      }
    });
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(
      screen.queryByRole("button", { name: "Create HelpRequest" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(queryClient.getQueryData(["/api/helprequests/all"])).toEqual(
      helpRequestFixtures.threeHelpRequests,
    );
    expect(axiosMock.history.get).toHaveLength(1);
  });

  test("an empty list still shows the table and admin Create button", async () => {
    axiosMock.onGet("/api/helprequests/all").reply(200, []);
    const { queryClient } = renderIndex();
    await waitFor(() =>
      expect(
        queryClient.getQueryState(["/api/helprequests/all"]).fetchStatus,
      ).toBe("idle"),
    );
    expect(axiosMock.history.get).toHaveLength(1);
    expect(screen.getAllByRole("row")).toHaveLength(1);
    expect(screen.getAllByRole("columnheader")).toHaveLength(9);
    const create = screen.getByRole("button", { name: "Create HelpRequest" });
    expect(create).toHaveAttribute("href", "/helprequest/create");
    expect(create).toHaveClass("btn-primary");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("admins see Create and a pair of actions for each record", async () => {
    axiosMock
      .onGet("/api/helprequests/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);
    renderIndex();
    await screen.findByTestId("HelpRequestTable-cell-row-2-col-id");
    expect(
      screen.getByRole("button", { name: "Create HelpRequest" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(3);
  });

  test("Create navigates to the create route", async () => {
    axiosMock.onGet("/api/helprequests/all").reply(200, []);
    renderIndex();
    fireEvent.click(screen.getByRole("button", { name: "Create HelpRequest" }));
    expect(
      await screen.findByRole("heading", { name: "Create request" }),
    ).toBeInTheDocument();
  });

  test("Edit navigates using the selected record id", async () => {
    axiosMock
      .onGet("/api/helprequests/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);
    renderIndex();
    fireEvent.click(
      await screen.findByTestId("HelpRequestTable-cell-row-1-col-Edit-button"),
    );
    expect(
      await screen.findByRole("heading", { name: "Edit request 2" }),
    ).toBeInTheDocument();
  });

  test("Delete removes the selected record after refetching the list", async () => {
    let records = [...helpRequestFixtures.threeHelpRequests];
    axiosMock.onGet("/api/helprequests/all").reply(() => [200, records]);
    axiosMock.onDelete("/api/helprequests", { params: { id: 2 } }).reply(() => {
      records = records.filter((record) => record.id !== 2);
      return [200, { message: "HelpRequest with id 2 deleted" }];
    });
    const { queryClient } = renderIndex();
    queryClient.setQueryData(["/api/restaurants/all"], []);
    fireEvent.click(
      await screen.findByTestId(
        "HelpRequestTable-cell-row-1-col-Delete-button",
      ),
    );
    await waitFor(() =>
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "HelpRequest with id 2 deleted",
      ),
    );
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(3));
    expect(
      screen.getByTestId("HelpRequestTable-cell-row-1-col-id"),
    ).toHaveTextContent("3");
    expect(
      screen.queryByTestId("HelpRequestTable-cell-row-2-col-id"),
    ).not.toBeInTheDocument();
    expect(axiosMock.history.delete).toHaveLength(1);
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
    expect(axiosMock.history.get).toHaveLength(2);
    expect(queryClient.getQueryData(["/api/helprequests/all"])).toEqual(
      records,
    );
    expect(
      queryClient.getQueryState(["/api/restaurants/all"]).isInvalidated,
    ).toBe(false);
  });

  test("a failed delete reports an error and keeps all records", async () => {
    axiosMock
      .onGet("/api/helprequests/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);
    axiosMock.onDelete("/api/helprequests").reply(500);
    renderIndex();
    fireEvent.click(
      await screen.findByTestId(
        "HelpRequestTable-cell-row-1-col-Delete-button",
      ),
    );
    await waitFor(() =>
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "Error: Request failed with status code 500",
      ),
    );
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(
      screen.getByTestId("HelpRequestTable-cell-row-1-col-id"),
    ).toHaveTextContent("2");
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });
  });

  test("a failed list request shows an error instead of silently looking empty", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    axiosMock.onGet("/api/helprequests/all").reply(500);
    renderIndex(currentUserFixtures.userOnly);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load help requests.",
    );
    expect(screen.getByRole("alert")).toHaveClass("alert-danger");
    expect(screen.getAllByRole("row")).toHaveLength(1);
    expect(toast).toHaveBeenCalledExactlyOnceWith(
      "Error communicating with backend via GET on /api/helprequests/all",
    );
    expect(axiosMock.history.get).toHaveLength(1);
  });
});
