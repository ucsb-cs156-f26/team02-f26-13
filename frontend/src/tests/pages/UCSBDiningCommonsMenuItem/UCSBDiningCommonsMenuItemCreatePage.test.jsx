import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = () => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders the form with all required fields", async () => {
    renderPage();

    expect(
      await screen.findByText("Create New UCSB Dining Commons Menu Item"),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Dining Commons Code")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Station")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  test("valid submission calls backend and redirects to index page", async () => {
    axiosMock.onPost("/api/UCSBDiningCommonsMenuItem/post").reply(200, {
      id: 17,
      diningCommonsCode: "carrillo",
      name: "Pizza",
      station: "Pizza Station",
    });

    renderPage();

    fireEvent.change(screen.getByLabelText("Dining Commons Code"), {
      target: { value: "carrillo" },
    });

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Pizza" },
    });

    fireEvent.change(screen.getByLabelText("Station"), {
      target: { value: "Pizza Station" },
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });

    expect(axiosMock.history.post[0].params).toEqual({
      diningCommonsCode: "carrillo",
      name: "Pizza",
      station: "Pizza Station",
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New menu item created - id: 17 name: Pizza",
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/diningcommonsmenuitem",
      });
    });
  });

  test("empty submission displays errors without calling backend", async () => {
    renderPage();

    fireEvent.click(screen.getByText("Create"));

    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Station is required.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("whitespace-only fields are rejected", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Dining Commons Code"), {
      target: { value: "carrillo" },
    });
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByLabelText("Station"), {
      target: { value: "Pizza Station" },
    });

    fireEvent.click(screen.getByText("Create"));

    expect(
      await screen.findByText("Name cannot be blank."),
    ).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
