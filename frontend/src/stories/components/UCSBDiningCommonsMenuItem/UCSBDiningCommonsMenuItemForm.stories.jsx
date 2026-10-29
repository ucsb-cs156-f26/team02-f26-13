import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

export default {
  title: "components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm",
  component: UCSBDiningCommonsMenuItemForm,
};

const Template = (args) => {
  return <UCSBDiningCommonsMenuItemForm {...args} />;
};

const submitAction = (data) => {
  console.log("Submit was clicked with data: ", data);
  window.alert("Submit was clicked with data: " + JSON.stringify(data));
};

export const Create = Template.bind({});

Create.args = {
  buttonLabel: "Create",
  submitAction,
};

export const Update = Template.bind({});

Update.args = {
  initialContents: ucsbDiningCommonsMenuItemFixtures.oneMenuItem[0],
  buttonLabel: "Update",
  submitAction,
};
