import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/UCSBOrganizationUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function UCSBOrganizationTable({ organizations, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/ucsborganization/edit/${cell.row.original.orgCode}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/ucsborganizations/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "Org Code",
      accessorKey: "orgCode",
    },
    {
      header: "Short Translation",
      accessorKey: "orgTranslationShort",
    },
    {
      header: "Translation",
      accessorKey: "orgTranslation",
    },
    {
      header: "Inactive",
      accessorKey: "inactive",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "UCSBOrganizationTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "UCSBOrganizationTable"),
    );
  }

  return (
    <OurTable
      data={organizations}
      columns={columns}
      testid={"UCSBOrganizationTable"}
    />
  );
}
