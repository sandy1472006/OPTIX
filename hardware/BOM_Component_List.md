# 📋 OPTIX Sensing Head: Bill of Materials (BOM) & Component List

**System:** OPTIX (Adaptive Hyperspectral Inspection System)  
**Team:** Team AEROS (Team ID: 186870) | **SIH 2026 Problem Statement 26233**  

---

## 1. Electronics & Compute Subsystem

| Item # | Component Description | Manufacturer / Part # | Qty | Key Technical Specifications | Estimated Unit Cost (INR) |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **1** | Edge AI Compute Module | NVIDIA Jetson Orin Nano (8GB) | 1 | 40 TOPS AI, 1024-core Ampere GPU, 32 Tensor Cores, Linux Ubuntu 22.04 LTS | ₹44,500 |
| **2** | Real-Time Sync MCU | STMicroelectronics Nucleo-F446RE | 1 | 180 MHz ARM Cortex-M4F, 512KB Flash, 128KB SRAM, Hardware Quadrature Timer | ₹1,950 |
| **3** | Multispectral / VNIR Sensor | Lucid Vision / Allied Vision VNIR | 1 | 400–1000 nm spectral sensitivity, 2048 pixel line resolution, MIPI CSI-2 | ₹68,000 |
| **4** | Conveyor Optical Shaft Encoder | Omron E6B2-CWZ6C | 1 | 2048 PPR Quadrature A/B/Z, NPN open-collector, 65mm measuring wheel | ₹3,400 |
| **5** | UV-A High-Power Strobe LEDs | Nichia NCSU033B / Seoul Viosys | 2 | 365 nm peak emission, 1.05W optical flux, 750 mA pulsed rating | ₹1,600 |
| **6** | Narrowband VNIR LEDs | Osram Oslon SSL / Cree XLamp | 9 | 450, 520, 590, 660, 730, 810, 850, 940, 980 nm, high CRI / narrow FWHM | ₹2,700 |
| **7** | High-Speed Strobe MOSFET Driver | Custom PCB / Texas Instruments TPS2814 | 1 | Sub-microsecond gate switching (< 450 ns), constant-current sink regulation | ₹1,850 |
| **8** | Solenoid Valve MOSFET Driver | 8-Ch Logic Level IRLZ44N Array | 1 | Flyback Schottky clamping, optocoupled isolation (PC817), 24V @ 2A per channel | ₹1,200 |
| **9** | Industrial Step-Down Buck Module | Mean Well DDR-60G-24/12/5 | 1 | 24V DC input, dual 5V/5A + 12V/3A regulated rails, 89% efficiency | ₹2,100 |

---

## 2. Pneumatic Actuation & Mechanical Subsystem

| Item # | Component Description | Manufacturer / Part # | Qty | Key Technical Specifications | Estimated Unit Cost (INR) |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **10** | High-Speed Pneumatic Valves | Festo / SMC 24V DC (MHJ Series) | 4 | Response time < 4 ms, 4.2 bar rated, 18 ms blast duration, lateral pitch 25 mm | ₹9,600 |
| **11** | Food-Grade Enclosure Chassis | Custom SS304 Sheet Metal Enclosure | 1 | 220 mm (L) × 140 mm (W) × 110 mm (H), IP65 washdown compliant, sanitary gaskets | ₹4,800 |
| **12** | Optical Protective Window | JGS1 Optical Fused Silica (Quartz) | 1 | UV-transparent (200–2100 nm), 4 mm thick, AR coated, anti-fogging treat | ₹3,200 |
| **13** | Optical Calibration Reference Strip | Avian Technologies / Spectralon Equiv. | 1 | 99% Diffuse White + 18% Grey reference strip for inline baseline drift check | ₹4,500 |
| **14** | Heavy-Duty Mounting Gantry | 3030 T-Slot Aluminum Profile | 1 | Adjustable conveyor bridge gantry with vibration dampers and height vernier | ₹3,100 |

---

## 3. Total Prototype Budget Summary

* **Total Bill of Materials (BOM) Cost:** **₹1,48,400 INR** (~$1,780 USD)
* **Scalability at Production Volume (50+ units):** **< ₹78,000 INR** per unit through direct sensor chip-on-board integration and custom unibody CNC casing.
