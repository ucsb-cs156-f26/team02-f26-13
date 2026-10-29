import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 1,
      title: "Using testing-playground with React Testing Library",
      url: "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
      explanation: "Helpful when we get to front end development",
      email: "phtcon@ucsb.edu",
      dateAdded: "2022-04-20T00:00:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    const titleField = screen.getByTestId("ArticlesForm-title");
    const urlField = screen.getByTestId("ArticlesForm-url");
    const explanationField = screen.getByTestId("ArticlesForm-explanation");
    const emailField = screen.getByTestId("ArticlesForm-email");
    const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
    const submitButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.change(titleField, {
      target: { value: "Using testing-playground with React Testing Library" },
    });
    fireEvent.change(urlField, {
      target: {
        value:
          "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
      },
    });
    fireEvent.change(explanationField, {
      target: { value: "Helpful when we get to front end development" },
    });
    fireEvent.change(emailField, { target: { value: "phtcon@ucsb.edu" } });
    fireEvent.change(dateAddedField, {
      target: { value: "2022-04-20T00:00:00" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Using testing-playground with React Testing Library",
      url: "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
      explanation: "Helpful when we get to front end development",
      email: "phtcon@ucsb.edu",
      dateAdded: "2022-04-20T00:00:00",
    });

    expect(mockToast).toBeCalledWith(
      "New article Created - id: 1 title: Using testing-playground with React Testing Library",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});
