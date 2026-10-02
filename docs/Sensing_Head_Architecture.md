# 🔬 OPTIX: Sensing Head Architecture & Optomechanical Specification

**System:** OPTIX (Adaptive Hyperspectral Inspection System)  
**Team:** Team AEROS (Team ID: 186870) | **SIH 2026 Problem Statement 26233**  

---

## 1. Prototype Geometry & Dimensional Envelope (Slide 2)

The sensing head is engineered for direct bolt-on installation over existing industrial food conveyors:

```
        ┌────────────────────────────────────────────────────────┐
        │  OPTIX SENSING HEAD CHASSIS (AISI 304 STAINLESS STEEL) │
        │  Dimensions: 220 mm (L) × 140 mm (W) × 110 mm (H)      │
        │                                                        │
        │   ┌──────────────┐                 ┌───────────────┐   │
        │   │ CAMERA UNIT  │                 │ JETSON ORIN   │   │
        │   │ (VNIR/SWIR)  │                 │ NANO (8GB)    │   │
        │   └──────┬───────┘                 └───────▲───────┘   │
        │          │                                 │           │
        │          ▼                                 ▼           │
        │   ┌──────────────┐                 ┌───────────────┐   │
        │   │ 11-CH STROBE │                 │ STM32 NUCLEO  │   │
        │   │ LED ARRAY    │                 │ F446RE MCU    │   │
        │   └──────┬───────┘                 └───────┬───────┘   │
        │          │                                 │           │
        │          ▼                                 ▼           │
        │   ┌──────────────┐                 ┌───────────────┐   │
        │   │ OPTICAL      │                 │ POWER MGMT    │   │
        │   │ QUARTZ GLASS │                 │ (24V→12V/5V)  │   │
        │   └──────────────┘                 └───────────────┘   │
        └────────────────────────────────────────────────────────┘
```

* **Physical Envelope:** $220\text{ mm}$ length $\times 140\text{ mm}$ width $\times 110\text{ mm}$ height.
* **Ingress Protection:** Fully gasketed **IP65 Washdown** construction allowing chemical foaming and sanitizing spray.
* **Thermal Management:** Passive conductive heatsink plate coupled to the Jetson Orin Nano module, transferring heat to the stainless steel exterior without requiring unsealed cooling fans.

---

## 2. Multimodal Active Optical Array (11 Bands)

To achieve reliable signal recovery without relying on heavy, high-wattage halogen floodlights (which cook food samples and create thermal drift), OPTIX utilizes **pulsed LED stroboscopic illumination**:

| Channel | Center Wavelength ($\lambda$) | Optical Bandwidth (FWHM) | Operating Function / Target Analyte |
| :---: | :---: | :---: | :--- |
| **CH 1** | $365\text{ nm}$ (UV-A) | $12\text{ nm}$ | Microbial Autofluorescence Excitation (NADH / Porphyrin) |
| **CH 2** | $365\text{ nm}$ (UV-A) | $12\text{ nm}$ | Cross-Angle Fluorescence Excitation (Shadow Elimination) |
| **CH 3** | $450\text{ nm}$ (Blue) | $20\text{ nm}$ | Flavonoid / Carotenoid Base Pigmentation |
| **CH 4** | $520\text{ nm}$ (Green) | $25\text{ nm}$ | Tissue Scattering & Chlorophyll Accessory Reference |
| **CH 5** | $590\text{ nm}$ (Amber) | $18\text{ nm}$ | Surface Oxidation & Hemoglobin/Myoglobin Base |
| **CH 6** | $660\text{ nm}$ (Deep Red) | $20\text{ nm}$ | Chlorophyll / Fluorophore Emission Residual Peak |
| **CH 7** | $730\text{ nm}$ (Far Red) | $25\text{ nm}$ | Cellular Structure Reflectance Knee |
| **CH 8** | $810\text{ nm}$ (NIR) | $30\text{ nm}$ | Protein & Moisture Subsurface Scattering Baseline |
| **CH 9** | $850\text{ nm}$ (NIR) | $30\text{ nm}$ | Lipid / Fat Tissue Contrast Reference |
| **CH 10**| $940\text{ nm}$ (NIR) | $35\text{ nm}$ | Surface Moisture / Wet-Film Attenuation |
| **CH 11**| $980\text{ nm}$ (NIR) | $35\text{ nm}$ | Free Water Molecular O-H Second Overtone Absorption |

---

## 3. Optical Calibration Target Strip

Mounted adjacent to the conveyor belt edge within the lateral field-of-view of the line camera is a dual-region calibration strip:
1. **99% Diffuse Reflectance White (Spectralon Equivalent):** Calibrates absolute LED flux output and compensates for emitter aging.
2. **18% Standard Neutral Grey:** Verifies linearity and radiometric dynamic range on every continuous line pass.
* **Fail-Safe Mechanism:** If optical reflection off the calibration strip drifts by $> 8.5\%$ (indicating lens grease splatter or LED degradation), the system immediately transitions to **QUARANTINE mode** and raises a maintenance alert.
