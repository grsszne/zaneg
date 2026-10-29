"""Preserve Fusion STEP colors and instances in a browser GLB.

Usage: python scripts/convert-mechanical-model.py /path/to/laser-sled.step
Install scripts/pcb-requirements.txt in a Python 3.13 environment first.
"""
import hashlib
import json
from pathlib import Path
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

source = Path(sys.argv[1])
output = Path(__file__).resolve().parents[1] / "public/models/laser"
output.mkdir(parents=True, exist_ok=True)
document = TDocStd_Document(TCollection_ExtendedString("XmlOcaf"))
XCAFApp_Application.GetApplication_s().InitDocument(document)
reader = STEPCAFControl_Reader()
reader.SetColorMode(True)
reader.SetNameMode(True)
assert reader.ReadFile(str(source)) == IFSelect_RetDone, "STEP read failed"
assert reader.Transfer(document), "STEP transfer failed"
shape_tool = XCAFDoc_DocumentTool.ShapeTool_s(document.Main())
roots = TDF_LabelSequence()
shape_tool.GetFreeShapes(roots)
bounds = Bnd_Box()
for index in range(1, roots.Length() + 1):
    shape = shape_tool.GetShape_s(roots.Value(index))
    BRepMesh_IncrementalMesh(shape, 0.08, False, 0.25, True).Perform()
    BRepBndLib.AddOptimal_s(shape, bounds, False, False)

glb = output / "laser-sled.glb"
writer = RWGltf_CafWriter(TCollection_AsciiString(str(glb)), True)
writer.SetMergeFaces(True)
converter = writer.ChangeCoordinateSystemConverter()
converter.SetInputLengthUnit(0.001)
converter.SetInputCoordinateSystem(RWMesh_CoordinateSystem_Zup)
converter.SetOutputCoordinateSystem(RWMesh_CoordinateSystem_Yup)
assert writer.Perform(document, TColStd_IndexedDataMapOfStringString(), Message_ProgressRange())
binary = glb.read_bytes()
json_length = struct.unpack_from("<I", binary, 12)[0]
gltf = json.loads(binary[20:20 + json_length])
assert len(gltf.get("materials", [])) > 5, "Assembly colors missing"
rail_nodes = [node for node in gltf["nodes"] if "2040 rail from 5537T912" in node.get("name", "")]
assert rail_nodes, "Expected rail component missing; review the viewer framing"
for node in rail_nodes:
    node["extras"] = {**node.get("extras", {}), "mechanicalRole": "rail"}
json_bytes = json.dumps(gltf, separators=(",", ":")).encode()
json_bytes += b" " * (-len(json_bytes) % 4)
remainder = binary[20 + json_length:]
binary = struct.pack("<III", 0x46546C67, 2, 20 + len(json_bytes) + len(remainder))
binary += struct.pack("<II", len(json_bytes), 0x4E4F534A) + json_bytes + remainder
glb.write_bytes(binary)
shutil.copyfile(source, output / "laser-sled.step")
xmin, ymin, zmin, xmax, ymax, zmax = bounds.Get()
record = {
    "id": "laser-sled",
    "label": "Laser sled mechanical assembly",
    "source": source.name,
    "sourceSHA256": hashlib.sha256(source.read_bytes()).hexdigest(),
    "dimensionsMm": [round(xmax - xmin, 2), round(ymax - ymin, 2), round(zmax - zmin, 2)],
    "materials": len(gltf["materials"]),
    "meshes": len(gltf["meshes"]),
    "glbBytes": len(binary),
    "linearDeflectionMm": 0.08,
    "angularDeflectionRadians": 0.25,
    "converter": "Open CASCADE 7.9.3 / XCAF glTF writer",
}
(output / "laser-sled-manifest.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps(record), flush=True)
