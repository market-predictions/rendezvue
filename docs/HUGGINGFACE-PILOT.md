# Hugging Face pilot deployment

## Objective

Publish the HTML5/PWA prototype as a public, free Hugging Face **Static Space** while keeping GitHub as the sole source of truth.

No development tools are required on the reviewer’s computer. Every accepted change to `main` is validated, built, uploaded and publicly verified by GitHub Actions.

## Hosting decision

The prototype is entirely browser-side HTML, CSS and JavaScript. It requires no Python server, Docker runtime or persistent Space filesystem.

The first Docker deployment returned HTTP 402 because new Docker and Gradio Spaces require paid compute. The first source-synchronized Static Space then remained unavailable because it depended on Hugging Face running the repository build. The pilot now uses the lowest-complexity route:

> GitHub builds the complete static application and uploads the finished files directly.

Docker remains available for later backend-capable phases but is not used for this pilot.

## Authority and deployment model

```text
GitHub main
  -> npm run build:hf
  -> validate dist/ and .hf-deploy/
  -> create or confirm free Static Space
  -> hf upload .hf-deploy/ to Space root
  -> verify direct public page and deployment marker
  -> publish URL in Actions and issue #2
```

Direct edits in Hugging Face are unsupported and will be overwritten by the next deployment.

## Prebuilt deployment contract

`npm run build:hf` creates:

```text
.hf-deploy/
  README.md              Space metadata: sdk static, app_file index.html
  index.html             application entry point
  app.js
  styles.css
  service-worker.js
  manifest.webmanifest
  src/
  assets/
  deployment.json
  source.json
```

The deployed `README.md` contains:

```yaml
sdk: static
app_file: index.html
```

It deliberately contains no `app_build_command`. Hugging Face serves the uploaded files directly.

## What the workflow automates

The workflow `.github/workflows/deploy-huggingface.yml`:

1. resolves `HF_SPACE_ID` and `HF_TOKEN`;
2. installs dependencies;
3. builds `dist/` and `.hf-deploy/`;
4. validates source, PWA metadata and both generated artifacts;
5. creates or confirms the free Static Space;
6. uses the official `hf upload` CLI to replace the Space contents with `.hf-deploy/`;
7. tests `.static.hf.space` and fallback URL forms;
8. confirms HTTP success and the embedded Rendezvue deployment marker;
9. publishes the verified URL in the Actions summary;
10. posts success or failure evidence to issue #2.

## One-time configuration

In GitHub, open:

`Settings -> Secrets and variables -> Actions`

Configure:

- secret `HF_TOKEN`: a fine-grained Hugging Face write token;
- variable `HF_SPACE_ID`: `owner/space-name`, currently `solidprivacy/rendezvue`.

Do not publish the token in chat, issues, logs or source files.

## Manual deployment

A merge to `main` deploys automatically. To trigger manually:

`Actions -> Deploy pilot to Hugging Face -> Run workflow`

Normally leave the optional Space override empty.

## Public URL

Static Spaces are commonly served through:

```text
https://owner-space-name.static.hf.space/
```

The verifier also tests `/index.html` and the ordinary `.hf.space` form for compatibility. The first URL serving the deployment marker becomes the published pilot URL.

Use the direct URL for camera, service-worker and PWA testing rather than only the embedded Hugging Face page.

## Privacy boundary

The hosted prototype remains an interaction demonstration. It must not admit real users or real personal data because it does not yet provide:

- production age assurance;
- real institutional mailbox verification;
- replay-resistant liveness;
- approved avatar generation;
- protected persistent accounts;
- production moderation operations;
- completed privacy, security and legal assessments.

Camera media remains browser-local and has no upload endpoint.

## Troubleshooting

### Missing configuration

Confirm that `HF_TOKEN` and `HF_SPACE_ID` exist under GitHub Actions settings.

### HTTP 402 during Space creation

The workflow is attempting a Docker or Gradio Space. The current workflow must say **Create or confirm free Static Space**.

### Upload fails

Open the `Upload prebuilt static application` step. Authentication or authorization errors may require replacing the token. Other upload errors should be fixed in GitHub source or workflow configuration.

### Static URL returns 404

Confirm the latest deployment uploaded `.hf-deploy/README.md` and `.hf-deploy/index.html` to the Space root. The verifier tests `.static.hf.space`, `/index.html`, and ordinary-host fallbacks.

### Camera is unavailable

Open the direct HTTPS Static Space URL, grant browser camera permission and avoid an embedded frame where browser policies may differ.

## Completion evidence

WP-015 is complete when:

- deployment succeeds;
- a public pilot URL is recorded;
- the served page contains the Rendezvue deployment marker;
- the running files correspond to current GitHub `main`;
- camera capture is tested through the direct HTTPS URL;
- work claims, changelog, handover and issue #2 contain the evidence.
