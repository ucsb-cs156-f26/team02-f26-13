import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/HelpRequest/HelpRequestIndexPage",
  component: HelpRequestIndexPage,
};

function makeStory(user, initialRequests) {
  let requests = [...initialRequests];
  return {
    beforeEach: () => {
      requests = [...initialRequests];
    },
    parameters: {
      msw: {
        handlers: [
          http.get("/api/currentUser", () => HttpResponse.json(user)),
          http.get("/api/systemInfo", () =>
            HttpResponse.json(systemInfoFixtures.showingNeither),
          ),
          http.get("/api/helprequests/all", () => HttpResponse.json(requests)),
          http.delete("/api/helprequests", ({ request }) => {
            const id = Number(new URL(request.url).searchParams.get("id"));
            requests = requests.filter((item) => item.id !== id);
            return HttpResponse.json({
              message: `HelpRequest with id ${id} deleted`,
            });
          }),
        ],
      },
    },
  };
}

export const Empty = makeStory(apiCurrentUserFixtures.adminUser, []);
export const ThreeItemsOrdinaryUser = makeStory(
  apiCurrentUserFixtures.userOnly,
  helpRequestFixtures.threeHelpRequests,
);
export const ThreeItemsAdminUser = makeStory(
  apiCurrentUserFixtures.adminUser,
  helpRequestFixtures.threeHelpRequests,
);
