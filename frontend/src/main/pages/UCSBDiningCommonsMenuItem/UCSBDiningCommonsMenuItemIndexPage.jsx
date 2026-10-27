import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { Button } from "react-bootstrap";

export default function UCSBDiningCommonsMenuItemIndexPage() {
  const currentUser = useCurrentUser();

  const { data: menuItems } = useBackend(
    // Stryker disable next-line all : don't test internal React Query caching
    ["/api/UCSBDiningCommonsMenuItem/all"],
    {
      method: "GET",
      url: "/api/UCSBDiningCommonsMenuItem/all",
    },
    // Stryker disable next-line all : default empty list
    [],
  );

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/diningcommonsmenuitem/create"
          style={{ float: "right" }}
        >
          Create Menu Item
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>UCSB Dining Commons Menu Items</h1>
        <UCSBDiningCommonsMenuItemTable
          menuItems={menuItems}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
