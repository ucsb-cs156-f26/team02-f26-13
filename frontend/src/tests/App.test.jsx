import { fireEvent, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { renderWithUser } from "tests/testutils/renderWithUser";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("HelpRequest routes", () => {
  let axiosMock;
  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/helprequests/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);
    axiosMock
      .onGet("/api/helprequests")
      .reply((config) => [
        200,
        { ...helpRequestFixtures.oneHelpRequest, id: Number(config.params.id) },
      ]);
  });
  afterEach(() => {
    axiosMock.restore();
    vi.restoreAllMocks();
  });

  test.each([
    ["/helprequest", currentUserFixtures.userOnly, "HelpRequests"],
    ["/helprequest", currentUserFixtures.adminUser, "HelpRequests"],
    [
      "/helprequest/create",
      currentUserFixtures.adminUser,
      "Create New HelpRequest",
    ],
    ["/helprequest/edit/17", currentUserFixtures.adminUser, "Edit HelpRequest"],
  ])("allows an authorized user at %s", (route, currentUser, heading) => {
    renderWithUser(<App />, { route, currentUser });
    expect(
      screen.getByRole("heading", {
        name: heading,
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
        name: "HelpRequests",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Create HelpRequest" }));
    expect(
      await screen.findByRole("heading", {
        name: "Create New HelpRequest",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "HelpRequest" }));
    fireEvent.click(
      await screen.findByTestId("HelpRequestTable-cell-row-0-col-Edit-button"),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Edit HelpRequest",
      }),
    ).toBeInTheDocument();
  });

  test("an edited record appears in the index and reopening Edit loads saved values", async () => {
    let record = { ...helpRequestFixtures.oneHelpRequest };
    axiosMock.onGet("/api/helprequests/all").reply(() => [200, [record]]);
    axiosMock.onGet("/api/helprequests").reply(() => [200, record]);
    axiosMock.onPut("/api/helprequests").reply((config) => {
      record = { ...JSON.parse(config.data), id: Number(config.params.id) };
      return [200, record];
    });
    renderWithUser(<App />, { route: "/helprequest" });
    fireEvent.click(
      await screen.findByTestId("HelpRequestTable-cell-row-0-col-Edit-button"),
    );
    expect(await screen.findByLabelText("Id")).toHaveValue("1");
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Saved through the edit route" },
    });
    fireEvent.click(screen.getByLabelText("Solved"));
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    expect(
      await screen.findByRole("heading", { name: "HelpRequests" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByTestId("HelpRequestTable-cell-row-0-col-explanation"),
      ).toHaveTextContent("Saved through the edit route"),
    );
    expect(
      screen.getByTestId("HelpRequestTable-cell-row-0-col-solved"),
    ).toHaveTextContent("Yes");
    fireEvent.click(
      screen.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button"),
    );
    expect(await screen.findByLabelText("Explanation")).toHaveValue(
      "Saved through the edit route",
    );
    expect(screen.getByLabelText("Solved")).toBeChecked();
    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].params).toEqual({ id: "1" });
  });

  test("a created record appears in the index and can be deleted", async () => {
    let records = [];
    axiosMock.onGet("/api/helprequests/all").reply(() => [200, records]);
    axiosMock.onPost("/api/helprequests/post").reply((config) => {
      const record = { ...config.params, id: 41 };
      records = [record];
      return [200, record];
    });
    axiosMock
      .onDelete("/api/helprequests", { params: { id: 41 } })
      .reply(() => {
        records = [];
        return [200, { message: "HelpRequest with id 41 deleted" }];
      });
    renderWithUser(<App />, { route: "/helprequest/create" });
    for (const [label, value] of [
      ["Requester Email", "cgaucho@ucsb.edu"],
      ["Team Id", "f26-13"],
      ["Table or Breakout Room", "7"],
      ["Request Time", "2026-10-27T16:10"],
      ["Explanation", "Created from routed form"],
    ]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(
      await screen.findByRole("heading", { name: "HelpRequests" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("HelpRequestTable-cell-row-0-col-id"),
    ).toHaveTextContent("41");
    expect(
      screen.getByTestId("HelpRequestTable-cell-row-0-col-explanation"),
    ).toHaveTextContent("Created from routed form");
    fireEvent.click(
      screen.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button"),
    );
    await waitFor(() =>
      expect(
        screen.queryByTestId("HelpRequestTable-cell-row-0-col-id"),
      ).not.toBeInTheDocument(),
    );
    expect(axiosMock.history.post).toHaveLength(1);
    expect(axiosMock.history.post[0].params.solved).toBe(false);
    expect(axiosMock.history.delete[0].params).toEqual({ id: 41 });
  });
});
