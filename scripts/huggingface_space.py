#!/usr/bin/env python3
"""Create and verify the Rendezvue Hugging Face Docker Space.

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
        space_sdk="docker",
        exist_ok=True,
        private=False,
    )
    print(f"Hugging Face Space is available at {url}.")


def space_info(api: HfApi, repo_id: str):
    try:
        return api.space_info(repo_id, expand=["subdomain", "runtime", "sha"])
    except TypeError:
        return api.space_info(repo_id)


def wait_for_health(url: str, timeout: int) -> None:
    deadline = time.monotonic() + timeout
    last_error = "no response"
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(f"{url}/healthz", timeout=15) as response:
                body = response.read(256).decode("utf-8", errors="replace").strip()
                if 200 <= response.status < 300:
                    print(f"Health check passed: HTTP {response.status} {body!r}")
                    return
                last_error = f"HTTP {response.status}: {body}"
        except (urllib.error.URLError, TimeoutError) as error:
            last_error = str(error)
        time.sleep(10)
    raise SystemExit(f"Space did not pass /healthz within {timeout}s: {last_error}")


def verify_space(api: HfApi, repo_id: str, timeout: int) -> None:
    print(f"Waiting up to {timeout}s for {repo_id} to finish building and start.")
    api.wait_for_space(repo_id=repo_id, timeout=timeout)
    info = space_info(api, repo_id)
    subdomain = getattr(info, "subdomain", None)
    if not subdomain:
        raise SystemExit("Hugging Face did not return a Space subdomain.")
    url = f"https://{subdomain}.hf.space"
    wait_for_health(url, min(timeout, 300))
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
