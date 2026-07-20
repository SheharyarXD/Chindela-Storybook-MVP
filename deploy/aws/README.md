# AWS S3 Setup — Chindela Production Media Storage

These are the exact steps to run in the AWS Console. None of this requires
giving anyone the root password again — in fact, step 0 exists specifically
so root never needs to be used again after today.

## Step 0 — Stop using root after this (5 minutes, one-time)

Root can do anything in the account with no guardrails, so AWS's own guidance
is: use it once to bootstrap, then lock it away.

1. Log in to the AWS Console as root (console.aws.amazon.com).
2. **Enable MFA on the root user** (IAM → Security credentials → Assign MFA
   device). This alone stops most account-takeover risk.
3. Go to **IAM → Users → Create user**. Name it e.g. `chindela-admin`, enable
   console access, and attach the built-in policy `AdministratorAccess`.
4. Sign out of root. From here on, sign in as `chindela-admin` (there's a
   dedicated IAM sign-in URL shown on the IAM dashboard) for every step below
   and for all future account administration.

## Step 1 — Create the S3 bucket

1. **S3 → Create bucket**.
2. Bucket name: something globally unique, e.g. `chindela-bymjcic-media`
   (S3 bucket names are unique across *all* of AWS, not just your account —
   if that name is taken, `chindela-media-bymjcic` or similar works fine).
3. Region: pick one close to your users — `eu-west-2` (London) is a sensible
   default for a UK-facing site. Note whatever you choose; it's needed later.
4. **Block Public Access settings**: uncheck only the bottom two boxes —
   *"Block public access to buckets and objects granted through new public
   bucket policies"* and *"Block public and cross-account access to buckets
   and objects through any public bucket policies."* Leave the two ACL-related
   boxes checked. (We deliberately add one narrow public-read policy below —
   we are not using public ACLs at all.)
5. Leave everything else as default and create the bucket.

## Step 2 — Apply the bucket policy (public read, nothing else)

The app links directly to files in this bucket (story images, audio, video)
so browsers can load them — that requires public *read* access. Nothing else
about the bucket is public: no listing, no public writes, no public deletes.

1. Open [`bucket-policy.json`](./bucket-policy.json) in this folder, replace
   `REPLACE_WITH_BUCKET_NAME` with your actual bucket name.
2. In the bucket → **Permissions → Bucket policy → Edit**, paste it in and save.

## Step 3 — Apply the CORS configuration

The app uploads files directly from the browser to S3 (not through our
server), which requires CORS to be configured on the bucket.

1. Open [`cors-config.json`](./cors-config.json) in this folder — it's
   already scoped to `https://www.chindela-bymjcic.com`, no edits needed
   unless the final domain changes.
2. In the bucket → **Permissions → Cross-origin resource sharing (CORS) →
   Edit**, paste it in and save.

## Step 4 — Create the "folders"

S3 doesn't require folders to exist ahead of time (the app creates
`media/image/...`, `media/audio/...` etc. automatically on first upload of
each type), so this step is optional. If you'd like them visible from the
start, create these empty folders via **S3 → your bucket → Create folder**:

- `media/image/`
- `media/audio/`
- `media/video/`
- `media/pdf/`
- `media/document/`

## Step 5 — Create the application's IAM user (least privilege)

This is the identity the live website itself uses — it should be able to do
nothing except read/write/delete files inside `media/` in this one bucket.

1. **IAM → Users → Create user** → name it `chindela-app-prod`.
2. Do **not** enable console access for this user — it only ever needs
   programmatic (API) access.
3. Skip attaching any AWS-managed policy. Instead: **Add permissions →
   Create inline policy → JSON**, paste in
   [`iam-policy-chindela-app.json`](./iam-policy-chindela-app.json) (with the
   bucket name filled in), name it `chindela-app-media-policy`, and create it.
4. Open the new user → **Security credentials → Create access key** → choose
   *"Application running outside AWS"* → create it.
5. Copy the **Access Key ID** and **Secret Access Key** shown (the secret is
   only ever shown once). These, plus the region and bucket name, are the
   four values that go into Railway as environment variables — see the main
   report for exactly where.

That's the entire AWS setup. Total console time is well under 30 minutes.
