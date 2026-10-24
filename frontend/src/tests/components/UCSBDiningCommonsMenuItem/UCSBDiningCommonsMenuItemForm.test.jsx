import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  const testId = "UCSBDiningCommonsMenuItemForm";

  const renderForm = (props = {}) => {
    return render(
      <Router>
        <UCSBDiningCommonsMenuItemForm submitAction={vi.fn()} {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders create form with empty fields and no ID", () => {
    renderForm();

    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Create");
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();

    expect(screen.getByLabelText("Dining Commons Code")).toHaveValue("");
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Station")).toHaveValue("");
  });

  test("renders update form with initial contents", () => {
    const item = ucsbDiningCommonsMenuItemFixtures.oneMenuItem[0];

    renderForm({
      initialContents: item,
      buttonLabel: "Update",
    });

    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Update");
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toHaveAttribute("readonly");

    expect(screen.getByLabelText("Dining Commons Code")).toHaveValue(
      item.diningCommonsCode,
    );
    expect(screen.getByLabelText("Name")).toHaveValue(item.name);
    expect(screen.getByLabelText("Station")).toHaveValue(item.station);
  });

  test("requires all three fields", async () => {
    renderForm();

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Station is required.")).toBeInTheDocument();
  });

  test("rejects whitespace-only values", async () => {
    renderForm();

    for (const field of ["diningCommonsCode", "name", "station"]) {
      fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
        target: { value: "   " },
      });
    }

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Dining Commons Code cannot be blank."),
    ).toBeInTheDocument();
    expect(screen.getByText("Name cannot be blank.")).toBeInTheDocument();
    expect(screen.getByText("Station cannot be blank.")).toBeInTheDocument();
  });

  test("rejects values longer than 255 characters", async () => {
    renderForm();

    for (const field of ["diningCommonsCode", "name", "station"]) {
      fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
        target: { value: "a".repeat(256) },
      });
    }

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText(
        "Dining Commons Code must be 255 characters or fewer.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Name must be 255 characters or fewer."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Station must be 255 characters or fewer."),
    ).toBeInTheDocument();
  });

  test("submits valid create form data", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-diningCommonsCode`), {
      target: { value: "carrillo" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-name`), {
      target: { value: "Pizza" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-station`), {
      target: { value: "Pizza Station" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });

    expect(submitAction.mock.calls[0][0]).toMatchObject({
      diningCommonsCode: "carrillo",
      name: "Pizza",
      station: "Pizza Station",
    });
  });

  test("accepts exactly 255 characters", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    for (const field of ["diningCommonsCode", "name", "station"]) {
      fireEvent.change(screen.getByTestId(`${testId}-${field}`), {
        target: { value: "a".repeat(255) },
      });
    }

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });
  });

  test("submits updated data with the existing ID", async () => {
    const submitAction = vi.fn();

    renderForm({
      initialContents: ucsbDiningCommonsMenuItemFixtures.oneMenuItem[0],
      buttonLabel: "Update",
      submitAction,
    });

    fireEvent.change(screen.getByTestId(`${testId}-name`), {
      target: { value: "Updated Pizza" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });

    expect(submitAction.mock.calls[0][0]).toMatchObject({
      id: 1,
      diningCommonsCode: "carrillo",
      name: "Updated Pizza",
      station: "Pizza Station",
    });
  });

  test("Cancel navigates back", async () => {
    renderForm();

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
