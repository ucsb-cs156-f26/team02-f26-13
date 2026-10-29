import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemReviewEditPage({ storybook = false }) {
  const { id } = useParams();

  const {
    data: menuItemReview,
    _error,
    _status,
  } = useBackend([`/api/MenuItemReview?id=${id}`], {
    method: "GET",
    url: "/api/MenuItemReview",
    params: {
      id,
    },
  });

  const objectToAxiosPutParams = (menuItemReview) => ({
    url: "/api/MenuItemReview",
    method: "PUT",
    params: {
      id: menuItemReview.id,
    },
    data: JSON.stringify({
      itemId: Number(menuItemReview.itemId),
      reviewerEmail: menuItemReview.reviewerEmail,
      stars: Number(menuItemReview.stars),
      dateReviewed: menuItemReview.dateReviewed,
      comments: menuItemReview.comments,
    }),
  });

  const onSuccess = (menuItemReview) => {
    toast(
      `MenuItemReview Updated - id: ${menuItemReview.id} itemId: ${menuItemReview.itemId}`,
    );
  };

  const mutation = useBackendMutation(objectToAxiosPutParams, { onSuccess }, [
    `/api/MenuItemReview?id=${id}`,
  ]);

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/menuitemreview" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit MenuItemReview</h1>
        {menuItemReview && (
          <MenuItemReviewForm
            initialContents={menuItemReview}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
