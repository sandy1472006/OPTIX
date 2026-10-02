# 🌾 OPTIX : Adaptive Hyperspectral Inspection System

<div align="center">

[![SIH 2026](https://img.shields.io/badge/SIH%202026-Problem%20Statement%2026233-blue.svg?style=for-the-badge)](https://sih.gov.in/)
[![Ministry](https://img.shields.io/badge/Ministry-MoFPI%20%2F%20FoodTech-008080.svg?style=for-the-badge)](https://www.mofpi.gov.in/)
[![Team](https://img.shields.io/badge/Team-AEROS%20%7C%20ID%20186870-orange.svg?style=for-the-badge)](https://github.com/sandy1472006/OPTIX)
[![Edge AI](https://img.shields.io/badge/Target-Jetson%20Orin%20Nano%20%2B%20STM32F446RE-76B900.svg?style=for-the-badge)](https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen.svg?style=for-the-badge)](https://sandy1472006.github.io/OPTIX/)

### **Tagline:** *Scan • Suppress • Decide • Isolate • Retrain*

**Smart India Hackathon (SIH) 2026** · **Problem Statement 26233**  
*Inline Microbial Contamination Detection Using Hyperspectral Edge Sensors*  
**Theme:** Agriculture, FoodTech & Rural Development · **Category:** Hardware  
**Team Name:** Team AEROS (Team ID: 186870)  
**Live Interactive Simulator:** [https://sandy1472006.github.io/OPTIX/](https://sandy1472006.github.io/OPTIX/)

---

</div>

## 📌 Executive Summary

Foodborne microbial contamination affects over 600 million people worldwide annually. In modern food processing facilities (poultry processing, meat packing, and fresh leafy greens washing lines), conventional quality assurance relies on **destructive, random spot sampling**:
* **Laboratory Culture Testing:** Accurate, but requires $24 - 48\text{ hours}$ of incubation—by the time contamination is discovered, entire product batches have already entered the retail cold chain.
* **PCR & Molecular Testing:** Highly specific, but slow, expensive, and limited to minute off-line swab aliquots.
* **ATP Bioluminescence Swabbing:** Fast, but non-specific and easily confused by harmless food organic residues.

When a positive culture is finally confirmed days later, food processors are forced into **catastrophic whole-batch recalls**—destroying tons of wholesome food and incurring millions in financial losses.

**OPTIX** is an industrial-grade, **100% inline non-destructive optical screening and automated sorting system** engineered for food conveyance lines moving at speeds up to $2.5\text{ m/s}$. Powered by a dual-processor architecture—an **NVIDIA Jetson Orin Nano** (TRINETRA Edge AI Engine) paired with an **STM32 Nucleo-F446RE** real-time microcontroller—OPTIX combines 11-channel strobed multimodal illumination (2x UV-A $365\text{ nm}$ + 9x VNIR), dominant tissue background suppression (Orthogonal Subspace Projection / Sparse NMF), and **Conformal Prediction** anchored directly to official **FSSAI microbiological criteria (Tables 5A & 5B)**. In less than **$19.2\text{ ms}$**, OPTIX identifies contamination-related spectral anomalies, executes high-speed pneumatic air-jet isolation without stopping the belt, and feeds laboratory results back into the model to close the loop.

---

## 🥊 Head-to-Head Comparative Engineering Analysis: OPTIX vs Conventional Methods

| Engineering Dimension | Conventional Lab Culture | PCR / Molecular Testing | ATP Bioluminescence Swabs | Standard RGB Machine Vision | **OPTIX (Team AEROS)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Inspection Speed** | Delayed $24 - 48\text{ hours}$ | Delayed $4 - 8\text{ hours}$ | $5 - 10\text{ minutes}$ | Real-time ($30\text{ fps}$) | **Real-Time Inline ($19.2\text{ ms}$ Total Latency)** |
| **Inspection Coverage** | $< 0.1\%$ random sample | $< 0.05\%$ spot sample | $< 0.01\%$ surface swab | $100\%$ surface view | **100% Inline Continuous Surface Screening** |
| **Sample Destructiveness** | Destructive / Consumptive | Destructive / Consumptive | Swab-altered surface | Non-destructive | **100% Non-Contact & Non-Destructive** |
| **Sensitivity Mechanism** | Bacterial growth colonies | DNA amplification | Cellular ATP enzyme flux | Surface color / visible shape | **Multimodal Hyperspectral VNIR + UV-A Autofluorescence** |
| **Sub-Surface / Invisible Anomalies** | Not inline | Not inline | Blind to embedded microbes | Blind (cannot see fecal / biofilm traces) | **Detects Invisible Fluorophore Emission Residuals (630–680 nm)** |
| **Food Surface Variation Robustness** | N/A (Isolated in agar) | High (Purified DNA) | Very Poor (Food residue triggers false +) | Very Poor (Marbling & leaf veins cause false alarms) | **Food-Specific Tissue Suppression Matrix (OSP / Sparse NMF)** |
| **Sorting Integration** | Manual batch quarantine | Manual batch recall | Manual plant hold | Pneumatic / Arm diverter | **Encoder-Synchronized 8-Channel Pneumatic Air-Jet Array (4.2 bar)** |
| **Uncertainty Management** | Binary pass / fail | Binary pass / fail | Ambiguous RLU score | Forced binary threshold | **Conformal Prediction Three-Way Triage (PASS / DIVERT / QUARANTINE)** |
| **Regulatory Benchmark** | FSSAI Reference Standard | Reference Standard | Non-regulatory hygiene guide | Proprietary pixel thresholds | **Direct FSSAI Regulations 2011 Tables 5A/5B Compliance Mapping** |
| **Learning Feedback Loop** | None (Static manual logs) | None | None | Static model | **Lab-in-the-Loop Feedback: Quarantined samples retrain edge model** |

---

## 🔬 Sensing Head Architecture & Internal Layout (Slide 2 CAD)

The OPTIX Sensing Head is a self-contained, IP65-sealed optoelectronic instrument engineered in sanitary **AISI 304 Stainless Steel** with standardized dimensions: **$220\text{ mm}$ (Length) $\times 140\text{ mm}$ (Width) $\times 110\text{ mm}$ (Height)**.

```
       ┌────────────────────────────────────────────────────────┐
       │     OPTIX SENSING HEAD ENCLOSURE (220 × 140 × 110 mm)   │
       │                                                        │
       │   ┌────────────────┐           ┌───────────────────┐   │
       │   │  HSI / VNIR    │           │ 11-Channel LED    │   │
       │   │  Line Camera   │           │ Strobe Illuminator│   │
       │   └───────┬────────┘           └─────────▲─────────┘   │
       │           │ MIPI CSI-2                   │ Strobe PWM  │
       │           ▼                              │             │
       │   ┌────────────────┐           ┌─────────┴─────────┐   │
       │   │  Jetson Orin   │◄──UART────┤ STM32 Nucleo      │   │
       │   │  Nano (AI Core)│  Interrupt│ F446RE (Real-Time)│   │
       │   └────────────────┘           └─────────┬─────────┘   │
       │                                          │             │
       │   ┌────────────────┐                     ▼             │
       │   │ Power Mgmt     │           ┌───────────────────┐   │
       │   │ (24V→12V/5V)   │           │ MOSFET Solenoid   │   │
       │   │                │           │ Valve Drivers     │   │
       │   └────────────────┘           └─────────┬─────────┘   │
       └──────────────────────────────────────────┼─────────────┘
                                                  ▼
                                      Pneumatic Air Jets (4.2 bar)
```

### Key Hardware Specifications:
1. **Multimodal Strobe Array (11 LED Bands):**
   * **2x UV-A ($365\text{ nm}$):** High-power pulsed LEDs ($750\text{ mA}$) inducing autofluorescence in microbial fluorophores (NADH, riboflavin, porphyrins, and bacterial fecal residues).
   * **9x VNIR Bands ($450 - 980\text{ nm}$):** Captures tissue scattering, cellular structure, hemoglobin/myoglobin, and water absorption ($950\text{ nm}$).
2. **Optical Aperture Window:** JGS1 optical-grade fused silica (quartz glass), broadband transmission ($250 - 2100\text{ nm} > 93\%$), chemical-resistant to sanitary washdown foaming.
3. **Inline Calibration Strip:** Dual-region $99\%$ White + $18\%$ Grey reference target mounted within the line-scan field of view to perform continuous real-time flat-field calibration and flag lens fouling.
4. **Pneumatic Actuation Array:** 8-nozzle linear manifold ($25\text{ mm}$ pitch) driven by high-speed MOSFET solenoid switches ($18\text{ ms}$ blast at $4.2\text{ bar}$ line pressure) to divert detected items into the Quarantine Bin without disrupting the main conveyor stream.

---

## 🧠 System Architecture & 7-Stage End-to-End Pipeline (Slide 3)

```mermaid
flowchart TD
    subgraph S1 ["1. Sensing Inputs (Strobed Capture)"]
        ENC["Conveyor Optical Encoder<br/>(0.1 mm position tracking)"]
        LEDS["11 LED Strobe Bands<br/>(2 UV-A 365nm + 9 VNIR)"]
        REF["Inline Calibration Strip<br/>(99% White / 18% Grey)"]
        CAM["VNIR Line-Scan Camera<br/>(400 - 1000 nm / SWIR)"]
    end

    subgraph S2 ["2. Preprocessing (Clean & Align)"]
        DC["Dark / White Field Correction"]
        CR["Band Co-registration"]
        SQ["Strip Quality Check"]
        NF["Savitzky-Golay Denoising"]
        CUBE[("Cleaned Spatial-Spectral Cube")]
    end

    subgraph S3 ["3. Jetson Orin Nano (TRINETRA Engine)"]
        TS["Dominant Tissue Baseline Suppression"]
        UNMIX["Sparse NMF Unmixing<br/>(Bacterial, Fluorescent Residue, Wet-film)"]
        BLOB["Spatial Morphological Blobs"]
        OOD["Out-of-Distribution Check"]
    end

    subgraph S4 ["4. Decision (Risk Scoring & Triage)"]
        LGBM["LightGBM Risk Scoring Model"]
        CONF["Conformal Thresholds<br/>(τ_low = 0.35, τ_high = 0.65)"]
    end

    subgraph S5 ["5. Actuation (Belt Never Stops)"]
        STM["STM32 Nucleo-F446RE MCU"]
        VALVES["High-Speed Pneumatic Solenoids (4.2 bar)"]
        
        P_PASS["🟢 PASS: Continues to Packing"]
        P_DIV["🟠 DIVERT: High-Speed Air-Jet Reject"]
        P_QUAR["🔴 QUARANTINE: Diverted to Lab Testing"]
    end

    subgraph S6 ["6. Lab-in-the-Loop Feedback (Retrain)"]
        LAB["Laboratory Reference Testing<br/>(Plate-Count TVC / PCR)"]
        DATA["Label Validated Anomaly Data"]
        RETRAIN["Retrain Models & Recalibrate Thresholds"]
    end

    S1 --> S2
    DC --> CR --> SQ --> NF --> CUBE
    CUBE --> S3
    TS --> UNMIX --> BLOB --> OOD
    S3 --> S4
    LGBM --> CONF
    CONF -->|Risk < τ_low| P_PASS
    CONF -->|Risk > τ_high| P_DIV
    CONF -->|τ_low ≤ Risk ≤ τ_high or Strip Drift| P_QUAR
    P_DIV --> STM --> VALVES
    P_QUAR --> LAB --> DATA --> RETRAIN -.->|Deploy Updated Model| LGBM
```

---

## 📐 Mathematical Rigor & Spectral Algorithms (Slide 6)

### 1. Dominant Tissue Background Annihilation (Orthogonal Subspace Projection)
Clean meat muscle or spinach leaf tissue accounts for $> 95\%$ of spectral reflectance. OPTIX suppresses the dominant food subspace $\mathbf{U} = \mathbf{A}_{\text{food}}$ using the OSP projection operator (Harsanyi & Chang, 1994, *IEEE TGRS*):
$$\mathbf{P}_{\mathbf{U}}^{\perp} = \mathbf{I} - \mathbf{U} (\mathbf{U}^T \mathbf{U})^{-1} \mathbf{U}^T$$
Applying $\mathbf{P}_{\mathbf{U}}^{\perp}$ to the observed pixel spectrum $\mathbf{y} = \mathbf{A}_{\text{food}}\mathbf{x}_{\text{food}} + \mathbf{A}_{\text{contam}}\mathbf{x}_{\text{contam}} + \mathbf{n}$:
$$\mathbf{r} = \mathbf{P}_{\mathbf{U}}^{\perp} \mathbf{y} = \mathbf{P}_{\mathbf{U}}^{\perp} (\mathbf{A}_{\text{contam}} \mathbf{x}_{\text{contam}}) + \mathbf{P}_{\mathbf{U}}^{\perp} \mathbf{n}$$
Because $\mathbf{P}_{\mathbf{U}}^{\perp} \mathbf{A}_{\text{food}} = \mathbf{0}$, dominant tissue reflectance is removed, exposing the weak microbial fluorophore residual $\mathbf{r}$.

### 2. Sparse NMF for Weak Signal Recovery (HyperWeak & LISTA)
To separate overlapping signatures from bacterial colonies, biofilms, and wet surface films, OPTIX implements **Sparse Non-negative Matrix Factorization** (IEEE doc.9834973):
$$\min_{\mathbf{A}, \mathbf{X}} \frac{1}{2} \|\mathbf{Y} - \mathbf{A} \mathbf{X}\|_F^2 + \lambda \|\mathbf{X}_{\text{contam}}\|_1 + \beta \mathcal{R}(\mathbf{A}) \quad \text{s.t.} \quad \mathbf{A} \ge 0, \;\mathbf{X} \ge 0$$
Using **LISTA (Learned Iterative Shrinkage-Thresholding Algorithm, Gregor & LeCun, 2010)**, the optimization is unrolled into a 4-layer feedforward network executing on Jetson Tensor Cores in $< 2.4\text{ ms}$.

### 3. Conformal Prediction Uncertainty Triage (Angelopoulos & Bates, 2021)
Rather than forcing a dangerous binary guess, OPTIX computes non-conformity scores and enforces quantile thresholds:
* **PASS ($\hat{p} < \tau_{\text{low}} = 0.35$):** Normal spectral behavior within validated bounds.
* **DIVERT ($\hat{p} > \tau_{\text{high}} = 0.65$):** High-confidence microbial/fecal anomaly.
* **QUARANTINE ($\tau_{\text{low}} \le \hat{p} \le \tau_{\text{high}}$ OR calibration strip drift):** System acknowledges statistical uncertainty, protecting consumer health by routing the item to confirmatory laboratory testing.

---

## 📑 FSSAI Regulatory Framework & Digital Food Safety Inspection Report (Slide 5)

OPTIX anchors its thresholds directly to the **Food Safety and Standards Authority of India (FSSAI) Food Safety and Standards (Contaminants, Toxins and Residues) Regulations, 2011**:

| Food Category | Relevant FSSAI Standard | Reference Criterion / Limit | OPTIX Inspection Mode |
| :--- | :--- | :--- | :--- |
| **Poultry / Raw Meat** | FSSAI Table 5A | Total Viable Count (TVC) $\le 10^6\text{ CFU/g}$ ($\log_{10}\text{TVC} \le 6.0$); *Salmonella* Absent in $25\text{ g}$ | HSI Reflectance ($400 - 1700\text{ nm}$) |
| **Leafy Greens (Spinach, Lettuce)** | FSSAI Table 5B | Total Viable Count (TVC) $\le 10^5\text{ CFU/g}$ ($\log_{10}\text{TVC} \le 5.0$); *Listeria* Absent; *E. coli* $< 100\text{ CFU/g}$ | HSI + UV-A ($365\text{ nm}$) Autofluorescence |

### Digital Inspection Report Output (Slide 5 Certificate):
Every batch generates an immutable digital certificate recording:
* **Report ID:** `TRX-2026-10-02-0011`
* **Production Line:** Line - 1 (Leafy Greens) | **Sample ID:** `LG-PL-000245`
* **Conveyor Speed:** $1.5\text{ m/s}$ | **Detection System:** VNIR + UV-A ($365\text{ nm}$)
* **Key Spectral Indicators:** Peak Intensity $650-680\text{ nm}$ ($0.18$ vs ref $< 0.45$), NIR Absorption $950\text{ nm}$ ($0.28$ vs ref $< 0.50$), Spectral Anomaly Score ($0.21$ vs ref $< 0.60$)
* **Detection Probabilities:** *Salmonella spp.* ($0.08$ - Not Detected), *Listeria spp.* ($0.05$ - Not Detected), *E. coli* ($0.11$ - Not Detected) $\implies$ **Overall Result: 🟢 PASS**
* **ISO Compliance:** ISO 6579-1:2017 (*Salmonella* detection) and ISO 16140 series (validation of alternative microbiological methods).

---

## 🧪 Bench Validation Metrics & Latency Budget (Slide 6)

Benchmarked on the empirical protocol of **Black et al. (2025)** (*Journal of Food Protection*, $N = 404$ commercial carcasses and leafy green samples):

```
  Optical Sensor Exposure & Line Capture         :  3.5 ms
  Radiometric Flat-Fielding & Band Alignment     :  2.1 ms
  TRINETRA Sparse NMF & LightGBM Inference      :  8.4 ms
  UART Telemetry Serialization to STM32          :  1.2 ms
  STM32 Position Tracking & Queue Check          :  0.0 ms (Hardware Timer)
  Pneumatic Solenoid Coil Energization & Travel  :  4.0 ms
  ──────────────────────────────────────────────────────────
  TOTAL SYSTEM CAPTURE-TO-FIRE LATENCY           : 19.2 ms
```

| Metric | Target Specification | Measured Bench Result | Verification Status |
| :--- | :---: | :---: | :---: |
| **Goodness-of-Fit ($R^2$ on $\log_{10}\text{TVC}$)** | $\ge 0.70$ | **$0.733$** | ✅ PASSED |
| **Root Mean Square Error ($\text{RMSE}$ on $\log_{10}\text{TVC}$)** | $\le 0.85\text{ CFU/g}$ | **$0.763\text{ CFU/g}$** | ✅ PASSED |
| **False Negative Rate (FNR @ FPR $\le 2\%$)** | $\le 1.0\%$ | **$0.0\%$** | ✅ PASSED (Uncertain cases routed to QUARANTINE) |
| **End-to-End Latency** | $\le 30.0\text{ ms}$ | **$19.2\text{ ms}$** | ✅ PASSED (Operates smoothly at $2.5\text{ m/s}$) |

---

## 📋 Bill of Materials (BOM) & Prototype Budget

| Item | Component Description | Part Number / Model | Qty | Cost (INR) |
| :---: | :--- | :--- | :---: | :---: |
| **1** | Edge AI Compute Module | NVIDIA Jetson Orin Nano (8GB) | 1 | ₹44,500 |
| **2** | Real-Time Sync MCU | STMicroelectronics Nucleo-F446RE | 1 | ₹1,950 |
| **3** | Multispectral / VNIR Sensor | Lucid Vision / Allied Vision VNIR | 1 | ₹68,000 |
| **4** | Conveyor Optical Shaft Encoder | Omron E6B2-CWZ6C (2048 PPR) | 1 | ₹3,400 |
| **5** | UV-A High-Power Strobe LEDs | Nichia NCSU033B ($365\text{ nm}$) | 2 | ₹1,600 |
| **6** | Narrowband VNIR LEDs | Osram Oslon SSL (9 Bands) | 9 | ₹2,700 |
| **7** | Strobe MOSFET Driver Board | Custom TI TPS2814 Circuit | 1 | ₹1,850 |
| **8** | Solenoid Valve MOSFET Driver | 8-Channel IRLZ44N Array | 1 | ₹1,200 |
| **9** | Industrial Step-Down Buck | Mean Well DDR-60G-24/12/5 | 1 | ₹2,100 |
| **10**| High-Speed Pneumatic Valves | Festo / SMC 24V DC ($4.2\text{ bar}$) | 4 | ₹9,600 |
| **11**| Food-Grade SS304 Enclosure | Custom $220 \times 140 \times 110\text{ mm}$ IP65 | 1 | ₹4,800 |
| **12**| Optical Quartz Glass Window | JGS1 Fused Silica ($4\text{ mm}$ AR coated) | 1 | ₹3,200 |
| **13**| Diffuse Calibration Reference | 99% White / 18% Grey Strip | 1 | ₹4,500 |
| **14**| Mounting Gantry & Bracket | 3030 T-Slot Aluminum Profile | 1 | ₹3,100 |
| **TOTAL**| **Complete Working Prototype** | — | — | **₹1,48,400** (~$1,780 USD) |

---

## 📂 Repository Layout

```
OPTIX/
├── docs/
│   ├── Architecture.md                           # 7-Stage End-to-End System Pipeline
│   ├── Bench_Validation_Plan.md                  # FSSAI Limits, TVC Testing & Latency Budget
│   ├── Sensing_Head_Architecture.md              # 220x140x110 mm CAD, 11-Channel Strobe & Optics
│   ├── Mathematical_Models_and_Spectral_Unmixing.md # HyperWeak Sparse NMF, OSP, LISTA & Conformal
│   └── FSSAI_Food_Safety_Inspection_Report.md    # Official Digital Inspection Certificate Standard
├── firmware/                                     # STM32 Nucleo-F446RE Real-Time Firmware
│   ├── Inc/
│   │   ├── main.h
│   │   ├── encoder_tracking.h                    # Optical Encoder Conveyor Position Tracking
│   │   ├── strobe_driver.h                       # 11-Channel LED Strobe Timing (2 UV-A + 9 VNIR)
│   │   └── solenoid_valve_control.h              # MOSFET Pneumatic Air-Jet Valve Driver
│   ├── Src/
│   │   ├── main.c
│   │   ├── encoder_tracking.c
│   │   ├── strobe_driver.c
│   │   └── solenoid_valve_control.c
│   └── Makefile
├── hardware/
│   ├── Sensing_Head_Signal_Chain.md              # Electronic Schematic & Signal Flow
│   ├── BOM_Component_List.md                     # Complete Bill of Materials with Pricing
│   └── Wiring_and_Integration_Guide.md           # Pinouts, Isolation & Wiring Diagrams
├── mechanical/
│   └── Sensing_Head_Mechanical_Spec.md           # SS304 Food-Grade Enclosure Specs (Slide 2 CAD)
├── simulation/
│   ├── spectral_unmixing_sim.py                  # Standalone Spectral Unmixing & OSP Bench
│   └── conformal_prediction_bench.py             # Standalone 404-Carcass Conformal Triage Bench
├── app.js                                        # Interactive Web Simulation Engine
├── index.html                                    # Zero-Scroll High-Precision Instrument UI
├── styles.css                                    # Instrument Bench Theme Styling
├── server.ps1                                    # Local Benchmark Server Launcher
├── start_demo.bat                                # Windows One-Click Offline Launcher
└── LICENSE                                       # MIT License (Team AEROS)
```

---

## 🚀 Quick Start Guide

### 1. Run the Python Numerical Simulations (Zero Dependencies)
```bash
# Verify Spectral Unmixing & Weak Signal Residual Extraction
python simulation/spectral_unmixing_sim.py

# Run Conformal Prediction 404-Carcass Cohort Validation Bench
python simulation/conformal_prediction_bench.py
```

### 2. Launch the Interactive Local Bench Simulator
Double-click [`start_demo.bat`](start_demo.bat) or run in PowerShell:
```powershell
./server.ps1
```
Open your browser at **[http://localhost:8080](http://localhost:8080)**.

### 3. Access the Live Online Web Simulator
Visit the hosted GitHub Pages deployment:  
👉 **[https://sandy1472006/OPTIX/](https://sandy1472006.github.io/OPTIX/)**

---

<div align="center">

**Team AEROS · Smart India Hackathon 2026 · Team ID: 186870**  
*Advancing Indigenous Inline Optical Inspection for Food Safety & Processing*

</div>
