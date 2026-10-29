import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function RecommendationRequestIndexPage() {
  // Stryker disable all : recommendationRequest for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Index page not yet implemented</h1>
        <p>
          <a href="/recommendationRequest/create">Create</a>
        </p>
        <p>
          <a href="/recommendationRequest/edit/1">Edit</a>
        </p>
      </div>
    </BasicLayout>
  );
}
