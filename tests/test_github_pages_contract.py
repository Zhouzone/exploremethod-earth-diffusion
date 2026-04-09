import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW_PATH = ROOT / ".github" / "workflows" / "deploy-pages.yml"
INDEX_PATH = ROOT / "index.html"
APP_PATH = ROOT / "app.js"


class GitHubPagesContractTest(unittest.TestCase):
    def test_pages_workflow_exists(self) -> None:
        self.assertTrue(WORKFLOW_PATH.exists(), f"missing workflow: {WORKFLOW_PATH}")

    def test_pages_workflow_has_required_actions(self) -> None:
        workflow = WORKFLOW_PATH.read_text(encoding="utf-8")
        self.assertIn("actions/configure-pages", workflow)
        self.assertIn("actions/upload-pages-artifact", workflow)
        self.assertIn("actions/deploy-pages", workflow)
        self.assertRegex(workflow, r"on:\s*\n\s*push:\s*\n\s*branches:\s*\n\s*-\s*main")
        self.assertRegex(workflow, r"path:\s*\.")

    def test_static_site_uses_relative_asset_paths(self) -> None:
        index_html = INDEX_PATH.read_text(encoding="utf-8")
        app_js = APP_PATH.read_text(encoding="utf-8")
        self.assertIn('href="./styles.css"', index_html)
        self.assertIn('src="./app.js"', index_html)
        self.assertIn('fetch("./data/topic_chain.json"', app_js)
        self.assertNotIn('href="/', index_html)
        self.assertNotIn('src="/', index_html)
        self.assertNotIn('fetch("/', app_js)


if __name__ == "__main__":
    unittest.main()
