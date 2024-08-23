
CREATE EXTENSION pgcrypto;

CREATE TABLE students (
  student_id BIGINT NOT NULL PRIMARY KEY,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  points BIGINT NOT NULL DEFAULT 0
);

CREATE TYPE pointsAction AS ENUM('added', 'removed');

CREATE TABLE points (
  point_id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  student BIGINT NOT NULL REFERENCES students(student_id),
  points_modified BIGINT NOT NULL DEFAULT 0,
  points_action pointsAction NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  points_before BIGINT NOT NULL,
  points_after BIGINT NOT NULL,
  reason text
);
