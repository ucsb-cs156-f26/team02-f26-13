import { toast } from "react-toastify";

// Stryker disable next-line all
export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    // Stryker disable next-line all
    url: "/api/MenuItemReview",
    method: "DELETE",
    params: {
      id: cell.row.original.id,
    },
  };
}