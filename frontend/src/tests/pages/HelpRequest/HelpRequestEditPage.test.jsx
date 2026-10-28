import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Link, Route, Routes, useLocation } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { renderWithUser } from "tests/testutils/renderWithUser";

vi.mock("react-toastify", async () => ({
  ...(await vi.importActual("react-toastify")),
  toast: vi.fn(),
}));

const original = helpRequestFixtures.threeHelpRequests[1];
const values = {
  requesterEmail: "kuncheng@ucsb.edu",
  teamId: "f26-13",
  tableOrBreakoutRoom: "9",
  requestTime: "2026-10-27T18:12:34.123",
  explanation: "Updated after getting help",
  solved: false,
};

function CurrentPath() {
  return <output aria-label="Current path">{useLocation().pathname}</output>;
}

function renderPage({ storybook, route = "/helprequest/edit/2" } = {}) {
  return renderWithUser(
    <>
      <Routes>
        <Route
          path="/helprequest"
          element={
            <>
              <h1>HelpRequest list</h1>
              <Link to="/helprequest/edit/2">Open Edit</Link>
            </>
          }
        />
        <Route
          path="/helprequest/edit/:id"
          element={<HelpRequestEditPage storybook={storybook} />}
        />
      </Routes>
      <Link to="/helprequest/edit/3">Edit another request</Link>
      <CurrentPath />
    </>,
    { route },
  );
}

function fillForm(input = values) {
  for (const [label, key] of [
    ["Requester Email", "requesterEmail"],
    ["Team Id", "teamId"],
    ["Table or Breakout Room", "tableOrBreakoutRoom"],
    ["Request Time", "requestTime"],
    ["Explanation", "explanation"],
  ])
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: input[key] },
    });
  if (screen.getByLabelText("Solved").checked !== input.solved)
    fireEvent.click(screen.getByLabelText("Solved"));
}

