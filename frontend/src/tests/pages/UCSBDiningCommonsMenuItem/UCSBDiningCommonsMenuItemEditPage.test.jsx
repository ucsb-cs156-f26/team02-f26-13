import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";
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

const mockRedirect = vi.fn();
const mockGoBack = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: () => ({ id: "3" }),
    useNavigate: () => mockGoBack,
    Navigate: vi.fn((props) => {
      mockRedirect(props);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const apiUrl = "/api/UCSBDiningCommonsMenuItem";
  const prefix = "UCSBDiningCommonsMenuItemForm";

  const existingItem = {
    id: 3,
    diningCommonsCode: "carrillo",
    name: "AK Create Page Test",
    station: "Test Station",
  };

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

    axiosMock.onGet(apiUrl).reply(200, existingItem);
  });

  afterAll(() => {
    axiosMock.restore();
  });

  const renderPage = (storybook) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemEditPage storybook={storybook} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("loads the existing record into the form", async () => {
    renderPage();

    const nameField = await screen.findByTestId(`${prefix}-name`);

    expect(
      screen.getByText("Edit UCSB Dining Commons Menu Item"),
    ).toBeInTheDocument();

    expect(screen.getByTestId(`${prefix}-id`)).toHaveValue("3");
    expect(screen.getByTestId(`${prefix}-id`)).toHaveAttribute("readonly");

    expect(screen.getByTestId(`${prefix}-diningCommonsCode`)).toHaveValue(
      "carrillo",
    );

    expect(nameField).toHaveValue("AK Create Page Test");

    expect(screen.getByTestId(`${prefix}-station`)).toHaveValue("Test Station");

    expect(screen.getByTestId(`${prefix}-submit`)).toHaveTextContent("Update");

    expect(
      axiosMock.history.get.some(
        (request) => request.url === apiUrl && request.params?.id === "3",
      ),
    ).toBe(true);
  });

  test("valid updates are sent to backend and redirect to index", async () => {
    const updatedItem = {
      id: 3,
      diningCommonsCode: "portola",
      name: "Updated Menu Item",
      station: "Updated Station",
    };

    axiosMock.onPut(apiUrl).reply(200, updatedItem);

    renderPage();

    await screen.findByTestId(`${prefix}-name`);

    fireEvent.change(screen.getByTestId(`${prefix}-diningCommonsCode`), {
      target: { value: "portola" },
    });

    fireEvent.change(screen.getByTestId(`${prefix}-name`), {
      target: { value: "Updated Menu Item" },
    });

    fireEvent.change(screen.getByTestId(`${prefix}-station`), {
      target: { value: "Updated Station" },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    const request = axiosMock.history.put[0];

    expect(request.url).toBe(apiUrl);
    expect(request.method).toBe("put");
    expect(String(request.params.id)).toBe("3");

    expect(JSON.parse(request.data)).toEqual({
      diningCommonsCode: "portola",
      name: "Updated Menu Item",
      station: "Updated Station",
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "Menu item updated - id: 3 name: Updated Menu Item",
      );

      expect(mockRedirect).toHaveBeenCalledWith({
        to: "/diningcommonsmenuitem",
      });
    });
  });

  test("empty required field prevents saving", async () => {
    renderPage();

    const nameField = await screen.findByTestId(`${prefix}-name`);

    fireEvent.change(nameField, {
      target: { value: "" },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();

    expect(axiosMock.history.put.length).toBe(0);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test("whitespace-only field prevents saving", async () => {
    renderPage();

    const stationField = await screen.findByTestId(`${prefix}-station`);

    fireEvent.change(stationField, {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    expect(
      await screen.findByText("Station cannot be blank."),
    ).toBeInTheDocument();

    expect(axiosMock.history.put.length).toBe(0);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test("values over 255 characters are rejected", async () => {
    renderPage();

    const nameField = await screen.findByTestId(`${prefix}-name`);

    fireEvent.change(nameField, {
      target: { value: "X".repeat(256) },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    expect(
      await screen.findByText("Name must be 255 characters or fewer."),
    ).toBeInTheDocument();

    expect(axiosMock.history.put.length).toBe(0);
  });

  test("Cancel navigates back without saving", async () => {
    renderPage();

    const nameField = await screen.findByTestId(`${prefix}-name`);

    fireEvent.change(nameField, {
      target: { value: "Unsaved Changes" },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-cancel`));

    expect(mockGoBack).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.put.length).toBe(0);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  test("storybook mode keeps the form visible after successful update", async () => {
    axiosMock.onPut(apiUrl).reply(200, existingItem);

    renderPage(true);

    await screen.findByTestId(`${prefix}-name`);

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(mockToast).toHaveBeenCalled();
    });

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(screen.getByTestId(`${prefix}-name`)).toBeInTheDocument();
  });
});
