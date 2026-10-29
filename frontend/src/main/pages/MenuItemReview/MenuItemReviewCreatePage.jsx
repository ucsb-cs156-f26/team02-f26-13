import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function MenuItemReviewCreatePage({ storybook = false }) {
  const objectToAxiosParams = (menuItemReview) => ({
    url: "/api/MenuItemReview/post",
    method: "POST",
    params: {
      itemId: Number(menuItemReview.itemId),
      reviewerEmail: menuItemReview.reviewerEmail,
      stars: Number(menuItemReview.stars),
      dateReviewed: menuItemReview.dateReviewed,
      comments: menuItemReview.comments,
    },
  });

  const onSuccess = (menuItemReview) => {
    toast(
      `New menuItemReview Created - id: ${menuItemReview.id} itemId: ${menuItemReview.itemId}`,
    );
  };

  // Stryker disable next-line all
  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    // Stryker disable next-line all
    "/api/MenuItemReview/all",
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
        <h1>Create New MenuItemReview</h1>
        <MenuItemReviewForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
