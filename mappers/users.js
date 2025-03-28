import { hash } from "../helpers/auth.js";
import { removeNullAndUndefinedFromObject } from "../helpers/common.js";

export function toUserRecordInput(body, verificationCode) {
  return {
    first_name: body.firstName,
    last_name: body.lastName,
    email: body.email,
    password: hash(body.password),
    political_affiliation: body.politicalAffiliation,
    role: body.role,
    status: "UNVERIFIED",
    verification_code: verificationCode,
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

export function toUpdateUserProfileInput(body) {
  const input = {
    first_name: body.firstName,
    last_name: body.lastName,
    political_affiliation: body.politicalAffiliation,
  };

  if (body.password) {
    input.password = hash(body.password);
  }

  return removeNullAndUndefinedFromObject(input);
}
