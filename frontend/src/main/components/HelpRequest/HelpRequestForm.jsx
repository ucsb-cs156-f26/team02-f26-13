import { Button, Col, Form, Row } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function HelpRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialContents });
  const navigate = useNavigate();

  return (
    <Form noValidate onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control id="id" type="text" readOnly {...register("id")} />
        </Form.Group>
      )}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              id="requesterEmail"
              type="email"
              isInvalid={Boolean(errors.requesterEmail)}
              {...register("requesterEmail", {
                required: "Requester email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requesterEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="teamId">Team Id</Form.Label>
            <Form.Control
              id="teamId"
              type="text"
              isInvalid={Boolean(errors.teamId)}
              {...register("teamId", {
                required: "Team id is required.",
                pattern: {
                  value: /\S/,
                  message: "Team id cannot be blank.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.teamId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="tableOrBreakoutRoom">
              Table or Breakout Room
            </Form.Label>
            <Form.Control
              id="tableOrBreakoutRoom"
              type="text"
              isInvalid={Boolean(errors.tableOrBreakoutRoom)}
              {...register("tableOrBreakoutRoom", {
                required: "Table or breakout room is required.",
                pattern: {
                  value: /\S/,
                  message: "Table or breakout room cannot be blank.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.tableOrBreakoutRoom?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requestTime">Request Time</Form.Label>
            <Form.Control
              id="requestTime"
              type="datetime-local"
              step="1"
              isInvalid={Boolean(errors.requestTime)}
              {...register("requestTime", {
                required: "Request time is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requestTime?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="explanation">Explanation</Form.Label>
        <Form.Control
          id="explanation"
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.explanation)}
          {...register("explanation", {
            required: "Explanation is required.",
            pattern: {
              value: /\S/,
              message: "Explanation cannot be blank.",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.explanation?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Check
          id="solved"
          type="checkbox"
          label="Solved"
          {...register("solved")}
        />
      </Form.Group>
      <Button type="submit">{buttonLabel}</Button>
      <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
        Cancel
      </Button>
    </Form>
  );
}

export default HelpRequestForm;
