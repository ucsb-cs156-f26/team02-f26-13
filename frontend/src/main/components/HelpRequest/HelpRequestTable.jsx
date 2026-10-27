import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/helpRequestUtils";

export default function HelpRequestTable({ helpRequests, currentUser }) {
  const navigate = useNavigate();
  const editCallback = (cell) => {
    navigate(`/helprequest/edit/${cell.row.original.id}`);
  };
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/helprequests/all"],
  );
  const deleteCallback = (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    { header: "Id", accessorKey: "id" },
    { header: "Requester Email", accessorKey: "requesterEmail" },
    { header: "Team Id", accessorKey: "teamId" },
    { header: "Table or Breakout Room", accessorKey: "tableOrBreakoutRoom" },
    { header: "Request Time", accessorKey: "requestTime" },
    { header: "Explanation", accessorKey: "explanation" },
    {
      header: "Solved",
      accessorKey: "solved",
      cell: (info) => (info.getValue() ? "Yes" : "No"),
    },
  ];
  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "HelpRequestTable"),
      ButtonColumn("Delete", "danger", deleteCallback, "HelpRequestTable"),
    );
  }

  return (
    <OurTable data={helpRequests} columns={columns} testid="HelpRequestTable" />
  );
}
