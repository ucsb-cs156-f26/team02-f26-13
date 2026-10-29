import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByText(/Item Id/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Reviewer Email/)).toBeInTheDocument();
    expect(screen.getByText(/Stars/)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed/)).toBeInTheDocument();
    expect(screen.getByText(/Comments/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a MenuItemReview", async () => {
    render(
      <Router>
        <MenuItemReviewForm
          initialContents={menuItemReviewFixtures.oneReview}
        />
      </Router>,
    );
    await screen.findByTestId(/MenuItemReviewForm-id/);
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(/MenuItemReviewForm-id/)).toHaveValue("1");
  });

  test("Correct Error messages on bad input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-reviewerEmail");
    const emailField = screen.getByTestId("MenuItemReviewForm-reviewerEmail");
    const starsField = screen.getByTestId("MenuItemReviewForm-stars");
    const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.change(emailField, { target: { value: "bad-input" } });
    fireEvent.change(starsField, { target: { value: "6" } });
    fireEvent.change(commentsField, { target: { value: "a".repeat(256) } });
    fireEvent.click(submitButton);

    await screen.findByText(/Must be a valid email./);
    expect(screen.getByText(/Stars must be at most 5./)).toBeInTheDocument();
    expect(screen.getByText(/Max length 255 characters./)).toBeInTheDocument();
  });

  test("Correct Error message when stars is below 0", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-stars");
    const starsField = screen.getByTestId("MenuItemReviewForm-stars");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.change(starsField, { target: { value: "-1" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Stars must be at least 0./);
    expect(screen.getByText(/Stars must be at least 0./)).toBeInTheDocument();
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-submit");
    const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Item Id is required./);
    expect(screen.getByText(/Reviewer Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Stars is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed is required./)).toBeInTheDocument();
    expect(screen.getByText(/Comments is required./)).toBeInTheDocument();
  });

  test("No Error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-itemId");

    fireEvent.change(screen.getByTestId("MenuItemReviewForm-itemId"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-reviewerEmail"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-dateReviewed"), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
      target: { value: "great pie" },
    });
    fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Must be a valid email./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Stars must be at most 5./),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/is required./)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReviewForm-cancel");
    const cancelButton = screen.getByTestId("MenuItemReviewForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
