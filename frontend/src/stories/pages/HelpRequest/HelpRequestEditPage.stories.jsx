import { useState } from "react";
import { Navigate, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { delay, http, HttpResponse } from "msw";

function EditStory(args) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route
          path="/helprequest/edit/:id"
          element={<HelpRequestEditPage {...args} />}
        />
        <Route
          path="*"
          element={<Navigate to="/helprequest/edit/1" replace />}
        />
      </Routes>
    </QueryClientProvider>
  );
}

export default {
  title: "pages/HelpRequest/HelpRequestEditPage",
  component: HelpRequestEditPage,
  args: { storybook: true },
  render: (args, { id }) => <EditStory key={id} {...args} />,
};

function makeStory({
  saveError = false,
  loadStatus = 200,
  loading = false,
} = {}) {
  let record = { ...helpRequestFixtures.oneHelpRequest };
  return {
    beforeEach: () => {
      record = { ...helpRequestFixtures.oneHelpRequest };
    },
    parameters: {
      msw: {
        handlers: [
          http.get("/api/currentUser", () =>
            HttpResponse.json(apiCurrentUserFixtures.adminUser),
          ),
          http.get("/api/systemInfo", () =>
            HttpResponse.json(systemInfoFixtures.showingNeither),
          ),
          http.get("/api/helprequests", async () => {
            if (loading) await delay("infinite");
            return HttpResponse.json(record, { status: loadStatus });
          }),
          http.put("/api/helprequests", async ({ request }) => {
            if (saveError)
              return HttpResponse.json(
                { message: "Unable to update HelpRequest" },
                { status: 500 },
              );
            record = {
              ...(await request.json()),
              id: Number(new URL(request.url).searchParams.get("id")),
            };
            return HttpResponse.json(record);
          }),
        ],
      },
    },
  };
}

export const Default = makeStory();
export const SaveError = makeStory({ saveError: true });
export const NotFound = makeStory({ loadStatus: 404 });
export const Loading = makeStory({ loading: true });
