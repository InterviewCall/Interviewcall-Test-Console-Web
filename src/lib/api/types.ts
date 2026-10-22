import type { operations } from "./schema";

/** The JSON body of a given response, read straight from the generated OpenAPI types. */
type Body<Op extends keyof operations, Status extends number> =
  operations[Op]["responses"] extends Record<Status, { content: { "application/json": infer B } }>
    ? B
    : never;

type RequestBody<Op extends keyof operations> = operations[Op] extends {
  requestBody: { content: { "application/json": infer B } };
}
  ? B
  : never;

export type User = Body<"AuthController_me", 200>;
export type UserRole = User["role"];
export type UserStatus = User["status"];

export type SessionInfo = Body<"AuthController_sessions", 200>[number];

export type UserPage = Body<"UsersController_list", 200>;
export type ListUsersParams = NonNullable<operations["UsersController_list"]["parameters"]["query"]>;

export type UserWithTemporaryPassword = Body<"UsersController_create", 201>;

export type LoginBody = RequestBody<"AuthController_login">;
export type ChangePasswordBody = RequestBody<"AuthController_changePassword">;
export type CreateUserBody = RequestBody<"UsersController_create">;
export type UpdateUserBody = RequestBody<"UsersController_update">;

export const USER_ROLES: readonly UserRole[] = ["ADMIN", "ADVISOR", "EDITOR"];
export const USER_STATUSES: readonly UserStatus[] = ["ACTIVE", "UNACTIVATED", "INACTIVE"];

export type TestSchedulePage = Body<"TestSchedulesController_list", 200>;
export type TestSchedule = TestSchedulePage["items"][number];
export type TestLevel = TestSchedule["level"];
export type TestStatus = TestSchedule["status"];
export type ListTestSchedulesParams = NonNullable<operations["TestSchedulesController_list"]["parameters"]["query"]>;
export type ScheduleTestBody = RequestBody<"TestSchedulesController_schedule">;
export type RescheduleTestBody = RequestBody<"TestSchedulesController_reschedule">;
/** What scheduling and resending return: the schedule, and whether its invitation email was queued. */
export type ScheduleWithEmailStatus = Body<"TestSchedulesController_schedule", 201>;

export const TEST_LEVELS: readonly TestLevel[] = ["INTERMEDIATE", "ADVANCED"];
export const TEST_STATUSES: readonly TestStatus[] = ["INVITED", "IN_PROGRESS", "SUBMITTED", "EXPIRED"];
