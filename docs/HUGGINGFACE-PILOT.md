# Hugging Face pilot deployment

## Objective

Publish the current HTML5/PWA prototype as a public, free Hugging Face **Static Space** while keeping GitHub as the sole source of truth.

No development tools are required on the reviewer’s computer. After one-time account configuration, every accepted change to `main` is validated, synchronized, built and publicly verified automatically.

## Why Static Space

The current prototype is entirely browser-side HTML, CSS and JavaScript. It does not require a Python process, application server or Docker runtime.

Hugging Face permits Static Spaces on free accounts. Creating new Docker or Gradio Spaces on compute requires a paid plan. The first hosted deployment exposed this distinction through HTTP 402 at the Docker Space creation step. The pilot was therefore changed to the least-privilege and lowest-cost hosting model that matches its actual architecture.

Docker remains available in the repository for later phases that introduce backend services, but it is not used for the current public prototype.

## Authority model

```text
GitHub main
  -> GitHub Actions validation and static build
  -> Hugging Face Static Space creation or confirmation
  -> one-way source synchronization
  -> Hugging Face static build command
  -> public page and deployment-marker verification
  -> public pilot URL
```

Direct edits in the Hugging Face Space are unsupported and will be overwritten by the next synchronization.

## Static build contract

The root `README.md` declares:

```yaml
sdk: static
app_build_command: npm run build:static
app_file: dist/index.html
```

The build command copies the browser application from `apps/web/` to `dist/`. The source remains framework-independent and deployable without server compute.

## What the workflow automates

The workflow `.github/workflows/deploy-huggingface.yml`:

1. resolves the target Space identifier;
2. validates and builds the application with `npm run check`;
3. creates the public Static Space when it does not exist;
4. mirrors the GitHub source using the official Hugging Face synchronization action;
5. waits for Hugging Face to run the static build;
6. opens the direct `https://...hf.space` URL;
7. confirms HTTP success and the Rendezvue deployment marker;
8. publishes the verified pilot URL in the GitHub Actions summary.

## One-time activation

The only required manual configuration is performed in web interfaces.

### 1. Create a Hugging Face access token

Create a fine-grained Hugging Face token with write permission for the intended account or organization. Do not paste this token into an issue, pull request, chat message or repository file.

### 2. Configure GitHub Actions

In the GitHub repository, open:

`Settings -> Secrets and variables -> Actions`

Create:

- repository secret `HF_TOKEN` containing the Hugging Face token;
- repository variable `HF_SPACE_ID` containing `owner/space-name`, for example `your-hf-name/rendezvue`.

The Space itself does not need to be created manually; the workflow creates it as a public Static Space if necessary.

### 3. Start the first deployment

Open:

`Actions -> Deploy pilot to Hugging Face -> Run workflow`

The optional `space_id` input can temporarily override the repository variable. Normally it should be left empty.

A merge to `main` also triggers deployment automatically.

### 4. Open the verified URL

After the workflow succeeds, open its job summary. The summary contains the direct public `https://...hf.space` pilot URL.

Use the direct URL rather than only the Hugging Face repository page when testing the camera, service worker and PWA behavior.

Future pushes to `main` redeploy automatically.

## Privacy boundary

The hosted prototype remains a product-interaction demonstration only.

It must not be opened to real users or real personal data because it does not yet provide:

- production age assurance;
- real institutional mailbox verification;
- replay-resistant liveness;
- approved avatar generation;
- persistent protected accounts;
- production moderation operations;
- completed privacy, security and legal assessments.

Camera media remains browser-local in this prototype and has no upload endpoint.

## Troubleshooting

### Workflow reports missing configuration

Confirm that both `HF_TOKEN` and `HF_SPACE_ID` exist under GitHub Actions settings. Secret values cannot be read back after saving; replace the secret if uncertain.

### Token lacks permission

Create a new fine-grained token with write access to the target namespace and replace `HF_TOKEN`.

### HTTP 402 while creating a Space

Confirm that the workflow says **Create or confirm free Static Space** and that the synchronized README declares `sdk: static`. A Docker or Gradio creation attempt requires a paid plan and indicates that an older workflow revision is being run.

### Static build fails

Open the failed workflow and the corresponding Hugging Face Space build logs. Confirm that `npm run build:static` completed and that `dist/index.html` was generated. Correct source files in GitHub only.

### Public-page verification times out

Open the direct Space URL and inspect the Space build log. Verification requires:

- an HTTP success response from the direct `hf.space` URL;
- the `rendezvue-deployment` marker in the served HTML.

### Camera is unavailable inside the Hugging Face page

Open the direct `https://...hf.space` URL from the workflow summary. Camera access requires HTTPS and browser permission, and embedding policies can differ from the direct app URL.

## Completion evidence

This work package is complete only when:

- the deployment workflow succeeds;
- a public pilot URL is recorded;
- the direct page serves the Rendezvue deployment marker;
- camera capture is tested through the direct HTTPS URL;
- the running Space corresponds to the current GitHub `main` source;
- the result is recorded in `CHANGELOG.md`, `docs/WORK-CLAIMS.md` and `docs/HANDOVER.md`.
