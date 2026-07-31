#!/usr/bin/env python3
"""Create, update and verify the private Rendezvue Hugging Face Static Space."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

SPACE_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*/[A-Za-z0-9][A-Za-z0-9._-]*$")


def require_environment() -> tuple[str, str, str]:
    repo_id = os.environ.get("HF_PRIVATE_SPACE_ID", "").strip()
    token = os.environ.get("HF_TOKEN", "").strip()
    expected_commit = os.environ.get("GITHUB_SHA", "").strip()
    if not repo_id or not SPACE_ID_PATTERN.fullmatch(repo_id):
        raise SystemExit("HF_PRIVATE_SPACE_ID must use owner/space-name format.")
    if not token:
        raise SystemExit("HF_TOKEN is required.")
    return repo_id, token, expected_commit


def ensure(api, repo_id: str) -> None:
    url = api.create_repo(
        repo_id=repo_id,
        repo_type="space",
        space_sdk="static",
        private=True,
        exist_ok=True,
    )
    api.update_repo_settings(repo_id=repo_id, repo_type="space", private=True)
    info = api.space_info(repo_id)
    if not getattr(info, "private", False):
        raise SystemExit("Private preview Space exists but is not private.")
    print(f"Private Static Space confirmed at {url}.")


def verify(api, repo_id: str, token: str, expected_commit: str) -> None:
    from huggingface_hub import hf_hub_download

    info = api.space_info(repo_id)
    if not getattr(info, "private", False):
        raise SystemExit("Private preview Space lost private visibility.")

    deployment_path = hf_hub_download(
        repo_id=repo_id,
        repo_type="space",
        filename="deployment.json",
        token=token,
        force_download=True,
    )
    index_path = hf_hub_download(
        repo_id=repo_id,
        repo_type="space",
        filename="index.html",
        token=token,
        force_download=True,
    )
    deployment = json.loads(Path(deployment_path).read_text(encoding="utf-8"))
    index = Path(index_path).read_text(encoding="utf-8")

    if deployment.get("app") != "rendezvue-private-preview":
        raise SystemExit("Private Space deployment metadata is not Rendezvue private preview.")
    if deployment.get("containsServerSecrets") is not False:
        raise SystemExit("Private Space deployment does not assert the server-secret boundary.")
    if expected_commit and deployment.get("buildCommit") != expected_commit[:40]:
        raise SystemExit("Private Space deployment commit does not match the workflow commit.")
    if "Rendezvue" not in index:
        raise SystemExit("Private Space index does not contain the Rendezvue application marker.")

    print(f"Private Space repository artifact verified for commit {deployment.get('buildCommit')}.")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("ensure", "verify"))
    args = parser.parse_args()

    repo_id, token, expected_commit = require_environment()
    from huggingface_hub import HfApi

    api = HfApi(token=token)
    if args.command == "ensure":
        ensure(api, repo_id)
    else:
        verify(api, repo_id, token, expected_commit)
    return 0


if __name__ == "__main__":
    sys.exit(main())
