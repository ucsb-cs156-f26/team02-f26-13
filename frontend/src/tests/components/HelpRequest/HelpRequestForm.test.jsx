import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const navigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => navigate,
}));

const fields = {
  requesterEmail: "Requester Email",
  teamId: "Team Id",
  tableOrBreakoutRoom: "Table or Breakout Room",
  requestTime: "Request Time",
  explanation: "Explanation",
};

function renderForm(props = {}) {
  return render(
    <MemoryRouter>
      <HelpRequestForm {...props} />
    </MemoryRouter>,
  );
}

function fillForm(values = helpRequestFixtures.oneHelpRequest) {
  for (const [name, label] of Object.entries(fields)) {
    fireEvent.change(screen.getByLabelText(label), {
      target: { value: values[name] },
    });
  }
}

describe("HelpRequestForm", () => {
  beforeEach(() => vi.clearAllMocks());

  test("renders an empty create form with appropriate input controls", () => {
    renderForm();
    expect(screen.queryByLabelText("Id")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toHaveAttribute(
      "type",
      "submit",
    );
    for (const label of Object.values(fields)) {
      expect(screen.getByLabelText(label)).toHaveValue("");
      expect(screen.getByLabelText(label)).not.toHaveClass("is-invalid");
    }
    expect(screen.getByLabelText("Requester Email")).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByLabelText("Team Id")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Table or Breakout Room")).toHaveAttribute(
      "type",
      "text",
    );
    expect(screen.getByLabelText("Request Time")).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(screen.getByLabelText("Request Time")).toHaveAttribute("step", "1");
    expect(screen.getByLabelText("Explanation").tagName).toBe("TEXTAREA");
    expect(screen.getByLabelText("Explanation")).toHaveAttribute("rows", "3");
    expect(screen.getByLabelText("Solved")).toHaveAttribute("type", "checkbox");
    expect(screen.getByLabelText("Solved")).not.toBeChecked();
  });

  test.each(helpRequestFixtures.threeHelpRequests)(
    "prefills every field and preserves solved=$solved when editing id=$id",
    async (initialContents) => {
      const submitAction = vi.fn();
      renderForm({ initialContents, submitAction, buttonLabel: "Update" });
      const id = screen.getByLabelText("Id");
      expect(id).toHaveValue(String(initialContents.id));
      expect(id).toHaveAttribute("type", "text");
      expect(id).toHaveAttribute("readonly");
      for (const [name, label] of Object.entries(fields)) {
        const expected =
          name === "requestTime"
            ? initialContents[name].slice(0, 16)
            : initialContents[name];
        expect(screen.getByLabelText(label)).toHaveValue(expected);
      }
      expect(screen.getByLabelText("Solved").checked).toBe(
        initialContents.solved,
      );
      fireEvent.click(screen.getByRole("button", { name: "Update" }));
      await waitFor(() => expect(submitAction).toHaveBeenCalled());
      expect(submitAction.mock.calls[0][0]).toEqual(initialContents);
    },
  );

  test("blocks submission and identifies each missing required field", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    for (const message of [
      "Requester email is required.",
      "Team id is required.",
      "Table or breakout room is required.",
      "Request time is required.",
      "Explanation is required.",
    ]) {
      expect(await screen.findByText(message)).toBeInTheDocument();
    }
    for (const label of Object.values(fields)) {
      expect(screen.getByLabelText(label)).toHaveClass("is-invalid");
    }
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("rejects whitespace-only text fields", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    fillForm({
      ...helpRequestFixtures.oneHelpRequest,
      teamId: "   ",
      tableOrBreakoutRoom: "\t ",
      explanation: "\n ",
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(
      await screen.findByText("Team id cannot be blank."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Table or breakout room cannot be blank."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Explanation cannot be blank."),
    ).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
  });

  test.each([
    "bad-email",
    "@ucsb.edu",
    "a@",
    "a@ucsb",
    "a@.edu",
    "a@ucsb.",
    "a b@ucsb.edu",
    "a@uc sb.edu",
    "a@ucsb.e du",
    "a@@ucsb.edu",
    "a@ucsb.e@du",
  ])("rejects invalid email %j", async (email) => {
    const submitAction = vi.fn();
    renderForm({ submitAction });
    fillForm({ ...helpRequestFixtures.oneHelpRequest, requesterEmail: email });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Requester Email")).toHaveClass("is-invalid");
    expect(submitAction).not.toHaveBeenCalled();
  });

  test.each([false, true])(
    "submits valid create values with boolean solved=%s",
    async (solved) => {
      const submitAction = vi.fn();
      renderForm({ submitAction });
      const values = {
        ...helpRequestFixtures.oneHelpRequest,
        requestTime: "2026-10-23T09:42:37.123",
      };
      fillForm(values);
      if (solved) fireEvent.click(screen.getByLabelText("Solved"));
      fireEvent.click(screen.getByRole("button", { name: "Create" }));
      await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
      const { id: _id, ...expected } = values;
      expect(submitAction.mock.calls[0][0]).toEqual({ ...expected, solved });
      expect(
        screen.queryByText("Enter a valid email address."),
      ).not.toBeInTheDocument();
      for (const label of Object.values(fields)) {
        expect(screen.getByLabelText(label)).not.toHaveClass("is-invalid");
      }
    },
  );

  test("submits changed edit values and can clear a solved request", async () => {
    const submitAction = vi.fn();
    const initialContents = helpRequestFixtures.threeHelpRequests[1];
    renderForm({ initialContents, submitAction, buttonLabel: "Save" });
    fillForm(helpRequestFixtures.oneHelpRequest);
    fireEvent.click(screen.getByLabelText("Solved"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    expect(submitAction.mock.calls[0][0]).toEqual({
      ...helpRequestFixtures.oneHelpRequest,
      id: initialContents.id,
      requestTime: "2026-10-22T17:35",
    });
  });

  test("cancel goes back without submitting the form", () => {
    const submitAction = vi.fn();
    renderForm({
      initialContents: helpRequestFixtures.oneHelpRequest,
      submitAction,
    });
    const cancel = screen.getByRole("button", { name: "Cancel" });
    expect(cancel).toHaveAttribute("type", "button");
    expect(cancel).toHaveClass("btn-secondary");
    fireEvent.click(cancel);
    expect(navigate).toHaveBeenCalledExactlyOnceWith(-1);
    expect(submitAction).not.toHaveBeenCalled();
  });
});
