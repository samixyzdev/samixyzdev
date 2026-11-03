"""Check that desktop/mobile processor frames cover the loop without overlap."""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
NS = {"svg": "http://www.w3.org/2000/svg"}
schedules = []
for filename in ("lc2k-pipeline.svg", "lc2k-pipeline-mobile.svg"):
    root = ET.parse(ROOT / "assets" / filename).getroot()
    states = root.findall('.//svg:g[@class="motion-state"]', NS)
    assert len(states) == 9, f"{filename}: expected PRE and eight cycle states"
    schedule = []
    for state in states:
        animation = state.find("svg:animate", NS)
        assert animation is not None
        assert animation.get("calcMode") == "discrete"
        assert animation.get("dur") == "20.52s"
        assert animation.get("repeatCount") == "indefinite"
        times = list(map(float, animation.get("keyTimes").split(";")))
        values = list(map(int, animation.get("values").split(";")))
        assert len(times) == len(values)
        assert times[0] == 0 and times[-1] == 1
        assert all(a < b for a, b in zip(times, times[1:]))
        assert set(values) <= {0, 1}
        schedule.append((times, values))
    boundaries = sorted({time for times, _ in schedule for time in times})
    probes = boundaries[:-1] + [
        (a + b) / 2 for a, b in zip(boundaries, boundaries[1:])
    ]
    for time in probes:
        visible = sum(
            values[max(i for i, start in enumerate(times) if start <= time)]
            for times, values in schedule
        )
        assert visible == 1, f"{filename}: {visible} visible frames at {time}"
    schedules.append(schedule)
    print(f"{filename}: continuous, non-overlapping frame coverage")
assert schedules[0] == schedules[1], "Desktop/mobile schedules differ"
