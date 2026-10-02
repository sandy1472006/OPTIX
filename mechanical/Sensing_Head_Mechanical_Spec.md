# 📐 OPTIX Sensing Head: Mechanical & Enclosure Specification

**System:** OPTIX (Adaptive Hyperspectral Inspection System)  
**Team:** Team AEROS (Team ID: 186870) | **SIH 2026 Problem Statement 26233**  

---

## 1. Physical Dimensions & Form Factor (Slide 2 CAD)

The sensing head is engineered to fit within a compact, standardized footprint suitable for retrofit over commercial conveyor lines without modifying factory framing.

```
                   TOP VIEW (FOOTPRINT)
        ┌───────────────────────────────────────────┐
        │                                           │
 140 mm │               SENSING HEAD                │
        │                                           │
        └───────────────────────────────────────────┘
                           220 mm

                   SIDE & FRONT ELEVATION
         SIDE VIEW (110 mm)               FRONT VIEW (140 mm)
        ┌─────────────────┐             ┌───────────────────┐
        │                 │             │                   │
 110 mm │                 │      110 mm │                   │
        │     [QUARTZ]    │             │      [QUARTZ]     │
        └────────┬────────┘             └─────────┬─────────┘
                 ▼                                ▼
            CONVEYOR LINE                    CONVEYOR LINE
```

* **Overall Length:** $220\text{ mm}$ (along the axis of conveyor travel).
* **Overall Width:** $140\text{ mm}$ (transverse to conveyor direction).
* **Overall Height:** $110\text{ mm}$ (vertical clearance).
* **Working Distance:** Adjustable $180\text{ mm} - 250\text{ mm}$ above the conveyor belt surface.
* **Total Dry Mass:** $2.45\text{ kg}$ (including internal Jetson heatsink and optics).

---

## 2. Sanitary Food-Grade Construction & Ingress Protection

* **Chassis Material:** AISI 304 (1.4301) austenitic stainless steel, bead-blasted surface finish ($Ra \le 0.8\,\mu\text{m}$) preventing bacterial biofilm adhesion.
* **Ingress Protection Rating:** **IP65 Washdown Compliant** (protects internal Jetson compute and optics against high-pressure water jets during routine factory sanitation).
* **Optical Aperture Window:** $120\text{ mm} \times 40\text{ mm} \times 4\text{ mm}$ JGS1 high-purity optical fused silica (quartz glass) with broadband anti-reflective coating ($250 - 1800\text{ nm}$ transmission $> 93\%$).
* **Gasket & Seals:** Food-grade FDA-compliant silicone rubber / Viton O-rings resistant to chlorinated sanitizers and steam cleaning.

---

## 3. Air-Jet Nozzle Array Geometry

* **Nozzle Count:** 8 pneumatic micro-orifices arranged in a high-density linear manifold.
* **Nozzle Center-to-Center Pitch:** $25.0\text{ mm}$ (providing complete transverse coverage across $200\text{ mm}$ conveyor belt width).
* **Ejection Deflection Force:** Capable of deflecting up to $450\text{ g}$ food products at speeds up to $2.5\text{ m/s}$ into the Quarantine Bin without disrupting adjacent products.
