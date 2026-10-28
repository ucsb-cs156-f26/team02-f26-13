import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { Navigate, useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-bootstrap";
import { toast } from "react-toastify";

export default function HelpRequestEditPage({ storybook = false }) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const queryKey = [`/api/helprequests?id=${id}`];
  const {
    data: helpRequest,
    isPending,
    isError,
  } = useBackend(queryKey, {
    method: "GET",
    url: "/api/helprequests",
    params: { id },
  });
  const objectToAxiosParams = (data) => ({
    url: "/api/helprequests",
    method: "PUT",
    params: { id },
    data: {
      requesterEmail: data.requesterEmail,
      teamId: data.teamId,
      tableOrBreakoutRoom: data.tableOrBreakoutRoom,
      requestTime: data.requestTime,
      explanation: data.explanation,
      solved: data.solved,
    },
  });
  const onSuccess = (updated) => {
    toast(`HelpRequest Updated - id: ${updated.id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/helprequests/all"] });
  };
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    queryKey,
  );
  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess && !storybook) {
    return <Navigate to="/helprequest" />;
  }

  return (
    <BasicLayout>
      <h1>Edit HelpRequest</h1>
      {isPending && <p>Loading help request...</p>}
      {isError && (
        <Alert variant="danger">Unable to load this help request.</Alert>
      )}
      {helpRequest && (
        <HelpRequestForm
          initialContents={helpRequest}
          submitAction={onSubmit}
          buttonLabel="Update"
        />
      )}
    </BasicLayout>
  );
}
