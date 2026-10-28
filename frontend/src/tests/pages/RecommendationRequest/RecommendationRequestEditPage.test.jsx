import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("RecommendationRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationRequest", { params: { id: 17 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit RecommendationRequest");
      expect(
        screen.queryByTestId("RecommendationRequest-requesterEmail"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationRequest", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "req@ucsb.edu",
          professorEmail: "prof@ucsb.edu",
          explanation: "real usable explaination",
          dateRequested: "2022-02-02T00:00",
          dateNeeded: "2022-03-02T00:00",
          done: true,
        });
      axiosMock.onPut("/api/recommendationRequest").reply(200, {
        id: "17",
        requesterEmail: "2req@ucsb.edu",
        professorEmail: "2prof@ucsb.edu",
        explanation: "2real usable explaination",
        dateRequested: "4022-02-02T00:00",
        dateNeeded: "4022-03-02T00:00",
        done: false,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const reqEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const profEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const explainField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const dateReqField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeedField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit",
      );

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(reqEmailField).toBeInTheDocument();
      expect(reqEmailField).toHaveValue("req@ucsb.edu");
      expect(profEmailField).toBeInTheDocument();
      expect(profEmailField).toHaveValue("prof@ucsb.edu");
      expect(explainField).toBeInTheDocument();
      expect(explainField).toHaveValue("real usable explaination");
      expect(dateReqField).toBeInTheDocument();
      expect(dateReqField).toHaveValue("2022-02-02T00:00");
      expect(dateNeedField).toBeInTheDocument();
      expect(dateNeedField).toHaveValue("2022-03-02T00:00");
      expect(doneField).toBeInTheDocument();
      expect(doneField).toBeChecked();

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(reqEmailField, {
        target: { value: "2req@ucsb.edu" },
      });
      fireEvent.change(profEmailField, {
        target: { value: "2prof@ucsb.edu" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 17 Requester Email: 2req@ucsb.edu",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/recommendationRequest" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "2req@ucsb.edu",
          professorEmail: "2prof@ucsb.edu",
          explanation: "real usable explaination",
          dateRequested: "2022-02-02T00:00",
          dateNeeded: "2022-03-02T00:00",
          done: true,
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const reqEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const profEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const explainField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const dateReqField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeedField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit",
      );

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(reqEmailField).toBeInTheDocument();
      expect(reqEmailField).toHaveValue("req@ucsb.edu");
      expect(profEmailField).toBeInTheDocument();
      expect(profEmailField).toHaveValue("prof@ucsb.edu");
      expect(explainField).toBeInTheDocument();
      expect(explainField).toHaveValue("real usable explaination");
      expect(dateReqField).toBeInTheDocument();
      expect(dateReqField).toHaveValue("2022-02-02T00:00");
      expect(dateNeedField).toBeInTheDocument();
      expect(dateNeedField).toHaveValue("2022-03-02T00:00");
      expect(doneField).toBeInTheDocument();
      expect(doneField).toBeChecked();

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(reqEmailField, {
        target: { value: "2req@ucsb.edu" },
      });
      fireEvent.change(profEmailField, { target: { value: "2prof@ucsb.edu" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 17 Requester Email: 2req@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationRequest" });
    });
  });
});
