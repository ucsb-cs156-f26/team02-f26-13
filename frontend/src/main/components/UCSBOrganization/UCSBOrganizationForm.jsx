import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBOrganizationForm({
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

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="orgCode">Org Code</Form.Label>
            <Form.Control
              data-testid="UCSBOrganizationForm-orgCode"
              id="orgCode"
              type="text"
              isInvalid={Boolean(errors.orgCode)}
              {...register("orgCode", {
                required: "Org Code is required.",
                minLength: {
                  value: 3,
                  message: "Org Code must be exactly 3 characters.",
                },
                maxLength: {
                  value: 3,
                  message: "Org Code must be exactly 3 characters.",
                },
              })}
              disabled={Boolean(initialContents)}
            />
            <Form.Control.Feedback type="invalid">
              {errors.orgCode?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="orgTranslationShort">
              Organization Translation Short
            </Form.Label>
            <Form.Control
              data-testid="UCSBOrganizationForm-orgTranslationShort"
              id="orgTranslationShort"
              type="text"
              isInvalid={Boolean(errors.orgTranslationShort)}
              {...register("orgTranslationShort", {
                required: "Organization Translation Short is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.orgTranslationShort?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="orgTranslation">
              Organization Translation
            </Form.Label>
            <Form.Control
              data-testid="UCSBOrganizationForm-orgTranslation"
              id="orgTranslation"
              type="text"
              isInvalid={Boolean(errors.orgTranslation)}
              {...register("orgTranslation", {
                required: "Organization Translation is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.orgTranslation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="inactive"
              label="Inactive"
              data-testid="UCSBOrganizationForm-inactive"
              {...register("inactive")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="UCSBOrganizationForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="UCSBOrganizationForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default UCSBOrganizationForm;
