# Club records admin website

This folder is the website package to upload to GitHub Pages. It contains the public club blog/student portal, the existing club rules page, and the administrator app. Do not upload the parent project folder: it may contain student JSON files and registration PDFs that must stay private.

## Included features

- Admin email/password sign-in; no public sign-up page.
- Student profiles with student and guardian contact details.
- Search across profile fields, class and section filters, and numeric ID ranges.
- Add, edit, delete, and CSV export with confirmation for contact data.
- Numbered batches with student membership managed by exact student IDs.
- Public batch blog with announcements/notices and full class-material articles written and edited directly in Admin. Rich formatting supports headings, lists, links, quotes, and code blocks; file attachments are optional for article posts.
- Public batch rosters show only full names and student IDs. Student contact details, addresses, and guardian information remain in protected tables and are not returned by the public portal.
- Public Club Team page lists delegate names, ADM administrators, and EM trainers/assistant trainers; the public RPC returns names and role labels only.
- Public files are stored in the `club-materials` bucket; announcement attachments must be PDF. Upload limit is 25 MB per file.
- Export the selected batch roster as Excel (.xlsx), CSV, or JSON, with all student profile fields and a privacy confirmation.
- Batch-specific meeting attendance (Present, Absent, Late) and summaries.
- Student filters combine ID ranges with inclusive batch-number ranges; filtered CSV exports include profile details and batch names.
- Data quality checks for missing core fields, missing phone contacts, and duplicate class/section rolls.
- JSON import with a preview; existing non-empty fields are preserved. Recognized historical attendance marks are imported into clearly labeled sessions.
- Encrypted manual backup and merge-restore, including batches and student memberships. Older version 1 backups still restore.

Students can belong to one or more batches. Batch attendance meetings include only students in that batch. Existing meetings created before the batch update stay as all-student meetings. This version excludes club-status tracking, interests, project teams, equipment loans, member tasks, achievements and certificates, printable rosters/contact lists, and QR cards.

## Supabase setup and updates (Free plan)

1. Create a Supabase account and a new Free project.
2. In the Supabase SQL Editor, run the contents of supabase/schema.sql. When updating an existing project, rerun the complete updated file; it allows text-only class-material articles and creates the narrow public read functions and public file bucket while preserving existing student and attendance records.
3. In Supabase Auth settings, turn off public user sign-ups. Create your administrator login from the Supabase dashboard.
4. Open admin/config.js and set the project URL and publishable key. The publishable key is intended for browser apps. Never put a service-role or secret key in this file.
5. Keep the database tables protected by the row-level security policies in the schema.
6. Open the site root over HTTPS for the public blog. Open admin/ and sign in to publish or edit posts, upload PDF notices, and add batch materials. Create notices in your preferred app, then upload the finished PDF from Blog & materials.
7. In Import & backup, select your existing students.json file and review the preview before importing.

The app imports student ID, name, class, section, roll, date of birth, gender, student phone, email, home address, guardian name, relationship, and guardian phone. It deliberately leaves out club status and area of interest. Historical attendance imports only recognized Present, Absent, or Late marks with valid dates; unsupported marks are counted in the preview. The original local JSON file is not modified or included in this upload package.

## GitHub Pages upload

Upload the contents of this github-upload folder to the root of a GitHub repository, then enable GitHub Pages for the repository. The root URL is the public batch blog; the public team page is /team.html, the admin app URL ends in /admin/, and the existing rules page is at /cmhsprc/. Apply the updated Supabase schema before using the blog editor, team page, or portal.

The code is public website code. Student records remain in Supabase and are never included in this folder. Because this portal is open to anyone, names and student IDs assigned to batches, published posts, and uploaded files are public. Never publish phone numbers, addresses, guardian details, or files containing private student information. If you add a custom domain or change hosting later, keep the admin login and database access policies enabled.

## Free-plan limits to remember

Supabase Free can pause projects after a week without activity and does not include automatic database backups. Use the encrypted backup feature regularly. The backup passphrase cannot be recovered if lost. Keep downloaded backups outside GitHub.

The app loads the Supabase JavaScript client from a public CDN. An internet connection is required for sign-in and database access.


The package contains no student records. The parent project folder has a .gitignore as an extra safeguard, but upload only this github-upload folder; do not upload the parent folder.
