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
import urllib.parse
import urllib.request
from typing import Any

SPACE_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._-]*$")
DEPLOYMENT_MARKER = 'name="rendezvue-deployment" content="static-pilot-v1"'


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


def ensure_space(api: Any, repo_id: str) -> None:
    url = api.create_repo(
        repo_id=repo_id,
        repo_type="space",
        space_sdk="static",
        exist_ok=True,
        private=False,
    )
    print(f"Free Hugging Face Static Space is available at {url}.")


def space_info(api: Any, repo_id: str):
    try:
        return api.space_info(repo_id, expand=["subdomain", "runtime", "sha"])
    except TypeError:
        return api.space_info(repo_id)


def _normalise_subdomain(value: str) -> str:
    candidate = value.strip()
    if not candidate:
        return ""
    if "://" in candidate:
        candidate = urllib.parse.urlparse(candidate).hostname or ""
    candidate = candidate.removesuffix(".static.hf.space")
    candidate = candidate.removesuffix(".hf.space")
    candidate = candidate.removesuffix(".static")
    return candidate.strip("./")


def public_url_candidates(repo_id: str, api_subdomain: str | None = None) -> list[str]:
    """Return likely direct URLs, preferring the Static Space hostname.

    Hugging Face currently serves Static Spaces on ``*.static.hf.space`` while
    non-static Spaces use ``*.hf.space``. The API subdomain value has changed
    shape over time, so the repository-derived slug remains a safe fallback.
    """

    seeds = [api_subdomain or "", repo_id.replace("/", "-")]
    base_names: list[str] = []
    for seed in seeds:
        base = _normalise_subdomain(seed)
        if base and base not in base_names:
            base_names.append(base)

    urls: list[str] = []
    for base in base_names:
        for host in (f"{base}.static.hf.space", f"{base}.hf.space"):
            for path in ("/", "/index.html"):
                url = f"https://{host}{path}"
                if url not in urls:
                    urls.append(url)
    return urls


def resolve_public_urls(api: Any, repo_id: str) -> list[str]:
    try:
        info = space_info(api, repo_id)
        subdomain = getattr(info, "subdomain", None)
    except Exception as error:
        print(f"Space metadata not settled yet: {type(error).__name__}: {error}")
        subdomain = None
    return public_url_candidates(repo_id, subdomain)


def _fetch_marker(url: str) -> tuple[bool, str]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Rendezvue-GitHub-Deployment/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            body = response.read(131072).decode("utf-8", errors="replace")
            if 200 <= response.status < 300 and DEPLOYMENT_MARKER in body:
                return True, f"HTTP {response.status}"
            return False, f"HTTP {response.status}; deployment marker not present"
    except urllib.error.HTTPError as error:
        return False, f"HTTP {error.code}: {error.reason}"
    except (urllib.error.URLError, TimeoutError) as error:
        return False, str(error)


def wait_for_static_page(api: Any, repo_id: str, timeout: int) -> str:
    deadline = time.monotonic() + timeout
    last_error = "public URL not available yet"

    while time.monotonic() < deadline:
        candidates = resolve_public_urls(api, repo_id)
        cycle_errors: list[str] = []
        for url in candidates:
            ready, status = _fetch_marker(url)
            if ready:
                print(f"Static pilot verification passed at {url}: {status}")
                return url
            cycle_errors.append(f"{url} -> {status}")

        if cycle_errors:
            last_error = "; ".join(cycle_errors)
        else:
            last_error = "Hugging Face has not assigned a usable Space URL yet"
        print(f"Static Space not ready: {last_error}")
        time.sleep(10)

    raise SystemExit(
        f"Static Space did not serve the Rendezvue pilot within {timeout}s: {last_error}"
    )


def verify_space(api: Any, repo_id: str, timeout: int) -> None:
    print(f"Waiting up to {timeout}s for the static build of {repo_id}.")
    url = wait_for_static_page(api, repo_id, timeout)
    hostname = urllib.parse.urlparse(url).hostname or ""
    write_output("space_url", url)
    write_output("space_subdomain", hostname)
    print(f"Verified pilot URL: {url}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("ensure", "verify"))
    parser.add_argument("--timeout", type=int, default=1200)
    args = parser.parse_args()

    repo_id, token = require_environment()
    from huggingface_hub import HfApi

    api = HfApi(token=token)
    if args.command == "ensure":
        ensure_space(api, repo_id)
    else:
        verify_space(api, repo_id, args.timeout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
