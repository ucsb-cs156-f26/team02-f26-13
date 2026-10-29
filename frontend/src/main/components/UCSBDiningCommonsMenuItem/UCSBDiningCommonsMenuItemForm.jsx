import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBDiningCommonsMenuItemForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const navigate = useNavigate();
  const testIdPrefix = "UCSBDiningCommonsMenuItemForm";

  const requiredText = (fieldName) => ({
    required: `${fieldName} is required.`,
    validate: (value) =>
      value.trim().length > 0 || `${fieldName} cannot be blank.`,
    maxLength: {
      value: 255,
      message: `${fieldName} must be 255 characters or fewer.`,
    },
  });

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={`${testIdPrefix}-id`}
            id="id"
            type="text"
            {...register("id")}
            readOnly
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="diningCommonsCode">Dining Commons Code</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-diningCommonsCode`}
          id="diningCommonsCode"
          type="text"
          isInvalid={Boolean(errors.diningCommonsCode)}
          {...register(
            "diningCommonsCode",
            requiredText("Dining Commons Code"),
          )}
        />
        <Form.Control.Feedback type="invalid">
          {errors.diningCommonsCode?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="name">Name</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-name`}
          id="name"
          type="text"
          isInvalid={Boolean(errors.name)}
          {...register("name", requiredText("Name"))}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="station">Station</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-station`}
          id="station"
          type="text"
          isInvalid={Boolean(errors.station)}
          {...register("station", requiredText("Station"))}
        />
        <Form.Control.Feedback type="invalid">
          {errors.station?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
        {buttonLabel}
      </Button>
      <Button
        variant="secondary"
        onClick={() => navigate(-1)}
        data-testid={`${testIdPrefix}-cancel`}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default UCSBDiningCommonsMenuItemForm;
