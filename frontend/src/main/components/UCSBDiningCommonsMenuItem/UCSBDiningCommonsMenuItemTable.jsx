import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function UCSBDiningCommonsMenuItemTable({
  menuItems,
  currentUser,
}) {
  const navigate = useNavigate();
  const testIdPrefix = "UCSBDiningCommonsMenuItemTable";

  const editCallback = (cell) => {
    navigate(`/diningcommonsmenuitem/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test query caching
  const deleteMutation = useBackendMutation(
    (cell) => ({
      url: "/api/UCSBDiningCommonsMenuItem",
      method: "DELETE",
      params: { id: cell.row.original.id },
    }),
    {},
    ["/api/UCSBDiningCommonsMenuItem/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all
  const deleteCallback = (cell) => deleteMutation.mutate(cell);

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Dining Commons Code", accessorKey: "diningCommonsCode" },
    { header: "Name", accessorKey: "name" },
    { header: "Station", accessorKey: "station" },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return <OurTable data={menuItems} columns={columns} testid={testIdPrefix} />;
}
