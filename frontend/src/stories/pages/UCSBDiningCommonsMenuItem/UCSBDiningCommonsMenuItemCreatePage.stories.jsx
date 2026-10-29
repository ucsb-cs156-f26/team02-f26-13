import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";

export default {
  title: "pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage",
  component: UCSBDiningCommonsMenuItemCreatePage,
};

const Template = () => <UCSBDiningCommonsMenuItemCreatePage storybook={true} />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/UCSBDiningCommonsMenuItem/post", () => {
      return HttpResponse.json(
        {
          id: 17,
          diningCommonsCode: "carrillo",
          name: "Pizza",
          station: "Pizza Station",
        },
        { status: 200 },
      );
    }),
  ],
};
