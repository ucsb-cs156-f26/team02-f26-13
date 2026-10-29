import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Link, Route, Routes, useLocation } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { renderWithUser } from "tests/testutils/renderWithUser";

vi.mock("react-toastify", async () => ({
  ...(await vi.importActual("react-toastify")),
  toast: vi.fn(),
}));

const values = {
  requesterEmail: "kuncheng@ucsb.edu",
  teamId: "f26-13",
  tableOrBreakoutRoom: "7",
  requestTime: "2026-10-27T12:15",
  explanation: "Need help testing the create page",
  solved: false,
};

function CurrentPath() {
  return <output aria-label="Current path">{useLocation().pathname}</output>;
}

function renderPage({ storybook, route = "/helprequest/create" } = {}) {
  return renderWithUser(
    <>
      <Routes>
        <Route
          path="/helprequest"
          element={
            <>
              <h1>HelpRequest list</h1>
              <Link to="/helprequest/create">Open Create</Link>
            </>
          }
        />
        <Route
          path="/helprequest/create"
          element={<HelpRequestCreatePage storybook={storybook} />}
        />
      </Routes>
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
  ]) {
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: input[key] },
    });
  }
  if (input.solved) fireEvent.click(screen.getByLabelText("Solved"));
}

describe("HelpRequestCreatePage", () => {
  let axiosMock;
  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock = new AxiosMockAdapter(axios);
  });
  afterEach(() => axiosMock.restore());

  test("renders the create form without an id", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "Create New HelpRequest" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Requester Email")).toHaveValue("");
    expect(screen.queryByLabelText("Id")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    expect(screen.getByLabelText("Current path")).toHaveTextContent(
      "/helprequest/create",
    );
  });

  test("missing values show errors without making a POST or leaving the page", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();
    for (const message of [
      "Team id is required.",
      "Table or breakout room is required.",
      "Request time is required.",
      "Explanation is required.",
    ]) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }
    expect(axiosMock.history.post).toHaveLength(0);
    expect(screen.getByLabelText("Current path")).toHaveTextContent(
      "/helprequest/create",
    );
  });

  test("invalid values stay on the page and are not sent to the server", async () => {
    renderPage();
    fillForm({ ...values, requesterEmail: "bad-email", teamId: "   " });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByText("Team id cannot be blank.")).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
    expect(screen.getByLabelText("Current path")).toHaveTextContent(
      "/helprequest/create",
    );
  });

  test.each([false, true])(
    "creates with solved=%s, invalidates the list, and returns to the index",
    async (solved) => {
      const created = { ...values, solved, id: 17 };
      axiosMock.onPost("/api/helprequests/post").reply(200, created);
      const { queryClient } = renderPage();
      queryClient.setQueryData(["/api/helprequests/all"], []);
      queryClient.setQueryData(["/api/restaurants/all"], []);
      fillForm({ ...values, solved });
      fireEvent.click(screen.getByRole("button", { name: "Create" }));
      expect(
        await screen.findByRole("heading", { name: "HelpRequest list" }),
      ).toBeInTheDocument();
      expect(axiosMock.history.post).toHaveLength(1);
      expect(axiosMock.history.post[0].params).toEqual({ ...values, solved });
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "New HelpRequest Created - id: 17",
      );
      expect(screen.getByLabelText("Current path")).toHaveTextContent(
        /^\/helprequest$/,
      );
      await waitFor(() =>
        expect(
          queryClient.getQueryState(["/api/helprequests/all"]).isInvalidated,
        ).toBe(true),
      );
      expect(
        queryClient.getQueryState(["/api/restaurants/all"]).isInvalidated,
      ).toBe(false);
    },
  );

  test("storybook mode shows success without navigating away", async () => {
    axiosMock
      .onPost("/api/helprequests/post")
      .reply(200, { ...values, id: 27 });
    renderPage({ storybook: true });
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledExactlyOnceWith(
        "New HelpRequest Created - id: 27",
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Create New HelpRequest" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Current path")).toHaveTextContent(
      "/helprequest/create",
    );
    expect(axiosMock.history.post).toHaveLength(1);
  });

  test("a backend error keeps the user's input and does not navigate", async () => {
    axiosMock.onPost("/api/helprequests/post").reply(500);
    renderPage();
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
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
    expect(
      screen.getByRole("heading", { name: "Create New HelpRequest" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Current path")).toHaveTextContent(
      "/helprequest/create",
    );
    expect(axiosMock.history.post).toHaveLength(1);
  });

  test("Cancel returns to the previous page without creating a record", async () => {
    renderPage({ route: "/helprequest" });
    fireEvent.click(screen.getByRole("link", { name: "Open Create" }));
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      await screen.findByRole("heading", { name: "HelpRequest list" }),
    ).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(0);
  });
});
