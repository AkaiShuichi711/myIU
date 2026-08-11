-- ─────────────────────────────────────────────────────────────────
--  Make user deletion cascade fully — deleting a user now also
--  deletes every course/content they own, and everything that
--  content in turn owns (grades, submissions, attendance, posts...).
--
--  Previously these 7 FKs were ON DELETE NO ACTION, which blocked
--  deleting any user who had ever created a course, led a course
--  group, authored a course post, graded a student, created a form
--  template, submitted a form, or filed a support ticket.
--
--  Chosen scope: full cascade, including content other users depend
--  on (e.g. deleting a lecturer deletes their courses, which deletes
--  every student's grades/submissions/attendance in those courses).
--  Appropriate for this app's current seed/demo dataset — revisit if
--  this is ever used against real production data.
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE courses
    DROP CONSTRAINT courses_creator_id_fkey,
    ADD CONSTRAINT courses_creator_id_fkey
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE course_groups
    DROP CONSTRAINT course_groups_lecturer_id_fkey,
    ADD CONSTRAINT course_groups_lecturer_id_fkey
        FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE course_posts
    DROP CONSTRAINT course_posts_author_id_fkey,
    ADD CONSTRAINT course_posts_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE course_grades
    DROP CONSTRAINT course_grades_graded_by_fkey,
    ADD CONSTRAINT course_grades_graded_by_fkey
        FOREIGN KEY (graded_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE form_templates
    DROP CONSTRAINT form_templates_created_by_fkey,
    ADD CONSTRAINT form_templates_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE form_submissions
    DROP CONSTRAINT form_submissions_submitter_id_fkey,
    ADD CONSTRAINT form_submissions_submitter_id_fkey
        FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE support_tickets
    DROP CONSTRAINT support_tickets_submitter_id_fkey,
    ADD CONSTRAINT support_tickets_submitter_id_fkey
        FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE CASCADE;

-- Pre-existing gap: assignment_submissions.course_post_id had no FK at
-- all, so deleting a course_post (now cascading from course → lecturer
-- deletion) would leave orphaned submission rows pointing at nothing.
-- Add it so the full chain deletes cleanly.
ALTER TABLE assignment_submissions
    ADD CONSTRAINT assignment_submissions_course_post_id_fkey
        FOREIGN KEY (course_post_id) REFERENCES course_posts(id) ON DELETE CASCADE;
