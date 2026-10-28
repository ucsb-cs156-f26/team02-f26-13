import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function ArticlesIndexPage() {
  // Stryker disable all : Articles Index Page
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Articles Index Page</h1>
        <p>
          <a href="/articles/create">Create</a>
        </p>
        <p>
          <a href="/articles/edit/1">Edit</a>
        </p>
      </div>
    </BasicLayout>
  );
}
