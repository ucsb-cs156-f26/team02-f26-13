import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/HelpRequest/HelpRequestTable",
  component: HelpRequestTable,
};

export const Empty = {
  args: { helpRequests: [], currentUser: currentUserFixtures.userOnly },
};

export const ThreeItemsOrdinaryUser = {
  args: {
    helpRequests: helpRequestFixtures.threeHelpRequests,
    currentUser: currentUserFixtures.userOnly,
  },
};

export const ThreeItemsAdminUser = {
  args: {
    helpRequests: helpRequestFixtures.threeHelpRequests,
    currentUser: currentUserFixtures.adminUser,
  },
  parameters: {
    msw: {
      handlers: [
        http.delete("/api/helprequests", ({ request }) => {
          const id = new URL(request.url).searchParams.get("id");
          return HttpResponse.json({
            message: `HelpRequest with id ${id} deleted`,
          });
        }),
      ],
    },
  },
};
