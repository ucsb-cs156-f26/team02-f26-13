import React from "react";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { ucsbOrganizationsFixtures } from "fixtures/ucsbOrganizationsFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/UCSBOrganization/UCSBOrganizationTable",
  component: UCSBOrganizationTable,
};

const Template = (args) => {
  return <UCSBOrganizationTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  organizations: [],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  organizations: ucsbOrganizationsFixtures.threeOrganizations,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  organizations: ucsbOrganizationsFixtures.threeOrganizations,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/ucsborganization", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
