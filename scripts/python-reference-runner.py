"""Test bridge: batch-run repository Python functions, never student text."""
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1] / "src" / "algorithms" / "python"
FUNCTIONS = {
    "Y": ("compression", "compress"), "P": ("turning_red", "solve_red"),
    "Q": ("queue", "solve_queue"), "W": ("liar", "solve_liar"),
    "U": ("trains", "solve_train"), "S": ("bridge", "solve_bridge"),
    "R": ("rotations", "rotation_class"), "X": ("quartets", "check_quartets"),
    "T": ("pyramids", "solve_pyramids"), "V": ("dice", "solve_dice"),
    "Z": ("levers", "solve_levers"),
}
modules = {}
for problem, (name, _) in FUNCTIONS.items():
    spec = importlib.util.spec_from_file_location("icpc_reference_" + name, ROOT / (name + ".py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    modules[problem] = module

results = []
for case in json.load(sys.stdin):
    problem = case["id"]
    function = getattr(modules[problem], FUNCTIONS[problem][1])
    try:
        result = function(*case["args"])
        if problem == "Z":
            # Constructive answers need not use identical vector orientations/order.
            result = modules[problem].lever_distribution(result, case["args"][1])[0]
        results.append({"value": result})
    except ValueError as error:
        results.append({"error": str(error)})
json.dump(results, sys.stdout, allow_nan=False)
