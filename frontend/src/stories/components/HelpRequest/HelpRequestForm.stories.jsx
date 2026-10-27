import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

export default {
  title: "components/HelpRequest/HelpRequestForm",
  component: HelpRequestForm,
};

const submitAction = (data) => {
  window.alert("Submit was clicked with data: " + JSON.stringify(data));
};

export const Create = {
  args: { submitAction },
};

export const Update = {
  args: {
    initialContents: helpRequestFixtures.oneHelpRequest,
    buttonLabel: "Update",
    submitAction,
  },
};
