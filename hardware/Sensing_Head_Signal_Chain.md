# ⚡ OPTIX Sensing Head: Analog Signal Chain & Electronics Architecture

**System:** OPTIX (Adaptive Hyperspectral Inspection System)  
**Team:** Team AEROS (Team ID: 186870) | **SIH 2026 Problem Statement 26233**  

---

## 1. Architectural Overview & Internal Layout

The OPTIX Sensing Head is a self-contained, IP65-sealed inline optoelectronic inspection unit mounted directly above the food conveyance line. It integrates active illumination, hyperspectral sensing, embedded edge AI processing, and real-time pneumatic ejection control.

```
       ┌────────────────────────────────────────────────────────┐
       │                OPTIX SENSING HEAD                      │
       │                                                        │
       │   ┌────────────────┐           ┌───────────────────┐   │
       │   │  HSI / VNIR    │           │ 11-Channel LED    │   │
       │   │  Line Camera   │           │ Strobe Illuminator│   │
       │   └───────┬────────┘           └─────────▲─────────┘   │
       │           │ MIPI CSI-2                   │ PWM/Strobe  │
       │           ▼                              │             │
       │   ┌────────────────┐           ┌─────────┴─────────┐   │
       │   │  Jetson Orin   │◄──UART────┤ STM32 Nucleo      │   │
       │   │  Nano (AI Core)│   SPI/Sync│ F446RE (Real-Time)│   │
       │   └────────────────┘           └─────────┬─────────┘   │
       │                                          │             │
       │   ┌────────────────┐                     ▼             │
       │   │ Power Mgmt     │           ┌───────────────────┐   │
       │   │ (24V DC Step)  │           │ MOSFET Solenoid   │   │
       │   └────────────────┘           │ Valve Drivers     │   │
       └──────────────────────────────────────────┬─────────────┘
                                                  ▼
                                      Pneumatic Air Jets (4.2 bar)
```

---

## 2. Subsystem Signal Chain Specifications

### A. Optical Sensing Subsystem
* **Detector Type:** High-sensitivity VNIR Line-Scan CMOS Sensor / Multispectral Sensor.
* **Spectral Range:** 
  * Primary: $400 - 1000\text{ nm}$ (Visible to Near-Infrared).
  * Extended: $400 - 1700\text{ nm}$ (VNIR + SWIR for deep tissue penetration).
* **Interface to Jetson:** 4-lane MIPI CSI-2 with hardware Direct Memory Access (DMA).
* **Line Acquisition Rate:** Up to $2000\text{ lines/s}$ synchronized to conveyor encoder pulses.

### B. Active Multimodal Illumination (11 LED Bands)
* **UV-A Channels (2x 365 nm):**
  * High-power narrow-band UV-A LEDs driven at $750\text{ mA}$ pulse current.
  * Purpose: Excitation of microbial fluorophores (NADH, riboflavin, porphyrins, and bacterial fecal residues).
* **Visible & NIR Channels (9x Bands):**
  * Wavelengths: $450\text{ nm}, 520\text{ nm}, 590\text{ nm}, 660\text{ nm}, 730\text{ nm}, 810\text{ nm}, 850\text{ nm}, 940\text{ nm}, 980\text{ nm}$.
  * Purpose: Tissue background reflectance calibration, moisture absorption ($950 - 970\text{ nm}$), and structural scattering suppression.
* **Strobe Controller:** High-speed MOSFET driver with sub-microsecond rise times ($t_r < 450\text{ ns}$), eliminating motion blur at line speeds up to $3.0\text{ m/s}$.

### C. Edge Compute & AI Inference (Jetson Orin Nano)
* **Compute Engine:** 1024-core NVIDIA Ampere architecture GPU with 32 Tensor Cores.
* **Pre-processing:** Hardware dark/white reference calibration, band co-registration, and noise filtering.
* **TRINETRA Engine:** Sparse NMF (Non-negative Matrix Factorization) tissue suppression + LISTA unrolling + LightGBM risk classifier.
* **Inference Latency:** $< 8.4\text{ ms}$ per spatial frame via TensorRT FP16 optimization.

### D. Real-Time Synchronization & Sorting (STM32 Nucleo-F446RE)
* **Processor:** 180 MHz ARM Cortex-M4F with single-cycle DSP instructions.
* **Encoder Pulse Tracking:** Hardware TIM2 timer in 4x quadrature decoder mode linked to 2048 PPR optical shaft encoder ($0.1\text{ mm}$ spatial tracking precision).
* **Pneumatic Solenoid Drivers:** 8-channel low-$R_{DS(on)}$ logic-level N-channel MOSFET array (IRLZ44N) switching 24V DC solenoid valves ($18\text{ ms}$ pulse duration at $4.2\text{ bar}$ pneumatic line pressure).
