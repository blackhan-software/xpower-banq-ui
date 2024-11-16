#!/usr/bin/env python

import matplotlib.pyplot as pp
import argparse
import os

# Parse command line arguments
parser = argparse.ArgumentParser(
    description="Plot IRM curve with kink utilization and rate.")
parser.add_argument(
    "--kink-util", "-u", type=float, default=90,
    help="Kink utilization (default: 90)")
parser.add_argument(
    "--kink-rate", "-r", type=float, default=10,
    help="Kink rate (default: 10)")
args = parser.parse_args()

pp.style.use("dark_background")
fig, ax = pp.subplots()

kink_util = args.kink_util
kink_rate = args.kink_rate

# Plot main IRM curve (with dots)
xs, ys = [0, kink_util, 100], [0, kink_rate, 100]
ax.plot(xs, ys, color="#ff80ff", linewidth=4, linestyle="-", marker="o")

# Grid every 10 units
ax.set_xticks(range(10, 100, 10))
ax.set_yticks(range(10, 100, 10))
ax.grid(True, linestyle=":", linewidth=1)

# Drop ticks and labels
ax.tick_params(labelbottom=False, labelleft=False)
ax.set_xlabel("")
ax.set_ylabel("")

# Ensure exact bounds and color match
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)

pp.tight_layout()

# Save figure as SVG
abs_path = os.path.dirname(os.path.abspath(__file__))
fig_name = f"IRM-{int(kink_util):02d}{int(kink_rate):02d}"
irm_path = os.path.join(abs_path, "irm", f"{fig_name}.svg")
os.makedirs(os.path.dirname(irm_path), exist_ok=True)
fig.savefig(irm_path, format="svg", bbox_inches="tight", facecolor="black")

pp.show()
