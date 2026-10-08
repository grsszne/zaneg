# PCB model assets

The three browser models are derived from KiCad STEP assemblies. Open CASCADE's
XCAF reader/writer preserves component-instance and face colors; the browser
adds material finishes and lighting without changing component base colors.

## Rebuild

Export each board with KiCad 9's CLI:

```sh
kicad-cli pcb export step --force --subst-models \
  --include-tracks --include-pads --include-zones \
  --include-silkscreen --include-soldermask \
  --output /path/to/exports/BOARD.step /path/to/BOARD.kicad_pcb
```

Use these export names as inputs to the converter:

| Public name | KiCad source under `Documents/Laser` | Export name |
| --- | --- | --- |
| USB interface | `phy-a/Untitled/Untitled.kicad_pcb` | `phy.step` |
| TX-A | `tx-a/tx-a.kicad_pcb` | `tx-a.step` |
| RX-A | `phy-a-a/phy-a-a.kicad_pcb` | `phy-a-a.step` |

The receiver's historical filename is retained only in provenance. The older
`rx-a/rx-a.kicad_pcb` is a different revision and is not used here.

```sh
python3 -m venv /tmp/pcb-cad
/tmp/pcb-cad/bin/pip install -r scripts/pcb-requirements.txt
/tmp/pcb-cad/bin/python scripts/convert-pcb-models.py /path/to/exports
```

The converter writes downloadable STEP files, GLBs, and a checksum manifest to
`public/models/laser`. Outer copper, pads, vias, mask, and silk retain separate
layer metadata. Inner copper is intentionally omitted from these surface views.

## Current source limitations

The September 8 export uses a temporary TX-A PCB copy to resolve J1's missing
library path to the existing exact HRO model in
`Documents/Laser/rx-a/3dmodels/USB_C_Receptacle_HRO_TYPE-C-31-M-12.STEP`.
Original board files were not modified.

KiCad still lacks 3D models referenced by USB interface U3 and TP1–TP12, TX-A
L1/TP2/TP3, and RX-A Y1. Their pads and copper are included; no substitute bodies
were invented. Export can return status 2 for these missing model references
while still writing the STEP file, so inspect its log and output.

Pin descriptions are in `src/app/components/pcb-annotations.js`. Each `ref`
anchors to that actual component instance in the exported assembly. Keep them
aligned with schematic references when updating the hardware revision.
