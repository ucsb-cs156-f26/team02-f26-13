import { Link } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { Alert, Button } from "react-bootstrap";
import { useBackend } from "main/utils/useBackend";
import { hasRole, useCurrentUser } from "main/utils/useCurrentUser";

export default function HelpRequestIndexPage() {
  const currentUser = useCurrentUser();
  const { data: helpRequests, error } = useBackend(
    ["/api/helprequests/all"],
    { method: "GET", url: "/api/helprequests/all" },
    [],
  );

  return (
    <BasicLayout>
      <h1>HelpRequests</h1>
      {hasRole(currentUser, "ROLE_ADMIN") && (
        <p>
          <Button as={Link} to="/helprequest/create" variant="primary">
            Create HelpRequest
          </Button>
        </p>
      )}
      {error && <Alert variant="danger">Unable to load help requests.</Alert>}
      <HelpRequestTable helpRequests={helpRequests} currentUser={currentUser} />
    </BasicLayout>
  );
}
