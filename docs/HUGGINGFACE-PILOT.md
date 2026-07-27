# Hugging Face pilot deployment

## Objective

Publish the current HTML5/PWA prototype as a public Hugging Face Docker Space while keeping GitHub as the sole source of truth.

The deployment workflow is designed so that no development tools are required on the reviewer’s computer. After one-time account configuration, every accepted change to `main` is validated, synchronized and health-checked automatically.

## Authority model

```text
GitHub main
  -> GitHub Actions validation
  -> Hugging Face Space creation or confirmation
  -> one-way source synchronization
  -> Docker build and runtime start
  -> /healthz verification
  -> public pilot URL
```

Direct edits in the Hugging Face Space are unsupported and will be overwritten by the next synchronization.

## What the workflow automates

The workflow `.github/workflows/deploy-huggingface.yml`:

1. resolves the target Space identifier;
2. validates the repository with `npm run check`;
3. creates the public Docker Space when it does not exist;
4. mirrors the GitHub source using the official Hugging Face synchronization action;
5. waits for the Space build and runtime;
6. calls the application `/healthz` endpoint;
7. publishes the verified pilot URL in the GitHub Actions summary.

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

The Space itself does not need to be created manually; the workflow creates it as a public Docker Space if necessary.

### 3. Start the first deployment

Open:

`Actions -> Deploy pilot to Hugging Face -> Run workflow`

The optional `space_id` input can temporarily override the repository variable. Normally it should be left empty.

### 4. Open the verified URL

After the workflow succeeds, open its job summary. The summary contains the public `https://...hf.space` pilot URL.

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

### Space build fails

Open the failed workflow and the corresponding Hugging Face Space build logs. Correct source files in GitHub only, then merge or push the correction to `main`.

### Health verification times out

Check the Space runtime logs and confirm that the Docker container listens on port `7860` and that `/healthz` returns HTTP 200.

## Completion evidence

This work package is complete only when:

- the deployment workflow succeeds;
- a public pilot URL is recorded;
- `/healthz` passes;
- the running Space corresponds to the current GitHub `main` source;
- the result is recorded in `CHANGELOG.md`, `docs/WORK-CLAIMS.md` and `docs/HANDOVER.md`.
