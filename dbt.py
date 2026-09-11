# dbt_runner.py
import subprocess
import logging

logger = logging.getLogger(__name__)

def run_dbt_models(select: str = None):
    cmd = ["dbt", "run", "--project-dir", "mindscope"]
    if select:
        cmd += ["--select", select]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        logger.info(result.stdout)
        if result.returncode != 0:
            logger.error(result.stderr)
        return result.returncode == 0
    except Exception as e:
        logger.error(f"dbt run failed: {e}")
        return False