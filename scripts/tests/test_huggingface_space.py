import importlib.util
import pathlib
import unittest


MODULE_PATH = pathlib.Path(__file__).parents[1] / "huggingface_space.py"
SPEC = importlib.util.spec_from_file_location("huggingface_space", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class PublicUrlCandidateTests(unittest.TestCase):
    def test_static_hostname_is_preferred(self):
        urls = MODULE.public_url_candidates("solidprivacy/rendezvue")
        self.assertEqual(urls[0], "https://solidprivacy-rendezvue.static.hf.space/")
        self.assertEqual(urls[1], "https://solidprivacy-rendezvue.static.hf.space/index.html")
        self.assertIn("https://solidprivacy-rendezvue.hf.space/", urls)

    def test_api_static_suffix_is_not_duplicated(self):
        urls = MODULE.public_url_candidates(
            "solidprivacy/rendezvue", "solidprivacy-rendezvue.static"
        )
        self.assertNotIn("static.static.hf.space", " ".join(urls))
        self.assertEqual(urls[0], "https://solidprivacy-rendezvue.static.hf.space/")

    def test_full_api_url_is_normalised(self):
        urls = MODULE.public_url_candidates(
            "solidprivacy/rendezvue",
            "https://solidprivacy-rendezvue.static.hf.space/index.html",
        )
        self.assertEqual(urls[0], "https://solidprivacy-rendezvue.static.hf.space/")
        self.assertEqual(len(urls), len(set(urls)))


if __name__ == "__main__":
    unittest.main()
