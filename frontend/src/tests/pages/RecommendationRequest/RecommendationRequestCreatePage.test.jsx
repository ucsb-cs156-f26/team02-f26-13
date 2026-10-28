import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /recommendationRequest", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      id: 3,
      requesterEmail: "req@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "real usable explaination",
      dateRequested: "2022-02-02T00:00",
      dateNeeded: "2022-03-02T00:00",
      done: true,
    };

    axiosMock
      .onPost("/api/recommendationRequest/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const reqEmailInput = screen.getByLabelText("Requester Email");
    expect(reqEmailInput).toBeInTheDocument();

    const profEmailInput = screen.getByLabelText("Professor Email");
    expect(profEmailInput).toBeInTheDocument();

    const explainInput = screen.getByLabelText("Explaination");
    expect(explainInput).toBeInTheDocument();

    const dateReqInput = screen.getByLabelText("Date Requested (iso format)");
    expect(dateReqInput).toBeInTheDocument();

    const dateNeedInput = screen.getByLabelText("Date Needed (iso format)");
    expect(dateNeedInput).toBeInTheDocument();

    const doneInput = screen.getByLabelText("Done");
    expect(doneInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(reqEmailInput, {
      target: { value: "req@ucsb.edu" },
    });
    fireEvent.change(profEmailInput, {
      target: { value: "prof@ucsb.edu" },
    });
    fireEvent.change(explainInput, {
      target: { value: "real usable explaination" },
    });
    fireEvent.change(dateReqInput, {
      target: { value: "2022-02-02T00:00" },
    });
    fireEvent.change(dateNeedInput, {
      target: { value: "2022-03-02T00:00" },
    });
    fireEvent.click(doneInput);
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "req@ucsb.edu",
      professorEmail: "prof@ucsb.edu",
      explanation: "real usable explaination",
      dateRequested: "2022-02-02T00:00",
      dateNeeded: "2022-03-02T00:00",
      done: true,
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New recommendationRequest Created - id: 3 requester email: req@ucsb.edu",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationRequest" });
  });
});
