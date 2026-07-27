#!/usr/bin/env python3
"""Create and verify the free Rendezvue Hugging Face Static Space.

The script is intended for GitHub Actions. It never prints the access token.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import time
import urllib.error
import urllib.request

from huggingface_hub import HfApi

SPACE_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._-]*$")
DEPLOYMENT_MARKER = 'name="rendezvue-deployment" content="static-pilot"'


def require_environment() -> tuple[str, str]:
    repo_id = os.environ.get("HF_SPACE_ID", "").strip()
    token = os.environ.get("HF_TOKEN", "").strip()
    if not repo_id:
        raise SystemExit("HF_SPACE_ID is required (format: owner/space-name).")
    if not SPACE_ID_PATTERN.fullmatch(repo_id):
        raise SystemExit("HF_SPACE_ID must use the format owner/space-name.")
    if not token:
        raise SystemExit("HF_TOKEN is required as a GitHub Actions secret.")
    return repo_id, token


def write_output(name: str, value: str) -> None:
    output_path = os.environ.get("GITHUB_OUTPUT")
    if output_path:
        with open(output_path, "a", encoding="utf-8") as output:
            output.write(f"{name}={value}\n")


def ensure_space(api: HfApi, repo_id: str) -> None:
    url = api.create_repo(
        repo_id=repo_id,
        repo_type="space",
        space_sdk="static",
        exist_ok=True,
        private=False,
    )
    print(f"Free Hugging Face Static Space is available at {url}.")


def space_info(api: HfApi, repo_id: str):
    try:
        return api.space_info(repo_id, expand=["subdomain", "runtime", "sha"])
    except TypeError:
        return api.space_info(repo_id)


def resolve_public_url(api: HfApi, repo_id: str) -> str | None:
    info = space_info(api, repo_id)
    subdomain = getattr(info, "subdomain", None)
    if not subdomain:
        return None
    return f"https://{subdomain}.hf.space"


def wait_for_static_page(api: HfApi, repo_id: str, timeout: int) -> str:
    deadline = time.monotonic() + timeout
    last_error = "public URL not available yet"
    url: str | None = None

    while time.monotonic() < deadline:
        try:
            url = resolve_public_url(api, repo_id) or url
            if not url:
                last_error = "Hugging Face has not assigned a Space subdomain yet"
            else:
                request = urllib.request.Request(
                    url,
                    headers={"User-Agent": "Rendezvue-GitHub-Deployment/1.0"},
                )
                with urllib.request.urlopen(request, timeout=20) as response:
                    body = response.read(131072).decode("utf-8", errors="replace")
                    if 200 <= response.status < 300 and DEPLOYMENT_MARKER in body:
                        print(f"Static pilot verification passed: HTTP {response.status}")
                        return url
                    last_error = (
                        f"HTTP {response.status}; Rendezvue deployment marker not present"
                    )
        except urllib.error.HTTPError as error:
            last_error = f"HTTP {error.code}: {error.reason}"
        except (urllib.error.URLError, TimeoutError) as error:
            last_error = str(error)
        except Exception as error:  # Keep polling while the Hub build metadata settles.
            last_error = f"{type(error).__name__}: {error}"

        print(f"Static Space not ready: {last_error}")
        time.sleep(10)

    raise SystemExit(
        f"Static Space did not serve the Rendezvue pilot within {timeout}s: {last_error}"
    )


def verify_space(api: HfApi, repo_id: str, timeout: int) -> None:
    print(f"Waiting up to {timeout}s for the static build of {repo_id}.")
    url = wait_for_static_page(api, repo_id, timeout)
    subdomain = url.removeprefix("https://").removesuffix(".hf.space")
    write_output("space_url", url)
    write_output("space_subdomain", subdomain)
    print(f"Verified pilot URL: {url}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("ensure", "verify"))
    parser.add_argument("--timeout", type=int, default=1200)
    args = parser.parse_args()

    repo_id, token = require_environment()
    api = HfApi(token=token)
    if args.command == "ensure":
        ensure_space(api, repo_id)
    else:
        verify_space(api, repo_id, args.timeout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
