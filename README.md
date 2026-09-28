# Club records admin website

This folder is the safe set of website files to upload to GitHub Pages. It contains the public club website pages and the new private admin app. Do not upload the parent project folder: it contains student JSON files and registration PDFs that must stay private.

## Included features

- Admin email/password sign-in; no public sign-up page.
- Student profiles with student and guardian contact details.
- Search across profile fields, class and section filters, and numeric ID ranges.
- Add, edit, delete, and CSV export with confirmation for contact data.
- Numbered batches with student membership managed by exact student IDs.
- Batch-specific meeting attendance (Present, Absent, Late) and summaries.
- Student filters combine ID ranges with inclusive batch-number ranges; filtered CSV exports include profile details and batch names.
- Data quality checks for missing core fields, missing phone contacts, and duplicate class/section rolls.
- JSON import with a preview; existing non-empty fields are preserved. Recognized historical attendance marks are imported into clearly labeled sessions.
- Encrypted manual backup and merge-restore, including batches and student memberships. Older version 1 backups still restore.

Students can belong to one or more batches. Batch attendance meetings include only students in that batch. Existing meetings created before the batch update stay as all-student meetings. This version excludes club-status tracking, interests, project teams, equipment loans, member tasks, achievements and certificates, printable rosters/contact lists, and QR cards.

## Supabase setup and updates (Free plan)

1. Create a Supabase account and a new Free project.
2. In the Supabase SQL Editor, run the contents of supabase/schema.sql. When updating an existing project, rerun the complete updated file; it adds the batch tables and batch link to attendance sessions while preserving old sessions.
3. In Supabase Auth settings, turn off public user sign-ups. Create your administrator login from the Supabase dashboard.
4. Open admin/config.js and set the project URL and publishable key. The publishable key is intended for browser apps. Never put a service-role or secret key in this file.
5. Keep the database tables protected by the row-level security policies in the schema.
6. Open admin/index.html over HTTPS (GitHub Pages uses HTTPS) and sign in.
7. In Import & backup, select your existing students.json file and review the preview before importing.

The app imports student ID, name, class, section, roll, date of birth, gender, student phone, email, home address, guardian name, relationship, and guardian phone. It deliberately leaves out club status and area of interest. Historical attendance imports only recognized Present, Absent, or Late marks with valid dates; unsupported marks are counted in the preview. The original local JSON file is not modified or included in this upload package.

## GitHub Pages upload

Upload the contents of this github-upload folder to the root of a GitHub repository, then enable GitHub Pages for the repository. The admin app URL will end in /admin/. Apply the updated Supabase schema before using the batch features.

The code is public website code. Student records remain in Supabase and are never included in this folder. If you add a custom domain or change hosting later, keep the admin login and database access policies enabled.

## Free-plan limits to remember

Supabase Free can pause projects after a week without activity and does not include automatic database backups. Use the encrypted backup feature regularly. The backup passphrase cannot be recovered if lost. Keep downloaded backups outside GitHub.

The app loads the Supabase JavaScript client from a public CDN. An internet connection is required for sign-in and database access.


The package contains no student records. The parent project folder has a .gitignore as an extra safeguard, but upload only this github-upload folder; do not upload the parent folder.
