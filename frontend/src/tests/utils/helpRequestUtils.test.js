import { toast } from "react-toastify";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/helpRequestUtils";

vi.mock("react-toastify", async () => ({
  ...(await vi.importActual("react-toastify")),
  toast: vi.fn(),
}));

describe("helpRequestUtils", () => {
  beforeEach(() => vi.clearAllMocks());

  test("uses the backend message as the success toast", () => {
    onDeleteSuccess({ message: "HelpRequest with id 17 deleted" });
    expect(toast).toHaveBeenCalledExactlyOnceWith(
      "HelpRequest with id 17 deleted",
    );
  });

  test("builds DELETE parameters using the selected row id", () => {
    expect(cellToAxiosParamsDelete({ row: { original: { id: 17 } } })).toEqual({
      url: "/api/helprequests",
      method: "DELETE",
      params: { id: 17 },
    });
  });
});
