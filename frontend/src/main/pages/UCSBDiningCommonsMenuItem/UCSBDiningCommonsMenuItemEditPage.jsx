import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { Navigate, useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBDiningCommonsMenuItemEditPage({
  storybook = false,
}) {
  const { id } = useParams();

  const { data: menuItem } = useBackend(
    // Stryker disable next-line all : React Query caching
    [`/api/UCSBDiningCommonsMenuItem?id=${id}`],
    {
      // Stryker disable next-line StringLiteral : Axios defaults to GET
      method: "GET",
      url: "/api/UCSBDiningCommonsMenuItem",
      params: { id },
    },
  );

  const objectToAxiosPutParams = (data) => ({
    url: "/api/UCSBDiningCommonsMenuItem",
    method: "PUT",
    params: { id: data.id },
    data: {
      diningCommonsCode: data.diningCommonsCode,
      name: data.name,
      station: data.station,
    },
  });

  const onSuccess = (updatedItem) => {
    toast(
      `Menu item updated - id: ${updatedItem.id} name: ${updatedItem.name}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : React Query caching
    ["/api/UCSBDiningCommonsMenuItem/all"],
  );

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess && !storybook) {
    return <Navigate to="/diningcommonsmenuitem" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSB Dining Commons Menu Item</h1>
        {menuItem && (
          <UCSBDiningCommonsMenuItemForm
            initialContents={menuItem}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
