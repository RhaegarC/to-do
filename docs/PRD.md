# ToDo — Product Requirements Document

| Field | Value |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Date | 2026-11-25 |
| Owner | Tony Cheng |
| Product name | ToDo |
| Target platform | Web (installable PWA), Cloudflare Pages + Workers |
| Document scope | v1 product and architecture requirements |

---

## 1. Document control

This PRD is the implementation contract for the first public release of ToDo, a web-based
replacement for Microsoft To Do. It records the product decisions made during a structured
requirements interview and the architecture corrections found in review. Requirements are numbered
so later plans, tests, and pull requests can cite them.

**Change rule:** a decision in this document is not re-opened by an implementation preference. If a
requirement proves infeasible, it is changed here first, with the reason recorded, and only then in
code.

---

## 2. Executive summary

Microsoft is retiring the Microsoft To Do apps on **30 June 2027** across web, Windows, macOS, iOS,
and Android, for both work/school accounts and personal Microsoft accounts. Microsoft has confirmed
that existing To Do content **will not migrate automatically** to Planner, that the underlying To Do
service/API will retire later on a separate unannounced timeline, and that **personal Microsoft
accounts get no first-party replacement at all**
([Microsoft support](https://support.microsoft.com/en-us/planner/to-do-to-planner),
[The Verge](https://www.theverge.com/tech/1037558/microsoft-to-do-shutdown-planner),
[PCMag](https://uk.pcmag.com/productivity/168462/microsoft-is-killing-to-do-leaving-you-7-months-to-find-an-alternative)).

ToDo is a free, public, web-first task manager for that gap. The v1 promise is deliberately
plain:

> **Sign in with Microsoft, import your existing Microsoft To Do lists in one click, keep your
> lists, share them, and install it as an app.**

ToDo is not a Planner competitor. It is a personal and small-team list manager with faithful
Microsoft To Do basics, real shared lists, and a migration path that does not depend on Microsoft's
roadmap.

---

## 3. Problem and opportunity

### 3.1 The shutdown

- To Do apps retire **30 June 2027**; the apps are removed from all platforms.
- Existing tasks will **not** automatically migrate. To Do content remains viewable in Planner
  until 30 June 2027, then becomes inaccessible there.
- Microsoft says it will provide an export option before shutdown, but the format, limits, and
  import path are unpublished. Microsoft explicitly warns that an export does not imply the
  content can be imported elsewhere.
- The Graph To Do service and API retire on a **later, unannounced timeline**. Any migration tool
  built on Graph is therefore time-limited.

### 3.2 The gap

- Planner is the designated destination for work/school users, but it is not a like-for-like
  replacement: no native Windows/macOS desktop apps are planned, no file attachments on tasks in
  private plans, no direct equivalent to To Do list groups, and no equivalent printing or
  email-list capabilities.
- Personal Microsoft account users — including Microsoft 365 Personal and Family subscribers — are
  told to choose another task-management application. They have no first-party destination.
- No third-party tool can rely on Microsoft's unpublished export. Graph is the only migration
  surface available today.

### 3.3 Why now

The migration wave is real and dated, but this project runs at hobby pace and **makes no calendar
commitment**. The roadmap in §15 is milestone-based. The opportunity window informs priority, not
a launch promise.

---

## 4. Goals, success criteria, and non-goals

### 4.1 Goals

| ID | Goal |
|---|---|
| G-1 | Faithful core To Do experience: lists, tasks, steps, notes, due dates, importance, My Day, Planned, Important, Completed, search, and drag-reorder. |
| G-2 | Trustworthy shared lists with an explicit permission model and an invite flow that works across Microsoft tenants. |
| G-3 | Low-friction migration: one-click Graph import of owned lists, tasks, steps, recurrence, linked resources, and attachments, with a clear summary of what could not be imported. |
| G-4 | Installable PWA: offline reads for all accessible lists, queued writes for unshared lists, and a review path for conflicts. |
| G-5 | Data portability: a user can export everything they can access without asking the operator. |
| G-6 | Free public access with bounded operational risk: no product quotas, but published abuse guardrails, rate limits, spend alerts, and a kill switch. |
| G-7 | A security boundary that survives public sign-up: every list, task, step, and attachment access is authorized; non-members cannot distinguish "forbidden" from "not found". |

### 4.2 Success criteria for v1

Measured after launch, not as launch gates except where noted:

- **Import completion rate:** ≥90% of users who start the import finish it.
- **Import fidelity:** ≥95% of source lists/tasks/steps imported without a fatal error; every
  skipped item has a reason in the summary.
- **Activation:** ≥60% of new users create or import at least one list in their first session.
- **Sharing adoption:** ≥15% of active users are members of at least one shared list.
- **Reliability:** p95 authenticated list snapshot < 300 ms; p95 task write < 250 ms; 5xx rate <
  0.5%.
- **Offline replay:** ≥99% of queued mutations either apply or surface a conflict review, never
  disappear silently.
- **Cost:** cost per monthly active user is tracked and stays within the operator's alert threshold.
- **Privacy:** export and account-deletion flows complete without operator intervention.

### 4.3 Non-goals for v1

- Native iOS, Android, Windows, or macOS apps. The web PWA is the only client.
- Reminders, push notifications, or email notifications beyond list invitations. Reminder
  timestamps are imported for future use but are not scheduled or delivered.
- List groups/folders, themes beyond light/dark, and custom list colors.
- Per-task assignees, per-user completion, or Planner-style plans/buckets.
- Real-time presence, WebSockets, or Durable Objects.
- Email-to-task, calendar integration, Teams integration, or a Planner bridge.
- Tenant admin consoles, directory user search, tenant allowlists, or data-residency options.
- Billing, subscriptions, or paid tiers.
- Third-party identity providers (Google, Apple, email/password).
- Anonymous or public link sharing.
- Bulk multi-select actions.
- Internationalization beyond English. Timezones and locale date formatting are supported; UI
  strings are English-only.
- ZIP export. Attachments are exported through individual expiring links.
- Antivirus scanning of uploaded attachments. This is an accepted risk (§12.7).

### 4.4 Scope by release slice

- **v1:** everything in §7 and the 27 recorded decisions in §18.1.
- **v1.1:** reminders/push, list groups, per-task assignees.
- **Later:** real-time collaboration, billing, i18n, tenant-level features.

---

## 5. Personas and jobs to be done

### 5.1 Personal Microsoft account user

Uses To Do for groceries, household projects, study, and personal planning. Has no first-party
replacement. Wants a familiar list UI, a one-click import, and confidence that the new tool will not
disappear or hold their data hostage.

**Job:** "When To Do shuts down, I want to move my lists somewhere that feels the same and lets me
leave again, so I do not lose years of tasks or get trapped in another dead end."

### 5.2 Work/school user

Uses To Do for personal tasks alongside work tasks, or prefers a standalone tool to Planner. May be
blocked by a tenant that requires admin consent.

**Job:** "I want a fast, clean task list that works with my Microsoft account and does not force me
into Planner's team-plan model."

### 5.3 Collaborator

Receives an invitation to a shared list (household, club, small project). May use a different
Microsoft tenant or a personal account. Wants to accept without creating a password and to see only
what they have been given.

**Job:** "When someone shares a list with me, I want to open the link, sign in with the account I
already have, and start editing without installing anything."

### 5.4 Returning migrator

Cleans up their To Do account and re-imports later, or re-imports after a partial failure.

**Job:** "I want to run the import again without duplicating what I already have and without
bringing back tasks I deliberately deleted."

---

## 6. Key journeys

### 6.1 First sign-in and import

1. User opens the Pages app and selects **Sign in with Microsoft**.
2. MSAL redirects to Microsoft, the user consents to the ToDo app API scope, and returns.
3. The app provisions the user just-in-time and shows a single-screen import offer:
   **Import your Microsoft To Do**.
4. User selects **Import**. MSAL requests `Tasks.Read` for Graph. If the tenant blocks user consent,
   the app shows a **Request admin approval** path (§7.1.6).
5. The wizard shows a progress screen with counts and the current phase. The tab drives a bounded
   tick loop; closing the tab pauses the job and resuming continues from the stored cursor.
6. On completion the app shows a summary: lists, tasks, steps, attachments, recurrences imported;
   items skipped and why; shared lists that were imported as personal copies.
7. User lands in **My Day** or their default list. The import can be skipped and run later from
   Settings.

**Edge cases:** token expires mid-import → tick returns `token_expired`, the SPA acquires a fresh
Graph token and resumes; Graph returns `429`/`503` → wait for `Retry-After` and retry the same tick;
attachment >25 MB → metadata-only record and a summary entry; unsupported recurrence → task imported
without recurrence and a summary entry; duplicate source IDs → skipped via the import map.

### 6.2 Daily planning

- **My Day** shows tasks the user added to today. It resets daily; unfinished tasks are not
  automatically carried forward.
- **Planned** groups open tasks by due date, including overdue.
- **Important** shows open tasks with high importance.
- **Tasks** shows all open tasks grouped by list.
- **Completed** shows completed tasks, newest first.

### 6.3 Sharing a list

1. Owner opens **Share**, enters an email, and chooses **Can edit** or **Can view**.
2. ToDo creates a 7-day invite, emails it through Resend, and shows a copyable link as fallback.
3. Recipient opens the link, sees a preview (list name, inviter, role), signs in with any Microsoft
   account, and accepts. If the signed-in account's verified email matches the invite email, the
   invite is auto-claimed. If it does not match, the user is shown which account is signed in and
   can switch accounts.
4. The new member appears in the member list with the assigned role. The owner can resend, revoke,
   change roles (except ownership), or remove the member.
5. Ownership transfer is an explicit action. The previous owner becomes an editor.

### 6.4 Offline use

1. User opens a list while online; the list snapshot is cached in IndexedDB.
2. User goes offline. Reads continue for cached lists. Shared lists show an **offline, read-only**
   banner. Unshared lists allow edits.
3. Mutations are queued with client-generated IDs and expected versions.
4. On reconnect, the queue drains in order. Successful writes apply. A version conflict stops that
   mutation and opens a **review draft** showing the server state beside the local change; the user
   can re-apply or discard.
5. If the list became shared, or the user lost access, replay is blocked and surfaced; it is never
   executed against a shared list.

### 6.5 Recurring task

1. User creates a task with a due date and a repeat rule (daily, weekly on selected days, monthly on
   a day, yearly).
2. Completing the task marks it complete and creates exactly one next occurrence, in the task's
   timezone, with steps reset.
3. If two members complete the same occurrence at once, the unique occurrence constraint ensures
   only one next occurrence is created.
4. Deleting a recurring task deletes the **entire series**, including completed occurrences, after a
   confirmation that names the series.

### 6.6 Attachment lifecycle

Upload up to 25 MB per file. Attachments are private to list members and are always served as
downloads, never rendered inline. Deleting a task or list hard-deletes its attachment rows and R2
objects.

### 6.7 Export and account deletion

- **Export:** one explicit action produces JSON plus an attachment manifest with short-lived
  download links. It covers every list the user can access, including shared-list content
  (decision 23); the UI names the shared lists and roles before the user confirms.
- **Account deletion:** blocked while the user owns a shared list. They must transfer or delete each
  owned shared list first. Then their profile, personal lists, memberships, My Day rows, import
  history, and tombstones are hard-deleted. Content they created in other people's shared lists
  stays, with attribution rendered as **Deleted user**.

---

## 7. Functional requirements

Requirement IDs are stable. Each requirement has an observable acceptance criterion. "Must" means
required for v1.

### 7.1 Identity and onboarding (FR-ID)

- **FR-ID-01 — Sign-in.** The app must sign users in through Microsoft Entra ID using MSAL.js in the
  SPA with authorization code + PKCE. Work/school accounts and personal Microsoft accounts must be
  accepted through the `common` authority. MSAL validates `state` and `nonce`; the implicit flow is
  not used.
  *Acceptance:* a work account and a personal account can both complete sign-in and reach `/me`.
- **FR-ID-02 — App registrations.** There must be two registrations: a public SPA client (no
  secret; SPA redirect URIs for production and localhost) and an API registration exposing
  `api://<api-client-id>/access_as_user`, with the SPA client pre-authorized. Both must be
  multi-tenant and personal-account enabled.
  *Acceptance:* the SPA obtains an API access token with `scp` containing `access_as_user`, and
  separately obtains a Graph token only when the import needs it.
- **FR-ID-03 — JIT provisioning.** On the first authenticated API call, the Worker must create a
  user from validated token claims: `oid`, `tid`, `name`, `preferred_username`, and the optional
  `email` claim. Identity is `(entra_tid, entra_oid)`.
  *Acceptance:* a new token creates one row; a second call updates `last_seen_at` without
  duplicating.
- **FR-ID-04 — Separate identities.** A work identity and a personal identity are separate
  accounts. There is no account linking in v1.
  *Acceptance:* signing in with two different accounts produces two user rows and two independent
  list sets.
- **FR-ID-05 — Sign-out.** Sign-out must clear the MSAL token cache and purge the persisted query
  cache and any cached list data from IndexedDB. The app shell may remain cached.
  *Acceptance:* after sign-out and a reload while offline, no task data is readable.
- **FR-ID-06 — Anonymous denial.** Every API route except `GET /health` and the invite preview must
  return 401 to an unauthenticated caller.
  *Acceptance:* the host tier asserts 401 for every non-public route.
- **FR-ID-07 — Admin consent fallback.** When Microsoft returns a consent or interaction-required
  error, the app must show an explanation and a link to
  `https://login.microsoftonline.com/{tid}/adminconsent?client_id=<spa-client-id>` where a tenant ID
  is known, or to the common admin-consent guidance otherwise.
  *Acceptance:* the error path renders the fallback instead of a dead end.
- **FR-ID-08 — Token handling.** Microsoft access tokens must never be written to D1, R2, logs, or
  analytics. The Graph token is accepted per import tick in a dedicated request header and discarded
  after the request.
  *Acceptance:* log review and a code-level test assert no token is logged or persisted.

### 7.2 Lists and tasks (FR-LT)

- **FR-LT-01 — Lists.** Users can create, rename, reorder, and delete lists. A list name is 1–200
  characters after trimming. Only the owner may rename or delete a list.
  *Acceptance:* CRUD works; deletion hard-deletes the list and all children; a viewer gets 403/404.
- **FR-LT-02 — Tasks.** A task has: title (1–1,000 chars), notes (plain text, ≤100,000 chars),
  optional due date/time with IANA timezone, optional start date/time, optional reminder timestamp
  (stored, not scheduled), importance (`low`, `normal`, `high`), completion state, steps,
  attachments, and recurrence.
  *Acceptance:* every field round-trips; boundary-length validation rejects at the boundary.
- **FR-LT-03 — Completion.** Any editor may complete or reopen a task. Completion sets
  `completed_at` and `completed_by`; reopening clears both. Completion is shared/global for the
  list.
  *Acceptance:* two members see the same completed state; a viewer cannot complete.
- **FR-LT-04 — Steps.** Tasks support up to 200 ordered checklist steps (title 1–500 chars,
  completed flag). Any editor may add, edit, reorder, complete, and delete steps.
  *Acceptance:* step order persists; deleting a task cascades to steps.
- **FR-LT-05 — Ordering.** Tasks, steps, and lists use a fractional-index `sort_key` computed
  client-side and validated server-side (format and ≤255 chars). Reordering sends the new key and
  the current version.
  *Acceptance:* moving between neighbours produces a key that sorts correctly without renumbering;
  a malformed key is rejected with 422.
- **FR-LT-06 — Move task.** A non-recurring task can be moved to another list where the caller is
  an editor. Steps and attachments move with it; the task gets a new `sort_key` at the destination.
  Recurring tasks cannot be moved in v1.
  *Acceptance:* move succeeds only with edit rights on both lists; a recurring task returns 422 with
  a clear message.
- **FR-LT-07 — Delete.** Deleting a task hard-deletes it, its steps, linked resources, My Day
  entries, and attachment rows plus R2 objects. Deleting a recurring task deletes the entire series
  (decision 24). A confirmation dialog is required for list deletion and for deleting a task with
  attachments.
  *Acceptance:* no orphan rows or R2 objects remain after a successful delete; the series is gone in
  one action.
- **FR-LT-08 — Notes safety.** Notes render as plain text with preserved whitespace. No HTML or
  Markdown is rendered in v1.
  *Acceptance:* a note containing `<script>` displays literally and creates no DOM node.
- **FR-LT-09 — Search scope.** Task listing and search must never return tasks from lists the caller
  cannot access.
  *Acceptance:* IDOR tests cover list, task, step, attachment, and search routes.

### 7.3 Smart views (FR-SV)

- **FR-SV-01 — My Day.** A private, per-user, per-day flag. `GET /views/my-day` returns tasks in
  the user's `my_day` rows for the current date in the user's timezone, grouped with tasks completed
  today. Past days do not carry over.
- **FR-SV-02 — Planned.** Open tasks with a due date, grouped by date, including overdue.
- **FR-SV-03 — Important.** Open tasks with `importance = high`.
- **FR-SV-04 — Tasks.** All open tasks in accessible lists, grouped by list.
- **FR-SV-05 — Completed.** Completed tasks, newest first, per list or across accessible lists;
  cursor-paginated.
  *Acceptance for all views:* results are scoped by membership and respect the user's timezone;
  completed tasks are excluded unless the view says otherwise.

### 7.4 Sharing and permissions (FR-SH)

- **FR-SH-01 — Roles.** Three roles: **owner**, **editor**, **viewer**. The full matrix is in
  Appendix B. Only the owner may invite, manage members, rename/delete the list, or transfer
  ownership. Editors may write anywhere within the list's tasks. Viewers are read-only.
- **FR-SH-02 — Invitations.** The owner invites by email with a role of editor or viewer. An invite
  is a random 256-bit token; only its SHA-256 hash is stored. It expires after 7 days. Resending
  issues a new token and invalidates the old one; revoking is immediate.
  *Acceptance:* expired/revoked/unknown tokens all return the same enumeration-safe response.
- **FR-SH-03 — Acceptance.** Acceptance requires a signed-in user and a valid token. If the user has
  a verified email claim, it must match the invite email case-insensitively. If the account has no
  email-like claim, possession of the token is sufficient and the owner sees the accepting account.
  The invite preview is public but rate-limited and requires the token.
  *Acceptance:* a mismatched account is offered account switching, not silently added.
- **FR-SH-04 — Membership lifecycle.** The owner can remove a member and change an editor/viewer
  role. A member can leave. The owner cannot leave; they must transfer ownership or delete the list.
  Removing a member invalidates their access immediately; their cached list data is purged on the
  next 403/404.
- **FR-SH-05 — Ownership transfer.** The owner may transfer to any active editor or viewer. The
  recipient becomes owner; the previous owner becomes an editor. This is atomic.
- **FR-SH-06 — Non-member responses.** Non-members receive 404 for lists, tasks, steps, and
  attachments, so the existence of a resource is not disclosed. Authenticated members without
  sufficient role receive 403 for write actions.
- **FR-SH-07 — No public sharing.** There are no anonymous list links and no public write paths.
- **FR-SH-08 — Shared completion.** Completion and reopening are list-global, regardless of who
  created the task.
- **FR-SH-09 — Private My Day.** My Day rows are per user, even for shared lists. A user's My Day
  never reveals another member's My Day.

### 7.5 Recurrence (FR-RC)

- **FR-RC-01 — Rule model.** A recurring task stores the raw source recurrence JSON (when imported),
  a normalized RRULE, an IANA timezone, a `series_id`, and the occurrence's due timestamp.
  *Acceptance:* a series has one row per occurrence; all rows share `series_id`.
- **FR-RC-02 — Supported patterns.** v1 supports daily, weekly (selected weekdays), monthly
  (day-of-month), and yearly (month/day) with an interval and an end condition (never, on a date,
  after N occurrences). Import additionally maps `relativeMonthly` and `relativeYearly` where
  possible; unsupported combinations are imported without recurrence and flagged.
- **FR-RC-03 — Completion spawns one successor.** Completing a recurring occurrence must create
  exactly one next occurrence after the current due date, in the task's timezone. A unique
  constraint on `(series_id, occurrence_due_at)` makes concurrent completion idempotent; a duplicate
  successor insert is ignored, not surfaced as an error. Steps are copied and reset to incomplete.
  Attachments are **not** copied to the next occurrence in v1.
  *Acceptance:* two simultaneous completes produce one successor; the completed occurrence remains.
- **FR-RC-04 — DST.** Next-occurrence calculation uses the task timezone. A nonexistent local time
  shifts forward to the next valid time; an ambiguous time uses the earlier offset.
  *Acceptance:* tests cover spring-forward and fall-back cases in a DST-observing zone.
- **FR-RC-05 — Delete series.** Deleting any occurrence deletes the whole series, including
  completed occurrences and their attachments, after a confirmation naming the series.
- **FR-RC-06 — Edit semantics.** Editing title, notes, importance, or recurrence affects the current
  occurrence and the pattern used for future spawns. Completed occurrences are unchanged.
- **FR-RC-07 — Import fidelity.** The raw imported recurrence is preserved even when it cannot be
  normalized, so a later version can improve conversion.
- **FR-RC-08 — No due date, no recurrence.** A task without a due date cannot be made recurring.

### 7.6 Attachments (FR-AT)

- **FR-AT-01 — Upload.** An editor can upload a file up to **25 MB** to a task via the Worker. The
  Worker streams the body to R2; the file is never buffered whole in memory.
  *Acceptance:* a 25 MB file round-trips; a 25 MB + 1 byte file is rejected with 413.
- **FR-AT-02 — Limits.** Maximum 50 attachments per task. Filename ≤255 characters and sanitized
  for storage/response. Content type is stored but never trusted for rendering.
- **FR-AT-03 — Download.** Only current list members may download. Responses use
  `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`, a sanitized filename,
  `Cache-Control: private, no-store`, and an octet-stream or stored content type. No inline
  rendering, no HTML/SVG execution.
- **FR-AT-04 — Delete.** Deleting an attachment removes the row and the R2 object. If the R2 delete
  fails, the row is removed and an orphan-cleanup job reconciles the object.
- **FR-AT-05 — Hard-delete cascade.** Deleting a task or list removes all attachment R2 objects.
- **FR-AT-06 — Import.** Source attachments ≤25 MB are streamed from Graph `/$value` into R2.
  Larger attachments create a metadata-only row with `import_status = skipped_too_large`; the
  summary reports them.
- **FR-AT-07 — Private bucket.** The R2 bucket is not public. There are no anonymous or presigned
  public URLs. Downloads always pass through the Worker.
- **FR-AT-08 — Abuse guardrails.** Upload and download rate limits apply per user; see §14.6.

### 7.7 Graph import (FR-IM)

- **FR-IM-01 — Scope.** The import requests delegated **`Tasks.Read`** only. It must not request
  write scopes and must never write to Microsoft To Do.
- **FR-IM-02 — API version.** Use Microsoft Graph **v1.0** To Do endpoints.
- **FR-IM-03 — One job per user.** A user may have at most one running import job. Starting a second
  returns 409.
- **FR-IM-04 — Resumable ticks.** The SPA creates a job, then repeatedly calls a tick endpoint while
  supplying the current Graph access token in a header. Each tick is bounded (a few Graph pages,
  ≤50 tasks) and persists a cursor, phase, and counts.
  *Acceptance:* closing the tab mid-import and reopening resumes from the cursor without duplicating
  items.
- **FR-IM-05 — Merge-new only.** Re-import adds source items not already mapped and never updates
  existing local items. `graph_import_map` records source-to-local IDs.
- **FR-IM-06 — Tombstones.** If a user deleted an imported item (list, task, step, attachment, or
  linked resource), a content-free tombstone prevents re-import from recreating it. Tombstones
  contain only user, entity type, source ID, and deletion time. A deleted parent's tombstone covers
  its children.
- **FR-IM-07 — Reset import history.** An explicit action clears the import map and tombstones. The
  app must warn that this can duplicate content unless the user first deletes imported items, and
  offers "delete all imported content and reset".
- **FR-IM-08 — Ownership filter.** Lists with `isOwner = true` are imported by default. Lists shared
  with the user (`isOwner = false`) are imported only when the user opts in, as independent personal
  copies, with a warning that membership cannot be reconstructed.
- **FR-IM-09 — Throttling.** Graph `429` and `503` responses are honored with `Retry-After`; the job
  pauses and the SPA retries. A single job never exceeds 120 ticks per minute.
- **FR-IM-10 — Token expiry.** If the Graph token expires, the tick returns a typed
  `token_expired` result. The SPA acquires a fresh token silently and resumes; if silent acquisition
  fails, it prompts an interactive sign-in.
- **FR-IM-11 — Summary.** The job stores counts of lists, tasks, steps, linked resources,
  attachments, recurrences, and items skipped with reasons. The UI shows this summary.
- **FR-IM-12 — Fidelity limits.** The wizard and summary must state that manual task order, My Day
  history, list groups, themes, and fine-grained membership are not available from Graph and are not
  imported.
- **FR-IM-13 — Time-limited capability.** The app must warn that the To Do API will retire on an
  unannounced date and that re-import will stop working then.
- **FR-IM-14 — No token persistence.** The Graph token is request-scoped and never stored (§7.1.8).
- **FR-IM-15 — Partial failure.** A single list, task, or attachment failure must not abort the
  job. It is recorded and the job continues where safe. Provider errors such as
  `MailboxNotEnabledForRESTAPI` are surfaced with an actionable explanation.

### 7.8 Offline and PWA (FR-OF)

- **FR-OF-01 — Installability.** The app must provide a web manifest with name, short name, icons
  (192/512/maskable), theme/background colors, standalone display, start URL, and shortcuts for My
  Day and New task. It must pass the browser install criteria and be installable on Chromium and
  iOS Safari (Add to Home Screen).
- **FR-OF-02 — Service worker.** A service worker must precache the app shell and static assets and
  provide a navigation fallback. It must not cache API responses; task data caching is handled by
  TanStack Query persistence.
- **FR-OF-03 — Offline reads.** Accessible list snapshots must be readable offline from IndexedDB.
  The UI shows last-synced time and an offline indicator.
- **FR-OF-04 — Offline writes.** Mutations may be queued only for lists that had exactly one active
  member (one `list_members` row, the owner) at enqueue time. Shared-list writes require
  connectivity and are disabled offline. Creating a new list offline is allowed because it is
  unshared by construction; list rename and list deletion offline are not supported in v1.
  *Acceptance:* an offline edit on a shared list is blocked in the UI and cannot enter the queue.
- **FR-OF-05 — Replay.** Queued mutations use client-generated UUIDv7 IDs and expected versions and
  replay in order on reconnect. A version conflict returns 409, stops that mutation, and opens a
  review draft showing the server state beside the local change. The server row is authoritative;
  the local draft is never applied automatically. The user may re-apply or discard.
- **FR-OF-06 — Membership change during replay.** If a list became shared or the user lost access,
  replay must be blocked and surfaced; it must never execute against a list that is no longer
  unshared.
- **FR-OF-07 — Cache purge.** Sign-out purges all query and data caches. A 403/404 for a list purges
  that list's cached data. Account deletion purges everything.
- **FR-OF-08 — Background sync.** Use the Background Sync API where available; otherwise drain on
  `online` and on app focus. iOS Safari limitations are documented in the UI.
- **FR-OF-09 — Updates.** When a new service worker is ready, prompt the user to reload; never
  silently discard unsynced mutations.
- **FR-OF-10 — No push.** v1 does not request notification permission or register push
  subscriptions.

### 7.9 Export and account (FR-EX)

- **FR-EX-01 — Export contents.** A user can export JSON containing profile, settings, memberships,
  and the full content of every list they can access, including shared-list tasks, steps, linked
  resources, recurrence, and attachment metadata. Attachments are provided through a manifest of
  short-lived download links.
- **FR-EX-02 — Export controls.** Export is an explicit, rate-limited action (1/hour/user), logged
  in `export_events`, and preceded by a UI notice naming the shared lists and roles included. Links
  expire after 15 minutes and are bound to the requesting user.
- **FR-EX-03 — No ZIP.** v1 does not assemble archives.
- **FR-EX-04 — Account deletion preconditions.** Deletion is blocked while the user owns a shared
  list. The user must transfer or delete each owned shared list first. Unshared lists are deleted
  automatically.
- **FR-EX-05 — Account deletion effects.** Hard-delete the profile, settings, owned unshared lists,
  memberships, My Day rows, invites created by the user or addressed to their email, import
  jobs/maps/tombstones, and personal attachment R2 objects. Export audit rows are anonymized (user
  reference nulled) and purge on their normal 90-day schedule. Content in other people's shared
  lists remains; attribution renders as **Deleted user**; attachments uploaded to shared lists
  remain.
- **FR-EX-06 — Deletion confirmation.** Require an interactive re-authentication and a typed
  confirmation before deleting. Show the user what will be kept in shared lists.
- **FR-EX-07 — Backups.** State that D1 Time Travel backups may retain deleted data for up to 30
  days; backups are not used to resurrect accounts.

### 7.10 Invitations and email (FR-EM)

- **FR-EM-01 — Provider abstraction.** Email is sent through a provider interface; Resend is the
  v1 implementation. The API key is a Worker secret.
- **FR-EM-02 — Invite email.** The email contains the list name, inviter display name, role, and a
  link to `/invite/{token}`. It must not include task content.
- **FR-EM-03 — Failure fallback.** If sending fails, the invite still exists and the owner sees a
  copyable link and an error notice. Retries are bounded (3 attempts, exponential backoff).
- **FR-EM-04 — Limits.** Invites are rate-limited per user (20/hour) and per list; the public invite
  preview is rate-limited per IP.
- **FR-EM-05 — No other email in v1.** No reminders, digests, or marketing email.

### 7.11 Search (FR-SE)

- **FR-SE-01 — Scope.** Search matches task title and notes, case-insensitively, across every list
  the caller can access. Results include list and task identity and an accessible snippet.
- **FR-SE-02 — Implementation.** v1 uses SQL `LIKE` with escaped `%`/`_` wildcards, minimum 2
  characters, maximum 100 characters, limit 50, cursor pagination. FTS5 is evaluated in M0; if it is
  available and stable in D1, it may replace LIKE behind the same API.
- **FR-SE-03 — Filters.** Callers may filter to open or completed tasks; the default is all,
  ordered by open tasks first and then most recently updated.
- **FR-SE-04 — No leakage.** Search joins list membership; non-members' tasks never appear.
  *Acceptance:* an IDOR test creates two users with similarly named tasks and asserts isolation.

---

## 8. UX specification

### 8.1 Layout

- **Desktop (≥1024 px):** three panes.
  1. Left navigation: app name, user menu, smart views (My Day, Planned, Important, Tasks,
     Completed), owned lists, shared lists with role badges, **New list**.
  2. Middle: selected view/list header, inline **Add a task**, task rows with drag handles,
     importance star, due date, step count, attachment count, and completion control. Completed
     tasks collapse into a section at the bottom.
  3. Right: task detail pane. Title, steps, notes, due date/time, repeat, attachments, importance,
     **Add to My Day**, move, delete. On mobile this becomes a full-height sheet.
- **Mobile (<768 px):** list navigation in a drawer; a bottom bar with My Day, Tasks, Search, and
  New task. Swipe is not required for any core action.
- **Tablet:** two panes; detail as an overlay.

### 8.2 States

- Empty list, empty My Day, no search results, and no pending invites each get a specific empty
  state with one primary action.
- Loading uses skeletons, never a blocking spinner for the whole app.
- Errors show an inline message with a retry action; auth errors route to sign-in.
- An **Offline** banner states what is readable and what is writable.
- A **Conflict** banner appears on a task with a review-draft action.
- An **Import** screen shows phase, counts, elapsed time, pause/resume, and cancel.
- A **Shared list** banner on the detail pane shows the user's role and, for viewers, why editing is
  unavailable.

### 8.3 Interaction

- Inline task creation: Enter saves, Shift+Enter adds a note, Esc cancels.
- Drag-reorder uses dnd-kit with a keyboard sensor; reordering is possible without a pointer.
- Keyboard shortcuts: `n` new task, `m` add to My Day, `i` toggle important, `Enter` open,
  `Esc` close, `/` search, `?` shortcut help. Shortcuts are disabled while typing in an input.
- Every destructive action has a clear label and a confirmation appropriate to its consequence.
- Toasts confirm saves and surface retryable failures. Toasts never contain task content in logs.

### 8.4 Visual and accessibility

- Tailwind + shadcn/ui (Radix primitives), light/dark themes following the system by default.
- Target **WCAG 2.1 AA**: contrast, visible focus, full keyboard operation, focus trapping and
  restoration in dialogs/sheets, labels for icon buttons, and a live region for import progress.
- Respect `prefers-reduced-motion`.
- Touch targets ≥44×44 px on mobile.
- The app must remain usable at 200% zoom and with a screen reader for the core create/complete
  flows.

### 8.5 Design constraints

- Do not use unicode-only icons without labels.
- Do not render user notes as HTML.
- Do not auto-focus destructive buttons.
- The import wizard must not block the rest of the app after it is skipped.

---

## 9. Data model

The source of truth is Cloudflare D1 (SQLite). Attachments live in R2; D1 stores metadata. All IDs
are UUIDv7 generated client-side where creation may happen offline, otherwise server-side. All
timestamps are ISO-8601 UTC strings. Booleans are integers 0/1. D1 always enforces foreign keys.

### 9.1 Tables

#### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK, UUIDv7 |
| `entra_tid` | TEXT | NOT NULL |
| `entra_oid` | TEXT | NOT NULL |
| `email` | TEXT | NULL, normalized lowercase |
| `display_name` | TEXT | NOT NULL |
| `created_at` | TEXT | NOT NULL |
| `updated_at` | TEXT | NOT NULL |
| `last_seen_at` | TEXT | NULL |

- `UNIQUE(entra_tid, entra_oid)`
- Index on `email` for pending-invite matching.

#### `user_settings`

| Column | Type | Constraints |
|---|---|---|
| `user_id` | TEXT | PK, FK `users(id)` ON DELETE CASCADE |
| `time_zone` | TEXT | NOT NULL default `UTC` (IANA) |
| `theme` | TEXT | NOT NULL default `system` (`light`/`dark`/`system`) |
| `first_day_of_week` | INTEGER | NOT NULL default 0 (0=Sunday) |
| `default_list_id` | TEXT | NULL, FK `lists(id)` ON DELETE SET NULL |
| `created_at` | TEXT | NOT NULL |
| `updated_at` | TEXT | NOT NULL |

#### `lists`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `owner_user_id` | TEXT | NOT NULL, FK `users(id)` ON DELETE CASCADE |
| `name` | TEXT | NOT NULL, trimmed length 1–200 |
| `sort_key` | TEXT | NOT NULL, ≤255 chars |
| `is_default` | INTEGER | NOT NULL default 0 |
| `imported_from_shared` | INTEGER | NOT NULL default 0 |
| `graph_list_id` | TEXT | NULL |
| `version` | INTEGER | NOT NULL default 1 |
| `created_at` | TEXT | NOT NULL |
| `updated_at` | TEXT | NOT NULL |

- Index `(owner_user_id, sort_key)`.
- The owner also has a `list_members` row with role `owner`; both are written in one transaction.

#### `list_members`

| Column | Type | Constraints |
|---|---|---|
| `list_id` | TEXT | FK `lists(id)` ON DELETE CASCADE |
| `user_id` | TEXT | FK `users(id)` ON DELETE CASCADE |
| `role` | TEXT | NOT NULL CHECK in (`owner`,`editor`,`viewer`) |
| `joined_at` | TEXT | NOT NULL |

- `PRIMARY KEY(list_id, user_id)`.
- Partial unique index: one `owner` per list.
- Index `(user_id)`.

#### `list_invites`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `list_id` | TEXT | NOT NULL, FK `lists(id)` ON DELETE CASCADE |
| `invited_email` | TEXT | NOT NULL, lowercase |
| `role` | TEXT | NOT NULL CHECK in (`editor`,`viewer`) |
| `token_hash` | TEXT | NOT NULL UNIQUE (SHA-256 of the raw token) |
| `invited_by` | TEXT | NULL, FK `users(id)` ON DELETE SET NULL |
| `created_at` | TEXT | NOT NULL |
| `expires_at` | TEXT | NOT NULL (created + 7 days) |
| `revoked_at` | TEXT | NULL |
| `accepted_at` | TEXT | NULL |
| `accepted_by` | TEXT | NULL, FK `users(id)` ON DELETE SET NULL |

- Index `(list_id)`, `(invited_email)`.

#### `tasks`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `list_id` | TEXT | NOT NULL, FK `lists(id)` ON DELETE CASCADE |
| `title` | TEXT | NOT NULL, trimmed 1–1,000 |
| `notes` | TEXT | NOT NULL default `''`, ≤100,000 |
| `due_at` | TEXT | NULL |
| `due_time_zone` | TEXT | NULL, IANA |
| `start_at` | TEXT | NULL |
| `reminder_at` | TEXT | NULL (imported; not scheduled in v1) |
| `importance` | TEXT | NOT NULL default `normal`, CHECK in (`low`,`normal`,`high`) |
| `completed_at` | TEXT | NULL |
| `completed_by` | TEXT | NULL, FK `users(id)` ON DELETE SET NULL |
| `recurrence_raw` | TEXT | NULL (JSON) |
| `recurrence_rule` | TEXT | NULL (RRULE) |
| `recurrence_time_zone` | TEXT | NULL, IANA |
| `recurrence_import_status` | TEXT | NOT NULL default `none`, CHECK in (`none`,`ok`,`unsupported`) |
| `series_id` | TEXT | NULL |
| `occurrence_due_at` | TEXT | NULL |
| `sort_key` | TEXT | NOT NULL, ≤255 |
| `version` | INTEGER | NOT NULL default 1 |
| `created_by` | TEXT | NULL, FK `users(id)` ON DELETE SET NULL |
| `created_at` | TEXT | NOT NULL |
| `updated_at` | TEXT | NOT NULL |
| `graph_task_id` | TEXT | NULL |

- Partial unique index `(series_id, occurrence_due_at)` where `series_id IS NOT NULL`.
- Index `(list_id, completed_at)`, `(list_id, sort_key)`, `(completed_at)`, `(series_id)`.

#### `task_steps`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `task_id` | TEXT | NOT NULL, FK `tasks(id)` ON DELETE CASCADE |
| `title` | TEXT | NOT NULL, 1–500 |
| `is_completed` | INTEGER | NOT NULL default 0 |
| `sort_key` | TEXT | NOT NULL |
| `version` | INTEGER | NOT NULL default 1 |
| `created_at` | TEXT | NOT NULL |
| `updated_at` | TEXT | NOT NULL |
| `graph_checklist_item_id` | TEXT | NULL |

- Index `(task_id)`.

#### `task_linked_resources`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `task_id` | TEXT | NOT NULL, FK `tasks(id)` ON DELETE CASCADE |
| `application_name` | TEXT | NULL |
| `display_name` | TEXT | NULL |
| `url` | TEXT | NOT NULL |
| `graph_linked_resource_id` | TEXT | NULL |
| `created_at` | TEXT | NOT NULL |

- Index `(task_id)`.

#### `my_day`

| Column | Type | Constraints |
|---|---|---|
| `user_id` | TEXT | FK `users(id)` ON DELETE CASCADE |
| `task_id` | TEXT | FK `tasks(id)` ON DELETE CASCADE |
| `day` | TEXT | NOT NULL, `YYYY-MM-DD` in the user's timezone |
| `created_at` | TEXT | NOT NULL |

- `PRIMARY KEY(user_id, task_id, day)`.
- Index `(user_id, day)`.
- Rows older than 30 days are purged by the maintenance job.

#### `attachments`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `task_id` | TEXT | NOT NULL, FK `tasks(id)` ON DELETE CASCADE |
| `uploaded_by` | TEXT | NULL, FK `users(id)` ON DELETE SET NULL |
| `r2_key` | TEXT | NOT NULL UNIQUE |
| `file_name` | TEXT | NOT NULL, ≤255, sanitized |
| `content_type` | TEXT | NOT NULL |
| `size_bytes` | INTEGER | NOT NULL, 0–26,214,400 (25 MiB) |
| `import_status` | TEXT | NOT NULL default `local`, CHECK in (`local`,`ready`,`skipped_too_large`,`skipped_error`) |
| `graph_attachment_id` | TEXT | NULL |
| `created_at` | TEXT | NOT NULL |

- Index `(task_id)`.
- R2 key format: `attachments/{attachment_id}`.

#### `import_jobs`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `user_id` | TEXT | NOT NULL, FK `users(id)` ON DELETE CASCADE |
| `status` | TEXT | NOT NULL CHECK in (`running`,`paused`,`completed`,`failed`,`cancelled`) |
| `include_shared` | INTEGER | NOT NULL default 0 |
| `phase` | TEXT | NOT NULL |
| `cursor` | TEXT | NULL (JSON) |
| `counts` | TEXT | NOT NULL default `{}` (JSON) |
| `summary` | TEXT | NULL (JSON) |
| `error` | TEXT | NULL |
| `started_at` | TEXT | NOT NULL |
| `updated_at` | TEXT | NOT NULL |
| `completed_at` | TEXT | NULL |

- Partial unique index `(user_id)` where `status = 'running'`.
- Index `(user_id, started_at)` for listing recent jobs.
- Retention: keep the latest 10 jobs per user or 30 days, whichever is shorter.

#### `graph_import_map`

| Column | Type | Constraints |
|---|---|---|
| `user_id` | TEXT | NOT NULL, FK `users(id)` ON DELETE CASCADE |
| `entity_type` | TEXT | NOT NULL CHECK in (`list`,`task`,`step`,`attachment`,`linked_resource`) |
| `graph_id` | TEXT | NOT NULL |
| `local_id` | TEXT | NOT NULL |
| `imported_at` | TEXT | NOT NULL |

- `PRIMARY KEY(user_id, entity_type, graph_id)`.
- Index `(user_id, local_id)`.

#### `graph_tombstones`

| Column | Type | Constraints |
|---|---|---|
| `user_id` | TEXT | NOT NULL, FK `users(id)` ON DELETE CASCADE |
| `entity_type` | TEXT | NOT NULL CHECK in (`list`,`task`,`step`,`attachment`,`linked_resource`) |
| `graph_id` | TEXT | NOT NULL |
| `deleted_at` | TEXT | NOT NULL |

- `PRIMARY KEY(user_id, entity_type, graph_id)`.
- Contains no titles, notes, filenames, or R2 keys.

#### `export_events`

| Column | Type | Constraints |
|---|---|---|
| `id` | TEXT | PK |
| `user_id` | TEXT | NULL, FK `users(id)` ON DELETE SET NULL |
| `created_at` | TEXT | NOT NULL |
| `list_count` | INTEGER | NOT NULL |
| `task_count` | INTEGER | NOT NULL |
| `attachment_count` | INTEGER | NOT NULL |

- Index `(created_at)` for the purge.
- Purged after 90 days by a scheduled job.

### 9.2 Deletion and cascade rules

- `users` deletion cascades to settings, owned lists (and therefore all list children), memberships,
  My Day rows, import artifacts, and tombstones. It sets `created_by`/`completed_by`/
  `uploaded_by`/`invited_by` to NULL, which the UI renders as "Deleted user".
- `lists` deletion cascades to members, invites, tasks, steps, linked resources, My Day rows, and
  attachments. R2 objects are deleted explicitly before the rows, with a reconciliation job for
  failures. In the same transaction, import-map rows for the list and its children are removed and a
  content-free list tombstone is written; the parent tombstone prevents re-import of the subtree.
- `tasks` deletion cascades to steps, linked resources, My Day rows, and attachments. R2 objects are
  deleted explicitly. Its import-map rows and those of its children are removed, and a content-free
  task tombstone is written; the parent tombstone covers its children.
- Deleting a recurring task deletes all rows with the same `series_id` in one transaction and all
  their attachments; a tombstone is written for each deleted imported task.
- Locally deleting an imported step, attachment, or linked resource removes its import-map row and
  writes a content-free tombstone for that entity; the parent task remains. Deleting a non-imported
  entity writes no tombstone.

### 9.3 D1 constraints that shape the schema

- Foreign keys are always enforced; `ON DELETE CASCADE` is the deletion mechanism.
- Maximum database size is **10 GB on Workers Paid** (500 MB Free). Text-only task data fits for a
  long time; attachments are in R2. Sharding/archival triggers are defined in §14.5.
- Maximum string/BLOB is **2 MB**. Notes are capped at 100,000 characters; recurrence JSON and all
  other text fields are far below the cap.
- Maximum **100 bound parameters per query**. Bulk inserts/updates are chunked to ≤100 parameters.
- Maximum **1,000 queries per Worker invocation** (Paid). Import ticks and export are paginated.

### 9.4 Indexes and query shapes

- List access always joins `list_members` on `user_id` and checks the role.
- My Day queries use `(user_id, day)` and join tasks for completion.
- Search uses a case-insensitive `LIKE` on title/notes joined to membership; FTS5 is validated in
  M0 and may replace it behind the same endpoint.
- Polling uses a list snapshot with a computed ETag from `lists.updated_at`, `MAX(tasks.updated_at)`,
  and task count; unchanged snapshots return 304. Step, attachment, recurrence-successor, and My Day
  changes that affect the snapshot must bump a timestamp included in the ETag (task `updated_at` or
  a user-scoped My Day timestamp); otherwise a poll would miss them.

---

## 10. API design

### 10.1 Conventions

- Base path: `/api/v1`. JSON in and out (except attachment upload/download). camelCase fields.
- Authentication: `Authorization: Bearer <ToDo app access token>`. The token is an Entra access
  token for the ToDo API registration, validated by the Worker.
- Errors: `{ "error": { "code": string, "message": string, "details": object|null, "requestId": string } }`.
- Status policy:
  - 400 malformed request
  - 401 missing/invalid token
  - 403 authenticated but insufficient role
  - 404 not found **or** not a member (non-disclosure)
  - 409 version conflict, duplicate import job, or invite state conflict
  - 413 payload too large
  - 422 validation failure (including malformed sort keys and recurring-task move)
  - 429 rate limited (includes `Retry-After`)
  - 500 unexpected
- Versioning: breaking changes require `/api/v2`.
- Request IDs: Worker generates a UUID and echoes it in the error envelope and a response header.
- CORS: the production Worker allows only the production Pages origin and
  `http://localhost:5173`; the dev Worker additionally allows the dev Pages project's
  preview-subdomain pattern. No arbitrary wildcards. Methods GET, POST, PATCH, DELETE, OPTIONS;
  headers `Authorization`, `Content-Type`, `X-Graph-Access-Token`, `If-None-Match`,
  `Idempotency-Key`; no credentials; preflight cached for 10 minutes.
- Pagination: all collection endpoints (tasks, views, search, members, invites, imports) use
  `?limit=` (max 100) and an opaque `cursor`; responses include `nextCursor`.
- Optimistic concurrency: `lists`, `tasks`, and `task_steps` carry `version`; updates to them
  (including `complete`, `reorder`, `move`, and step updates) require `expectedVersion`; mismatch
  returns 409 with the current row. Memberships, invites, attachments, and My Day use idempotent
  operations rather than version checks.
- Idempotent creates: client-generated UUIDv7 `id`; a duplicate create with the same id returns the
  existing row (or 409 if the payload differs materially). Attachment uploads carry an
  `Idempotency-Key`; a retry with the same key returns the existing attachment or finishes the
  missing R2 object.
- Request size: JSON ≤1 MB; multipart ≤25 MB; import tick ≤16 KB.

### 10.2 Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | none | Liveness only; no data |
| GET | `/me` | bearer | Current user, settings, pending invite count |
| GET | `/me/invites` | bearer | Pending invites matching the caller's verified email |
| PATCH | `/me/settings` | bearer | Update timezone, theme, first day, default list |
| DELETE | `/me` | bearer | Account deletion (preconditions enforced) |
| GET | `/me/export` | bearer | JSON export + attachment manifest |
| GET | `/me/export/attachments/:id?token=` | signed token | Short-lived attachment download |
| GET | `/lists` | bearer | Owned and shared lists with roles |
| POST | `/lists` | bearer | Create a list |
| GET | `/lists/:id` | member | List metadata and members |
| PATCH | `/lists/:id` | owner | Rename/reorder with `expectedVersion` |
| DELETE | `/lists/:id` | owner | Hard-delete list and children |
| GET | `/lists/:id/tasks` | member | Snapshot; `view` is open, completed, or all; ETag |
| POST | `/lists/:id/tasks` | editor | Create task |
| GET | `/tasks/:id` | member | Task detail |
| PATCH | `/tasks/:id` | editor | Update with `expectedVersion` |
| DELETE | `/tasks/:id` | editor | Delete task or entire series |
| POST | `/tasks/:id/reorder` | editor | Set `sortKey` with `expectedVersion` |
| POST | `/tasks/:id/move` | editor on both | Move non-recurring task with `expectedVersion` |
| POST | `/tasks/:id/complete` | editor | Complete/reopen with `expectedVersion` |
| POST | `/tasks/:id/steps` | editor | Add step |
| PATCH | `/steps/:id` | editor | Edit/complete/reorder step with `expectedVersion` |
| DELETE | `/steps/:id` | editor | Delete step |
| POST | `/tasks/:id/attachments` | editor | Multipart upload ≤25 MB |
| GET | `/attachments/:id` | member | Authenticated download |
| DELETE | `/attachments/:id` | editor | Delete row + R2 object |
| POST | `/tasks/:id/my-day` | member | Add to today's My Day |
| DELETE | `/tasks/:id/my-day` | member | Remove from today's My Day |
| GET | `/views/my-day` | bearer | Private My Day |
| GET | `/views/planned` | bearer | Planned |
| GET | `/views/important` | bearer | Important |
| GET | `/views/tasks` | bearer | All open tasks |
| GET | `/views/completed` | bearer | Completed tasks |
| GET | `/search` | bearer | Title/notes search |
| POST | `/imports` | bearer | Start import job `{ includeShared }` |
| GET | `/imports` | bearer | The caller's recent import jobs |
| GET | `/imports/:id` | owner | Job status/summary |
| POST | `/imports/:id/tick` | owner | Process one bounded batch |
| POST | `/imports/:id/cancel` | owner | Cancel job |
| DELETE | `/imports/history` | bearer | Reset import map + tombstones |
| GET | `/lists/:id/members` | member | Member list |
| POST | `/lists/:id/invites` | owner | Invite `{ email, role }` |
| GET | `/lists/:id/invites` | owner | Pending and accepted invites for the list |
| DELETE | `/lists/:id/invites/:inviteId` | owner | Revoke |
| POST | `/lists/:id/invites/:inviteId/resend` | owner | New token + email |
| GET | `/invites/:token/preview` | none (rate-limited) | List name, inviter, role, status |
| POST | `/invites/:token/accept` | bearer | Accept invite |
| DELETE | `/lists/:id/members/:userId` | owner | Remove member |
| POST | `/lists/:id/leave` | member (not owner) | Leave a shared list |
| PATCH | `/lists/:id/members/:userId` | owner | Change editor/viewer role |
| POST | `/lists/:id/transfer` | owner | Transfer ownership |

### 10.3 Import tick contract

Request:

```http
POST /api/v1/imports/{jobId}/tick
Authorization: Bearer <todo-app-token>
X-Graph-Access-Token: <graph-access-token>
Content-Type: application/json

{ "cursor": "opaque-from-previous-tick" }
```

Response (one of):

```json
{
  "status": "running",
  "phase": "tasks",
  "cursor": "opaque",
  "counts": { "lists": 3, "tasks": 42, "steps": 7, "attachments": 2 },
  "done": false
}
```

```json
{ "status": "paused", "reason": "throttled", "retryAfterSeconds": 30, "cursor": "opaque" }
```

```json
{ "status": "token_expired", "cursor": "opaque" }
```

```json
{ "status": "completed", "summary": { "...": "..." }, "done": true }
```

Rules: at most one tick in flight per job; each tick processes a bounded batch; the token is never
stored; a `token_expired` result makes no Graph call.

### 10.4 Polling contract

- `GET /lists/:id/tasks` returns a snapshot and an `ETag`.
- Clients send `If-None-Match`; unchanged snapshots return 304.
- Poll only while the document is visible, every 10–15 seconds, with exponential backoff after
  errors, stopping after 5 minutes of no interaction. Refetch on window focus and after a
  successful local mutation. Optimistic local updates are reconciled by the server response or a
  409.
- Deleting a task changes the task count and/or `MAX(updated_at)`, so the ETag changes; there is no
  separate deletion feed in v1.

---

## 11. Architecture and deployment

### 11.1 Component diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│ Cloudflare Pages — /src/page                                          │
│ React + Vite + Tailwind/shadcn + TanStack Query + MSAL.js + IndexedDB │
│ Service worker (app shell only)                                       │
└───────────────┬───────────────────────────────┬──────────────────────┘
                │ HTTPS, bearer API token       │ OAuth / token acquisition
                ▼                               ▼
┌───────────────────────────────────┐   ┌───────────────────────────────┐
│ Cloudflare Worker — /src/worker   │   │ Microsoft identity platform   │
│ Hono + Zod + Drizzle              │   │ login.microsoftonline.com     │
│ Auth, lists, tasks, sharing,      │   └───────────────────────────────┘
│ import orchestration, export      │
└───────┬───────────────┬───────────┘
        │               │
        ▼               ▼
┌───────────────┐  ┌───────────────┐   ┌───────────────────────────────┐
│ D1            │  │ R2            │   │ Microsoft Graph (import only) │
│ metadata      │  │ attachments   │   │ graph.microsoft.com/v1.0      │
└───────────────┘  └───────────────┘   └───────────────────────────────┘
        ▲                  ▲                        ▲
        └────────── Worker bindings / fetch ────────┘

┌───────────────────────────────┐
│ Resend (invite email)         │  ← called by the Worker
└───────────────────────────────┘
```

The SPA never calls Graph for task data. It obtains a Graph token and hands it to the Worker per
import tick. The Worker never stores that token.

### 11.2 Repository layout

```
/
├── src/
│   ├── page/          # Vite React app (Pages project)
│   ├── worker/        # Hono Worker entry, routes, services, db
│   └── shared/        # Zod schemas, API types, constants (imported by both)
├── migrations/        # Drizzle-generated SQL applied by wrangler
├── docs/
│   └── PRD.md
├── package.json
├── vite.config.ts
├── wrangler.toml
└── tsconfig*.json
```

`/src/shared` is the only addition to the requested `/src/page` + `/src/worker` split; it holds the
contract types and validators both sides must agree on. If the split must be literal, the same
files can live under `/src/worker/shared` and be imported by the page build, at the cost of a
slightly awkward dependency direction.

### 11.3 Deployment

- **Two Cloudflare projects**, both using Workers Builds from the same repository:
  - Pages project: build `/src/page`, output `dist`, environment variables for
    `VITE_ENTRA_SPA_CLIENT_ID`, `VITE_ENTRA_API_CLIENT_ID`, `VITE_API_BASE_URL`.
  - Worker project: entry `/src/worker/index.ts`, D1 and R2 bindings, vars for
    `ENTRA_API_CLIENT_ID`, `ENTRA_API_AUDIENCE`, `ALLOWED_ORIGINS`, `KILL_SWITCH`, and
    `RESEND_FROM_EMAIL`; secrets `EXPORT_SIGNING_SECRET` and `RESEND_API_KEY`.
- **Environments:** `dev` and `prod`, each with its own D1 database and R2 bucket. Preview builds
  point at the dev Worker; the production Worker never allows preview origins. The dev Worker
  allowlist is the dev Pages origin, localhost, and the dev Pages project's preview-subdomain
  pattern.
- **Build gating:** each project's build command runs the test suite before building. If Workers
  Builds cannot run `workerd`-backed D1 tests, M0 must add a documented pre-deploy gate and the
  deviation must be recorded in the test strategy; the database tier may not be silently skipped.
- **Migrations:** `wrangler d1 migrations apply` is an explicit, guarded production step, never
  automatic on preview builds. Migrations are generated by Drizzle and reviewed as SQL.
- **Rollback:** Worker versions can be rolled back in Cloudflare; D1 migrations must be
  backward-compatible for at least one release. Destructive migrations require a backup and a
  separate release.
- **Static Assets risk:** Cloudflare is steering new projects toward Workers Static Assets. Pages
  remains supported, but the `/src/page` boundary must keep a later move cheap.

### 11.4 Runtime and limits

- Workers **Paid** plan is required: request volume from polling, import ticks, and CPU limits
  exceed the Free plan.
- Workers request body limit comfortably exceeds the 25 MB attachment cap; uploads are streamed.
- D1 is a single database per environment. See §9.3 for limits and §14.5 for scale triggers.
- R2 objects are private; all access is through the Worker.
- No Durable Objects or Queues are required for v1. A scheduled reconciliation job for R2 orphans
  and expired export artifacts may use a Cloudflare Cron Trigger; otherwise it runs as an
  authenticated maintenance endpoint invoked by the operator.

### 11.5 Observability

- Structured JSON logs with request ID, route, status, latency, user ID (not email), and error code.
- Never log Authorization headers, Graph tokens, invite tokens, or task content.
- Cloudflare analytics for traffic, 5xx, and latency; alerts for 5xx rate, import failure rate,
  D1 size, and R2 storage/operations cost.
- Client errors report a request ID and a coarse code, never a token or task body.
- A health endpoint reports liveness only; it does not expose bindings or versions.

---

## 12. Security, privacy, and abuse

### 12.1 Threat model summary

| Threat | Control |
|---|---|
| Stolen API token / XSS in the SPA | Strict CSP, no third-party scripts, React escaping, plain-text notes, short-lived tokens, no tokens in logs, `Referrer-Policy: no-referrer`; browser-held MSAL tokens remain an accepted risk |
| IDOR on lists/tasks/attachments | Every query joins membership; non-members get 404; IDOR tests for every route |
| Forged/foreign JWT | Signature via JWKS, issuer bound to `tid`, audience = API client, `scp` check, `exp`/`nbf`, RS256 only |
| Invite token leakage | 256-bit token, SHA-256 at rest, 7-day expiry, revoke, email match when available, enumeration-safe responses, rate limits |
| Malicious attachment | Private R2, authenticated download, `Content-Disposition: attachment`, `nosniff`, filename sanitization, no inline rendering, 25 MB cap; no AV (accepted) |
| SQL injection | Drizzle parameterized queries; no string-built SQL; escaped `LIKE` wildcards |
| Stored XSS via notes/titles | Plain-text rendering; no HTML/Markdown in v1 |
| CORS abuse | Exact origin allowlist; no credentials; bearer headers only |
| CSRF | No cookies for API auth; bearer token is not sent automatically |
| Abuse / cost | Rate limits, import concurrency 1/user, upload caps, bot protection, spend alerts, kill switch |
| Enumeration | Uniform 404 for non-members; uniform invite-preview failure |

### 12.2 Authentication and authorization

- Validate access tokens with `jose` against the common JWKS, caching keys with a bounded TTL.
- Require `iss = https://login.microsoftonline.com/{tid}/v2.0` where `{tid}` matches the token's
  `tid` claim; allow the consumer tenant for personal accounts.
- Require `aud` to equal the API client ID or the API Application ID URI, and `scp` to contain
  `access_as_user`. Reject `alg` other than RS256.
- Provision/update the user from claims only after validation.
- Authorization is centralized in a single membership resolver used by every route. There is no
  route that trusts a list ID, task ID, attachment ID, or role from the client without a membership
  lookup.
- Role checks: owner-only actions are explicit; editor writes require editor or owner; viewer
  reads require any membership.

### 12.3 Secrets and configuration

- `RESEND_API_KEY`, `EXPORT_SIGNING_SECRET`, and any future provider secret are Worker secrets via
  `wrangler secret`; never in source, Pages vars, or client bundles.
- Entra client IDs and API audience are public identifiers and may be build-time vars.
- Rotate the export signing secret on a schedule and on suspected exposure; existing export links
  expire in 15 minutes anyway.
- The R2 binding and D1 binding are not exposed to the browser.

### 12.4 Browser security

- Content-Security-Policy:
  - `default-src 'self'`
  - `script-src 'self'`
  - `connect-src 'self' https://<api-origin> https://login.microsoftonline.com https://graph.microsoft.com`
  - `frame-src https://login.microsoftonline.com`
  - `img-src 'self' data: blob:`
  - `style-src 'self' 'unsafe-inline'` (Radix/shadcn inline styles)
  - `font-src 'self'`
  - `frame-ancestors 'none'`
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`,
  `Permissions-Policy` denying camera/microphone/geolocation.
- No third-party scripts or tag managers. Analytics must be server-side or first-party and
  PII-free.

### 12.5 Privacy

- Data collected: Microsoft identity identifiers, display name, email/UPN, task content,
  attachments, timestamps, and import metadata. No advertising identifiers, no tracking pixels.
- Purpose: providing the service, migration, sharing, abuse prevention, and support.
- Subprocessors: Cloudflare (Pages, Workers, D1, R2), Microsoft (identity and Graph import), Resend
  (invite email).
- Retention: active data until deletion; export audit rows 90 days; import jobs ≤10 per user or 30
  days; D1 Time Travel backups up to 30 days; R2 orphan cleanup promptly.
- User rights: export and deletion are self-service. Deletion keeps shared-list content with
  anonymized attribution as described in FR-EX-05.
- Legal: Terms of Service and Privacy Policy are launch gates. Microsoft Graph data is not used for
  advertising or sold. Microsoft publisher verification is a launch gate. Legal review also confirms
  the minimum age and operating jurisdiction; the service is not directed at children.
- Logs contain user IDs, not emails or task content.

### 12.6 Abuse guardrails (no product quotas)

Published limits (the UI and docs state them):

| Limit | Value |
|---|---|
| Attachment size | 25 MB per file |
| Attachments per task | 50 |
| Steps per task | 200 |
| Title / notes / list name | 1,000 / 100,000 / 200 characters |
| Import jobs | 1 running per user |
| Import ticks | 120/minute/user |
| General API | 120 requests/minute/user |
| Uploads | 30/minute/user |
| Invites | 20/hour/user |
| Exports | 1/hour/user |
| Invite preview | 30/minute/IP |

Additional controls: Cloudflare bot protection on invite and API surfaces, R2 spend alerts, D1 size
alerts, and a `KILL_SWITCH` Worker var that disables imports and uploads while keeping reads
available. Rate limits are enforced with Cloudflare rate-limiting rules/bindings where possible;
stateful limits (import ticks, uploads, exports) use per-user counters keyed in D1. The kill switch
is tested in M6.

### 12.7 Accepted risks

- No antivirus/content scanning of uploaded files. Mitigations are private access, forced download,
  no inline rendering, and rate limits. A future version may add scanning.
- No end-to-end encryption. The operator can read task content and attachments.
- MSAL tokens are held in browser storage (`localStorage` for persistence) to keep users signed in.
  A successful XSS could steal them; strict CSP and no third-party scripts are the mitigation.
- Free, no-product-quota public access exposes the operator to cost. Guardrails bound the common
  cases; a determined abuser can still cost money. Spend alerts and the kill switch are the
  backstop.
- The Graph To Do API will retire; re-import is a time-limited capability.
- Removed members or deleted accounts may retain offline caches on other devices until those
  devices reconnect; the app purges on the next authenticated 401/403. This is inherent to offline
  access.

---

## 13. Testing strategy

This project adopts the global **Testing & TDD Standard** for backend/API code. The frontend is
verified manually end-to-end, as the standard allows. Tests are written RED-first for the hot spots
below.

### 13.1 Tiers mapped to this stack

| Tier | Claims | Tooling | Runs |
|---|---|---|---|
| **Unit** | Permission matrix, Zod validation, sort-key validation, recurrence/DST math, RRULE mapping, import field mapping, JWT claim rules | Vitest | Always, offline |
| **Model** | Drizzle schema, generated SQL shapes, constraints/indexes, cascade definitions | Vitest + Drizzle introspection | Always, offline, no connection |
| **Database** | Migrations apply; FK cascades; unique/partial-unique constraints; hard delete; My Day uniqueness; import map/tombstone behaviour; search scoping; row round-trip | Vitest + `@cloudflare/vitest-pool-workers` with a real local D1 | Always, offline |
| **Host** | Worker boots with bindings; missing configuration fails; every route registers; anonymous 401; CORS preflight; `/me` | Workers pool / `SELF.fetch` | Always, no external DB |
| **External service** | Graph adapter mapping and Resend adapter contract | Recorded Graph fixtures for mapping; live checks against a dev MSA/work account and a Resend test address | **Verification-only**, not CI |
| **Frontend** | Core flows: sign-in, import, CRUD, sharing, offline replay, conflict review, PWA install | Manual end-to-end checklist | Per release |

### 13.2 Deliberate deviations and seams

- **D1 is embedded in `workerd`.** The database tier runs against the real SQLite engine through a
  local D1 binding, offline, with no container. It therefore always runs and is not container-tagged
  or skipped. This is a stronger availability story than a container-backed tier, not a weaker one.
- **No fake repository or fake D1.** Tests use the real local D1. There is no in-memory stand-in.
- **No Graph or Resend emulator exists.** The import field mapping is unit-tested against recorded
  Graph JSON fixtures. The HTTP adapters are thin. Live import and email delivery are
  **verification-only**: they are run against a development Microsoft account and a Resend test
  address, and the result is recorded. No test claims to drive HTTP → Graph → D1 end to end.
- **Seam stated:** authorization is proven by unit + database + host tests; Graph import is proven
  by fixture mapping + manual verification; the two are not wired together in an automated test.
  This is a known seam, not coverage.
- **Frontend** is manual per the standard; the PRD's journeys and UX states are the checklist.

### 13.3 TDD hot spots (test-first required)

1. **Authorization and ownership:** role matrix on lists, tasks, steps, attachments, members,
   invites, transfer, export; non-member 404; viewer 403.
2. **Token validation:** signature, issuer/`tid` binding, audience, scope, expiry, algorithm,
   consumer tenant, malformed token.
3. **Invite acceptance:** valid, expired, revoked, wrong email, no-email claim, already a member,
   enumeration-safe failures.
4. **Input validation at the boundary:** title/notes lengths at the limit, sort-key format, RRULE
   fields, upload size (25 MB and 25 MB + 1), filename sanitization, search wildcard escaping.
5. **Structural inputs:** search terms, sort keys, R2 keys, filenames, and any value that reaches a
   query, path, or header. Parameterize or allowlist before use, and assert rejection.
6. **Recurrence idempotency:** concurrent completion creates one successor; DST boundaries;
   series deletion.

### 13.4 Test data and isolation

- One local D1 database per test run, migrated to head once. Tests isolate by row and by unique IDs;
  no test asserts on a table as a whole.
- The test database is not dropped at teardown so a failure can be inspected. The next run recreates
  it.
- Tests that need a schema of their own (for example, a deliberately broken migration) use a
  uniquely named scratch database and drop it when done.
- No test depends on another test class's rows.

### 13.5 CI

- Each Workers Builds project's build command runs `npm test` (unit, model, database, host) before
  building.
- If `workerd`-backed tests cannot run in the build environment, a pre-deploy gate is mandatory and
  the gap is recorded here; the database tier is not skipped silently.
- Import/email live verification is a manual release step with the account and result recorded in
  the release notes.

---

## 14. Non-functional requirements

### 14.1 Performance

- p95 authenticated list snapshot < 300 ms from the same region.
- p95 task write < 250 ms.
- App shell initial JS < 300 KB gzipped; LCP < 2.5 s on a simulated 4G connection; CLS < 0.1.
- Polling interval 10–15 s only while visible; no polling in background tabs.
- Import: ≤50 tasks per tick; a 1,000-task import completes in a reasonable number of ticks without
  blocking other requests.

### 14.2 Availability and degradation

- Target 99.9% monthly availability, inherited from Cloudflare.
- If D1 is unavailable, return 503 with a retryable error; the SPA shows cached data if available.
- If Resend is unavailable, invites still work through a copyable link.
- If Graph is throttled, the import pauses and resumes; it never spins.

### 14.3 Durability and backups

- D1 Time Travel provides point-in-time restore; a restore drill is a launch gate.
- R2 provides durable object storage.
- A scheduled reconciliation job removes orphaned R2 objects and expired export artifacts.
- No user-facing backup export beyond §7.9.

### 14.4 Browser and platform support

- Latest two versions of Chrome, Edge, Firefox, and Safari; iOS Safari 16+.
- Installable PWA on Chromium; Add to Home Screen on iOS Safari.
- Offline reads on all supported browsers; offline writes on browsers with IndexedDB and the
  service worker (all supported).
- Background Sync is used where available; iOS falls back to foreground drain.

### 14.5 Scale assumptions and triggers

- Design point: 10,000 registered users, 1 million tasks, 50,000 attachments, 10% monthly active.
- D1 is one 10 GB database. Define triggers before launch:
  - DB > 7 GB or > 5 million task rows → plan sharding by user/workspace.
  - Rows written/day approaching the plan limit → archive completed tasks or move to a larger plan.
  - p95 snapshot latency > 500 ms → add indexes or paginate completed tasks.
- R2 storage/operations cost is monitored weekly.

### 14.6 Limits

See §12.6. Limits are published in the app and enforced server-side. Client-side checks are UX
only; the server is authoritative.

### 14.7 Accessibility and i18n

- WCAG 2.1 AA target; keyboard-only operation for create, complete, reorder, share, and import.
- English UI only. IANA timezones, locale-aware date/number formatting, and 12/24-hour display are
  supported.

### 14.8 Observability

- Structured logs, request IDs, error codes, latency, and counts.
- Alerts: 5xx rate, import failure/pause rate, D1 size, R2 spend, Resend failures.
- No PII or token logging.
- A public status/health endpoint is liveness-only.

---

## 15. Roadmap and milestones (no dates)

### M0 — Foundations

Repo split; Pages + Worker skeleton; Hono/Drizzle/Zod; D1/R2 bindings; MSAL sign-in; JWT
validation; CORS; `/me`; test tiers; dev deploy.

**Exit:** anonymous calls return 401; an authenticated `/me` works; migrations apply; unit, model,
database, and host tiers run in the build gate or the documented pre-deploy gate.

### M1 — Personal core

Lists, tasks, steps, ordering, smart views, search, PWA shell, offline reads.

**Exit:** personal CRUD works end to end; refresh restores cached lists; search is access-scoped;
the app installs.

### M2 — Sharing

Memberships, invites, roles, Resend, polling, the permission matrix.

**Exit:** owner/editor/viewer matrix and IDOR tests pass; invite/accept/revoke/resend/transfer
lifecycle works across two tenants.

### M3 — Import

Graph consent, resumable ticks, mapping including steps/links/recurrence/attachments, tombstones,
summary, shared-list opt-in.

**Exit:** a work account and a personal account both import; a repeat import is idempotent; token
expiry resumes; 429 handling works; the summary is accurate.

### M4 — Recurrence and attachments

Occurrence engine, DST cases, upload/download, R2 lifecycle.

**Exit:** the unique occurrence constraint holds under concurrent completion; series deletion
removes all occurrences and attachments; a 25 MB round-trip and attachment authorization tests pass.

### M5 — Offline writes

Queue, idempotency, conflict review, cache purge.

**Exit:** airplane-mode replay works; the version-conflict review path works; a list that became
shared blocks replay.

### M6 — Launch hardening

Export with access controls, account deletion/anonymization, legal pages, accessibility audit,
observability, spend alerts, publisher verification, restore drill.

**Exit:** the launch checklist in Appendix D is signed off and a restore drill has been completed.

### Post-v1

Reminders/push, list groups, per-task assignees, real-time collaboration, billing, i18n, tenant
features.

---

## 16. Risks and open questions

| Risk | Impact | Mitigation |
|---|---|---|
| Graph To Do API retires sooner than expected | Re-import stops working | Import early; store all source IDs and raw recurrence now; the app is independent after import |
| Microsoft's published export format is unusable or late | Users cannot migrate outside Graph | Graph is the primary path; document the export limitation |
| Tenant consent policies block the app | Work users cannot sign in | Admin-consent fallback and publisher verification; personal accounts remain available |
| Some accounts lack To Do or return `MailboxNotEnabledForRESTAPI` | Import fails for that account | Clear, actionable error; skip and allow manual list creation; no retry loop |
| MSAL 24-hour refresh / third-party cookie blocking | Re-import requires interactive sign-in | State it in the wizard; keep sessions short and explicit |
| Free public access with no product quotas | Cost and abuse | Published guardrails, rate limits, spend alerts, kill switch, Workers Paid |
| No attachment AV scanning | Malware distribution risk | Private access, forced download, no inline render, rate limits; accepted risk |
| D1 10 GB ceiling | Scale ceiling | Text-only data, R2 for files, scale triggers, sharding plan |
| Workers CPU/request limits during import | Partial imports | Bounded ticks, pause/resume, single-flight, paid plan |
| Lossy recurrence conversion | Wrong future dates | Preserve raw recurrence, normalize what is safe, flag unsupported patterns, test DST |
| Re-import does not update changed source items | Stale data during transition | Documented merge-new semantics; re-import is for additions |
| Cloudflare Workers Builds cannot run all tiers | Test gap | Verify in M0; add a pre-deploy gate if needed; never skip silently |
| Name collision with Microsoft To Do | User confusion or a trademark challenge | The product intentionally reuses the name; obtain legal review before public launch and avoid Microsoft logos/branding |

**Open questions to resolve before launch (not before implementation):**

1. Production domain names and the final product name.
2. Whether a second Cloudflare environment is needed for preview deploys.
3. Whether FTS5 is stable enough in D1 to replace `LIKE` in v1.
4. Whether Resend's webhook/bounce handling is needed in v1 or can be monitored manually.
5. The exact legal jurisdiction and privacy-policy text.

---

## 17. Appendices

### Appendix A — Graph → ToDo field mapping

| Graph To Do | ToDo | Notes |
|---|---|---|
| `todoTaskList.displayName` | `lists.name` | Truncate to 200 with a summary flag |
| `todoTaskList.isOwner` | import filter | Owned lists default; shared lists opt-in |
| `todoTaskList.isShared` | summary warning | Membership cannot be reconstructed |
| `todoTaskList.wellknownListName` | default-list hint | `defaultList` may become the user's default |
| `wellknownListName = flaggedEmails` | Normal list + linked resources | Imported as a normal list; no special behavior |
| `todoTask.title` | `tasks.title` | Truncate to 1,000 with a flag |
| `todoTask.body.content` | `tasks.notes` | Plain text; cap 100,000 |
| `todoTask.dueDateTime` | `tasks.due_at` + `due_time_zone` | Preserve timezone |
| `todoTask.startDateTime` | `tasks.start_at` | Preserve |
| `todoTask.reminderDateTime` | `tasks.reminder_at` | Stored; not scheduled in v1 |
| `todoTask.importance` | `tasks.importance` | `high` drives the Important view |
| `todoTask.status` | `tasks.completed_at` | Completed when status is `completed` |
| `todoTask.completedDateTime` | `tasks.completed_at` | Preserve timestamp |
| `todoTask.createdDateTime` | `tasks.created_at` | Preserve |
| `todoTask.lastModifiedDateTime` | `tasks.updated_at` | Preserve |
| `todoTask.recurrence` | `recurrence_raw` + `recurrence_rule` + timezone | Map supported patterns; flag the rest |
| `checklistItems[]` | `task_steps` | Preserve checked state and order |
| `linkedResources[]` | `task_linked_resources` | Preserve URL and names |
| `attachments[]` (metadata) | `attachments` | `/$value` for content; 25 MB cap |
| Attachment >25 MB | `attachments` row with `skipped_too_large` | No R2 object; summary entry |
| Manual task order | — | Not exposed by Graph; import in API order |
| My Day history | — | Not exposed; excluded |
| List groups | — | Not exposed; lists are flattened |
| Themes | — | Not imported |
| Fine-grained membership | — | Not exposed; shared lists are opt-in copies |

### Appendix B — Permission matrix

| Action | Owner | Editor | Viewer | Non-member |
|---|---|---|---|---|
| View list, tasks, steps, attachments | Yes | Yes | Yes | 404 |
| Create/edit/reorder/complete/delete task | Yes | Yes | No (403) | 404 |
| Create/edit/delete steps | Yes | Yes | No | 404 |
| Upload/download attachments | Yes | Yes | Download only | 404 |
| Delete attachments | Yes | Yes | No | 404 |
| Add/remove own My Day | Yes | Yes | Yes | 404 |
| Read/write notes | Yes | Yes | Read only | 404 |
| Search within accessible lists | Yes | Yes | Yes | Scoped out |
| Invite members | Yes | No | No | 404 |
| Revoke/resend invites | Yes | No | No | 404 |
| Change member roles | Yes | No | No | 404 |
| Remove members | Yes | No | No | 404 |
| Leave list | No (must transfer/delete) | Yes | Yes | — |
| Rename/reorder list | Yes | No | No | 404 |
| Delete list | Yes | No | No | 404 |
| Transfer ownership | Yes | No | No | 404 |
| Export everything accessible | Yes | Yes | Yes | — |

Export is a per-user, read-only action and follows decision 23: any member may export every list
they can access, including other members' content, with the controls in FR-EX-02.

### Appendix C — To Do feature parity matrix

| Feature | v1 | Reason |
|---|---|---|
| Lists, tasks, notes, due dates, importance | Yes | Core |
| Steps/subtasks | Yes | Core |
| My Day, Planned, Important, Tasks, Completed | Yes | Core |
| Drag-reorder | Yes | Core |
| Search | Yes | Core |
| Shared lists with roles | Yes | Core |
| Attachments | Yes | Decision 4 |
| Recurring tasks | Yes | Decision 4 |
| Reminders/push | No | Deferred to v1.1; timestamps imported |
| List groups/folders | No | Deferred to v1.1 |
| Per-task assignees | No | Different product; deferred |
| Real-time collaboration | No | Polling in v1 |
| Email-to-task | No | Out of scope |
| Calendar/Teams/Planner integration | No | Out of scope |
| Native apps | No | PWA only |
| Themes/list colors | No | Light/dark only |
| Anonymous link sharing | No | Security decision |
| ZIP export | No | JSON + attachment links |
| Antivirus scanning | No | Accepted risk |

### Appendix D — Launch checklist

- [ ] Terms of Service and Privacy Policy published.
- [ ] Microsoft publisher verification completed.
- [ ] Entra app registrations reviewed; redirect URIs contain no localhost in production.
- [ ] Security review: JWT validation, IDOR matrix, invite flow, attachment serving, CORS, CSP.
- [ ] Accessibility audit against WCAG 2.1 AA for the core flows.
- [ ] D1 Time Travel restore drill completed and recorded.
- [ ] R2 orphan reconciliation job tested.
- [ ] Import verified with a work account and a personal account, including a resume and a 429.
- [ ] Resend domain verified (SPF/DKIM); invite delivery and failure fallback verified.
- [ ] Spend alerts configured for Workers, D1, R2, and Resend.
- [ ] Uptime check and alert configured for the API and the Pages app.
- [ ] Kill switch tested: imports and uploads disabled, reads still work.
- [ ] Export tested for a user with owned and shared lists; links expire and are access-bound.
- [ ] Account deletion tested for an owner of a shared list and a member of someone else's list.
- [ ] PWA install and offline read/replay verified on Chromium and iOS Safari.
- [ ] Error pages, 404, offline, conflict, and rate-limit states reviewed.

### Appendix E — Environment variables and secrets

| Name | Location | Secret | Purpose |
|---|---|---|---|
| `VITE_ENTRA_SPA_CLIENT_ID` | Pages build | No | MSAL client ID |
| `VITE_ENTRA_API_CLIENT_ID` | Pages build | No | API scope audience |
| `VITE_API_BASE_URL` | Pages build | No | Worker base URL |
| `ENTRA_API_CLIENT_ID` | Worker var | No | Token audience validation |
| `ENTRA_API_AUDIENCE` | Worker var | No | `api://…` audience |
| `ALLOWED_ORIGINS` | Worker var | No | CORS allowlist |
| `EXPORT_SIGNING_SECRET` | Worker secret | Yes | Expiring export links |
| `RESEND_API_KEY` | Worker secret | Yes | Invite email |
| `RESEND_FROM_EMAIL` | Worker var | No | Verified sender address |
| `KILL_SWITCH` | Worker var | No | Disable imports/uploads |
| `DB` | Worker binding | — | D1 database |
| `BUCKET` | Worker binding | — | R2 bucket |

### Appendix F — Glossary

- **ToDo:** this product. Microsoft's retiring product is written **Microsoft To Do** (two words);
  the two are not affiliated.
- **Access token:** short-lived token the SPA sends to the ToDo app API.
- **API registration:** Entra app registration that exposes `access_as_user`.
- **Graph token:** short-lived token for Microsoft Graph, obtained by the SPA and passed per import
  tick.
- **My Day:** a private, per-user, per-day task flag.
- **Occurrence:** one task row in a recurring series.
- **Series:** all occurrences sharing `series_id`; deleting any one deletes the series in v1.
- **Tombstone:** a content-free record of a deleted imported source ID.
- **Unshared list:** a list with exactly one active member at enqueue time.
- **25 MB:** 25 MiB = 26,214,400 bytes, matching the Graph attachment ceiling; the server enforces
  the byte value.
- **Tick:** one bounded import batch processed by the Worker.

### Appendix G — Sources

- Microsoft To Do → Planner retirement guidance: https://support.microsoft.com/en-us/planner/to-do-to-planner
- The Verge, To Do shutdown: https://www.theverge.com/tech/1037558/microsoft-to-do-shutdown-planner
- PCMag, seven-month window: https://uk.pcmag.com/productivity/168462/microsoft-is-killing-to-do-leaving-you-7-months-to-find-an-alternative
- Microsoft Graph `todoTask` (v1.0), including recurrence: https://learn.microsoft.com/graph/api/resources/todotask?view=graph-rest-1.0
- Microsoft Graph `todoTaskList` (v1.0), `isOwner`/`isShared`: https://learn.microsoft.com/graph/api/resources/todotasklist?view=graph-rest-1.0
- Microsoft Graph `taskFileAttachment` GET and `$value`: https://learn.microsoft.com/graph/api/taskfileattachment-get?view=graph-rest-1.0
- Microsoft Graph To Do attachments, 25 MB / upload sessions: https://learn.microsoft.com/graph/todo-attachments
- MSAL SPA token acquisition and refresh-token lifetime: https://learn.microsoft.com/entra/identity-platform/scenario-spa-acquire-token
- Cloudflare D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- Cloudflare D1 foreign keys: https://developers.cloudflare.com/d1/sql-api/foreign-keys/

---

## 18. Decision traceability

### 18.1 Confirmed decisions

| # | Decision | Encoded in |
|---|---|---|
| 1 | Public SaaS, open sign-up | §2, §4, FR-ID-01 |
| 2 | Work/school + personal accounts | FR-ID-01, FR-ID-02 |
| 3 | One-time import + repeatable merge-new re-import; no write-back | FR-IM-04–06, §7.7 |
| 4 | v1 includes attachments and recurrence; reminders deferred | §7.5, §7.6, §4.3 |
| 5 | Email invite; owner/editor/viewer; no public links; no assignees | FR-SH-01–07, §4.3 |
| 6 | Polling + optimistic UI; version checks; no Durable Objects | §10.4, FR-LT-05, §11.4 |
| 7 | Offline reads + queued writes for unshared lists only | FR-OF-03–06 |
| 8 | MSAL.js SPA + Worker bearer JWT; no server session | FR-ID-01–08, §12.2 |
| 9 | Worker-side resumable import driven by SPA ticks | FR-IM-04, §10.3 |
| 10 | `/src/page` + `/src/worker`; Workers Builds; dev + prod | §11.2, §11.3 |
| 11 | React + Vite + Tailwind/shadcn + dnd-kit + TanStack Query | §8, §11.1 |
| 12 | Free, no product quotas; technical guardrails | §12.6, §4.3 |
| 13 | Resend invite email with copyable fallback | FR-EM-01–05 |
| 14 | One-click import wizard; skippable/repeatable | §6.1, FR-IM-11 |
| 15 | Shared completion; private My Day; global recurrence | FR-SH-08–09, FR-RC-03 |
| 16 | Immediate hard delete; owner-exit resolution | FR-LT-07, FR-EX-04–06, §9.2 |
| 17 | Hobby pace; milestone roadmap, no dates | §15 |
| 18 | Product name ToDo | Cover, §16 |
| 19 | Hono + Drizzle + Zod | §11.1, §13 |
| 20 | No tenant/org features in v1 | §4.3, FR-ID-07 |
| 21 | JSON export + attachment links; no ZIP | FR-EX-01–03 |
| 22 | Content-free import tombstones; reset history | FR-IM-06–07, §9.1 |
| 23 | Export everything accessible, with controls | FR-EX-01–02, Appendix B |
| 24 | Recurrence delete is series-wide only | FR-RC-05, FR-LT-07 |
| 25 | Server wins; local draft review | FR-OF-05 |
| 26 | Owned lists by default; shared import opt-in | FR-IM-08 |
| 27 | Keep shared content; anonymize attribution | FR-EX-05, §9.2 |

### 18.2 Gap-review corrections

| # | Correction | Encoded in |
|---|---|---|
| 1 | Tombstones vs hard delete resolved | FR-IM-06, §9.1–9.2 |
| 2 | "No quotas" = no product quotas; abuse guardrails, Workers Paid, kill switch | §12.6, §11.4 |
| 3 | Unshared list defined; membership-change replay blocked; cache purge | FR-OF-04–07 |
| 4 | Recurrence idempotency, series delete, raw recurrence, lossy conversion | FR-RC-01–07 |
| 5 | Two Entra registrations; two token resources; 24-hour refresh consequence | FR-ID-02, FR-IM-10 |
| 6 | Admin-consent fallback and publisher verification | FR-ID-07, Appendix D |
| 7 | Account-deletion attribution | FR-EX-05, §9.2 |
| 8 | Export controls | FR-EX-02 |
| 9 | Explicit search/ordering/conflict/invite rules | FR-SE, FR-LT-05, FR-OF-05, FR-SH-02–04 |
| 10 | Import fidelity limits and membership limitation | FR-IM-12, Appendix A |
| 11 | Bounded ticks, 429 handling, streaming attachments, oversize records | FR-IM-04, FR-IM-09, FR-AT-06 |
| 12 | Workers Builds two projects; tests in build; guarded migrations; preview policy | §11.3, §13.5 |
| 13 | Polling cost controls | §10.4, §11.5 |
| 14 | D1 scale triggers, R2 cleanup, restore drill | §14.3, §14.5, Appendix D |
| 15 | Pages vs Workers Static Assets migration risk | §11.3 |
| 16 | Reminder timestamps imported, not scheduled | FR-LT-02, Appendix A |
