import { Link } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function HelpRequestIndexPage() {
  return (
    <BasicLayout>
      <h1>HelpRequest index page not yet implemented</h1>
      <p>
        <Link to="/helprequest/create">Create</Link>
      </p>
      <p>
        <Link to="/helprequest/edit/1">Edit</Link>
      </p>
    </BasicLayout>
  );
}
