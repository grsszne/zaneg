# Laser sled model and images

Source: the open Fusion document **Laser sled - restored colors and receiver
shroud**, exported through File → Export → STEP on October 14, 2026. The
downloadable `public/models/laser/laser-sled.step` is the unchanged export.

The GLB preserves assembly instances, names, and 35 source materials using the
same Open CASCADE XCAF pipeline as the PCB models. Rebuild with Python 3.13:

```sh
python3.13 -m venv /tmp/laser-cad-tools
/tmp/laser-cad-tools/bin/pip install -r scripts/pcb-requirements.txt
/tmp/laser-cad-tools/bin/python scripts/convert-mechanical-model.py /path/to/laser-sled.step
```

The converter writes a separate `laser-sled-manifest.json` containing the source
checksum, dimensions, and tessellation settings. It marks the actual component
`REF • 2040 rail from 5537T912:1` with `mechanicalRole: rail` so the viewer can
frame the 180 × 217.6 mm sled without altering or removing the 1,003.3 mm overall
assembly. **Full rail** fits all geometry. The viewer loads only as it approaches
the viewport and uses the existing PCB renderer and keyboard/orbit controls.

Images in `public/images/laser/mechanical` are crops from a 7,000 × 3,369 pixel
Fusion File → Capture Image export, with anti-aliasing enabled. The native PNG
was saved as `~/Downloads/laser-sled-cad-high-resolution.png`. The overview and
two detail crops share the same camera angle; no geometry or colors were edited.
WebP versions use quality 90, with 1,200/2,400 px overview sizes and 960/1,600 px
detail sizes. All use 4:3 crops and the existing documentation gallery styling.

The assembly's own STEP description identifies it as a prototype fit model;
physical fit and alignment are not validated by these exports.
