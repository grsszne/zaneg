"""Convert the original STEP assemblies, including face and instance colors.

Install scripts/pcb-requirements.txt in a Python environment, then run:
    python scripts/convert-pcb-models.py /path/to/step/files
"""
import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import sys

from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.IFSelect import IFSelect_RetDone
from OCP.Message import Message_ProgressRange
from OCP.RWGltf import RWGltf_CafWriter
from OCP.RWMesh import RWMesh_CoordinateSystem_Zup, RWMesh_CoordinateSystem_Yup
from OCP.STEPCAFControl import STEPCAFControl_Reader
from OCP.TCollection import TCollection_AsciiString, TCollection_ExtendedString
from OCP.TColStd import TColStd_IndexedDataMapOfStringString
from OCP.TDF import TDF_LabelSequence
from OCP.TDocStd import TDocStd_Document
from OCP.XCAFApp import XCAFApp_Application
from OCP.XCAFDoc import XCAFDoc_DocumentTool

source_directory = Path(sys.argv[1])
output_directory = Path(__file__).resolve().parents[1] / "public/models/laser"
output_directory.mkdir(parents=True, exist_ok=True)
boards = [
    ("usb-interface", "USB interface", "phy.step"),
    ("tx-a", "TX-A", "tx-a.step"),
    ("rx-a", "RX-A", "phy-a-a.step"),
]
manifest = []
app = XCAFApp_Application.GetApplication_s()

for board_id, label, source_name in boards:
    source_path = source_directory / source_name
    document = TDocStd_Document(TCollection_ExtendedString("XmlOcaf"))
    app.InitDocument(document)
    reader = STEPCAFControl_Reader()
    reader.SetColorMode(True)
    reader.SetNameMode(True)
    assert reader.ReadFile(str(source_path)) == IFSelect_RetDone, source_name
    assert reader.Transfer(document), source_name
    shape_tool = XCAFDoc_DocumentTool.ShapeTool_s(document.Main())
    roots = TDF_LabelSequence()
    shape_tool.GetFreeShapes(roots)
    bounds = Bnd_Box()
    for index in range(1, roots.Length() + 1):
        shape = shape_tool.GetShape_s(roots.Value(index))
        BRepMesh_IncrementalMesh(shape, 0.04, False, 0.3, True).Perform()
        BRepBndLib.AddOptimal_s(shape, bounds, False, False)
    output = output_directory / f"{board_id}.glb"
    writer = RWGltf_CafWriter(TCollection_AsciiString(str(output)), True)
    writer.SetMergeFaces(True)
    converter = writer.ChangeCoordinateSystemConverter()
    converter.SetInputLengthUnit(0.001)
    converter.SetInputCoordinateSystem(RWMesh_CoordinateSystem_Zup)
    converter.SetOutputCoordinateSystem(RWMesh_CoordinateSystem_Yup)
    assert writer.Perform(document, TColStd_IndexedDataMapOfStringString(), Message_ProgressRange())
    binary = output.read_bytes()
    json_length = struct.unpack_from("<I", binary, 12)[0]
    gltf = json.loads(binary[20:20 + json_length])
    # Keep KiCad's layer names available to the viewer (XCAF instance labels
    # otherwise obscure them). Component instance names remain their references.
    for node in gltf["nodes"]:
        if "mesh" not in node:
            continue
        name = gltf["meshes"][node["mesh"]].get("name", "")
        layer = re.search(r"_(copper|pad|via|silkscreen|soldermask|PCB)$", name)
        if layer:
            node["name"] = name
            node["extras"] = {"pcbLayer": layer.group(1).lower()}
    json_bytes = json.dumps(gltf, separators=(",", ":")).encode()
    json_bytes += b" " * (-len(json_bytes) % 4)
    remainder = binary[20 + json_length:]
    binary = struct.pack("<III", 0x46546C67, 2, 20 + len(json_bytes) + len(remainder))
    binary += struct.pack("<II", len(json_bytes), 0x4E4F534A) + json_bytes + remainder
    output.write_bytes(binary)
    assert len(gltf.get("materials", [])) > 5, f"Missing component colors: {source_name}"
    xmin, ymin, zmin, xmax, ymax, zmax = bounds.Get()
    source_bytes = source_path.read_bytes()
    record = {
        "id": board_id, "label": label, "source": source_name,
        "sourceSHA256": hashlib.sha256(source_bytes).hexdigest(),
        "exportedAt": re.search(r"FILE_NAME\('[^']*','([^']+)'", source_bytes[:400].decode()).group(1),
        "dimensionsMm": [round(xmax - xmin, 2), round(ymax - ymin, 2), round(zmax - zmin, 2)],
        "materials": len(gltf["materials"]), "glbBytes": len(binary),
        "converter": "Open CASCADE 7.9.3 / XCAF glTF writer",
    }
    shutil.copyfile(source_path, output_directory / f"{board_id}.step")
    manifest.append(record)
    print(json.dumps(record), flush=True)

(output_directory / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