describe("HelpRequestEditPage", () => {
  let axiosMock;
  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/helprequests", { params: { id: "2" } })
      .reply(200, original);
  });
  afterEach(() => {
    axiosMock.restore();
    vi.restoreAllMocks();
  });

  test("loads the selected record, including a read-only id and solved status", async () => {
    renderPage();
    expect(screen.getByText("Loading help request...")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Update" }),
    ).not.toBeInTheDocument();
    expect(await screen.findByLabelText("Id")).toHaveValue("2");
    expect(screen.getByLabelText("Id")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Requester Email")).toHaveValue(
      original.requesterEmail,
    );
    expect(screen.getByLabelText("Team Id")).toHaveValue(original.teamId);
    expect(screen.getByLabelText("Table or Breakout Room")).toHaveValue(
      original.tableOrBreakoutRoom,
    );
    expect(screen.getByLabelText("Request Time")).toHaveValue(
      "2026-10-22T18:31",
    );
    expect(screen.getByLabelText("Explanation")).toHaveValue(
      original.explanation,
    );
    expect(screen.getByLabelText("Solved")).toBeChecked();
    expect(
      screen.queryByText("Loading help request..."),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(axiosMock.history.get[0].params).toEqual({ id: "2" });
  });

  test.each([false, true])(
    "saves all fields with solved=%s and invalidates detail and list caches",
    async (solved) => {
      axiosMock
        .onPut("/api/helprequests")
        .reply(200, { ...values, id: 2, solved });
      const { queryClient } = renderPage();
      queryClient.setQueryData(["/api/helprequests/all"], [original]);
      queryClient.setQueryData(["/api/restaurants/all"], []);
      await screen.findByLabelText("Id");
      fillForm({ ...values, solved });
      fireEvent.click(screen.getByRole("button", { name: "Update" }));
      expect(
        await screen.findByRole("heading", { name: "HelpRequest list" }),
      ).toBeInTheDocument();
      expect(axiosMock.history.put).toHaveLength(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: "2" });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        ...values,
        solved,
      });
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "HelpRequest Updated - id: 2",
      );
      await waitFor(() =>
        expect(
          queryClient.getQueryState(["/api/helprequests/all"]).isInvalidated,
        ).toBe(true),
      );
      expect(
        axiosMock.history.get.length > 1 ||
          queryClient.getQueryState(["/api/helprequests?id=2"]).isInvalidated,
      ).toBe(true);
      expect(
        queryClient.getQueryState(["/api/restaurants/all"]).isInvalidated,
      ).toBe(false);
      expect(screen.getByLabelText("Current path")).toHaveTextContent(
        /^\/helprequest$/,
      );
    },
  );

  test("moving between edit URLs fetches the newly selected record", async () => {
    const another = helpRequestFixtures.threeHelpRequests[2];
    axiosMock
      .onGet("/api/helprequests", { params: { id: "3" } })
      .reply(200, another);
    renderPage();
    expect(await screen.findByLabelText("Id")).toHaveValue("2");
    fireEvent.click(screen.getByRole("link", { name: "Edit another request" }));
    await waitFor(() => expect(screen.getByLabelText("Id")).toHaveValue("3"));
    expect(screen.getByLabelText("Requester Email")).toHaveValue(
      another.requesterEmail,
    );
    expect(screen.getByLabelText("Explanation")).toHaveValue(
      another.explanation,
    );
    expect(screen.getByLabelText("Solved")).not.toBeChecked();
    expect(axiosMock.history.get.map((request) => request.params.id)).toEqual([
      "2",
      "3",
    ]);
  });

  test("invalid changes show validation errors without sending a PUT", async () => {
    renderPage();
    await screen.findByLabelText("Id");
    fillForm({
      ...values,
      requesterEmail: "bad-email",
      teamId: "   ",
      explanation: "",
    });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Team id cannot be blank.")).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
    expect(screen.getByLabelText("Current path")).toHaveTextContent(
      "/helprequest/edit/2",
    );
  });

  test("Cancel returns to the previous page without saving changes", async () => {
    renderPage({ route: "/helprequest" });
    fireEvent.click(screen.getByRole("link", { name: "Open Edit" }));
    await screen.findByLabelText("Id");
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      await screen.findByRole("heading", { name: "HelpRequest list" }),
    ).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
  });

  test("a failed save preserves edited values and stays on the edit page", async () => {
    axiosMock.onPut("/api/helprequests").reply(500);
    renderPage();
    await screen.findByLabelText("Id");
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "Error: Request failed with status code 500",
      ),
    );
    expect(screen.getByLabelText("Requester Email")).toHaveValue(
      values.requesterEmail,
    );
    expect(screen.getByLabelText("Explanation")).toHaveValue(
      values.explanation,
    );
    expect(screen.getByLabelText("Solved")).not.toBeChecked();
    expect(screen.getByLabelText("Current path")).toHaveTextContent(
      "/helprequest/edit/2",
    );
    expect(axiosMock.history.put).toHaveLength(1);
  });

  test("storybook mode shows a successful update without navigating", async () => {
    axiosMock.onPut("/api/helprequests").reply(200, { ...values, id: 2 });
    renderPage({ storybook: true });
    await screen.findByLabelText("Id");
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "HelpRequest Updated - id: 2",
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Edit HelpRequest" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Current path")).toHaveTextContent(
      "/helprequest/edit/2",
    );
  });

  test.each([404, 500])(
    "a GET %s shows an error instead of an empty editable form",
    async (status) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      axiosMock
        .onGet("/api/helprequests", { params: { id: "2" } })
        .reply(status);
      renderPage();
      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Unable to load this help request.",
      );
      expect(screen.getByRole("alert")).toHaveClass("alert-danger");
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "Error communicating with backend via GET on /api/helprequests",
      );
      expect(
        screen.queryByRole("button", { name: "Update" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Loading help request..."),
      ).not.toBeInTheDocument();
      expect(axiosMock.history.put).toHaveLength(0);
      expect(screen.getByLabelText("Current path")).toHaveTextContent(
        "/helprequest/edit/2",
      );
    },
  );
});
