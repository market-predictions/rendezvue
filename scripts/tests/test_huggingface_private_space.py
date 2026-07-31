import importlib.util
import os
import pathlib
import unittest
from unittest.mock import patch


MODULE_PATH = pathlib.Path(__file__).parents[1] / "huggingface_private_space.py"
SPEC = importlib.util.spec_from_file_location("huggingface_private_space", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class FakeInfo:
    private = True


class FakeApi:
    def __init__(self):
        self.created = None
        self.updated = None

    def create_repo(self, **kwargs):
        self.created = kwargs
        return "https://huggingface.co/spaces/solidprivacy/rendezvue-private-preview"

    def update_repo_settings(self, **kwargs):
        self.updated = kwargs

    def space_info(self, repo_id):
        return FakeInfo()


class PrivateSpaceTests(unittest.TestCase):
    def test_environment_requires_private_space_id_and_token(self):
        with patch.dict(
            os.environ,
            {
                "HF_PRIVATE_SPACE_ID": "solidprivacy/rendezvue-private-preview",
                "HF_TOKEN": "hf_test",
                "GITHUB_SHA": "a" * 40,
            },
            clear=True,
        ):
            self.assertEqual(
                MODULE.require_environment(),
                ("solidprivacy/rendezvue-private-preview", "hf_test", "a" * 40),
            )

    def test_ensure_creates_static_private_space_and_reasserts_visibility(self):
        api = FakeApi()
        MODULE.ensure(api, "solidprivacy/rendezvue-private-preview")
        self.assertEqual(api.created["repo_type"], "space")
        self.assertEqual(api.created["space_sdk"], "static")
        self.assertIs(api.created["private"], True)
        self.assertEqual(api.updated["repo_type"], "space")
        self.assertIs(api.updated["private"], True)


if __name__ == "__main__":
    unittest.main()
