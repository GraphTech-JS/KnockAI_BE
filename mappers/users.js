import { hash } from "../helpers/auth.js";

export function toUserRecordInput(body) {
  return {
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    password: hash(body.password),
    political_affiliation: body.politicalAffiliation,
    role: body.role,
    status: "UNVERIFIED",
  };
}

export function toUserResponse(record) {
  return {
    userId: record.user_id,
    firstName: record.first_name,
    lastName: record.last_name,
    email: record.email,
    role: record.role,
    status: record.status,
    politicalAffiliation: record.political_affiliation,
  };
}
