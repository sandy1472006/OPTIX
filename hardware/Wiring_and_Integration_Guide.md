# 🔌 OPTIX Sensing Head: Wiring & Integration Guide

**System:** OPTIX (Adaptive Hyperspectral Inspection System)  
**Team:** Team AEROS (Team ID: 186870) | **SIH 2026 Problem Statement 26233**  

---

## 1. Power Distribution Tree

```
  [24V DC Industrial PSU (10A / 240W)]
            │
            ├─────────────────────────────────────────► [8-Ch Pneumatic Solenoids]
            │                                             (via MOSFET Low-Side Switch)
            │
            ├────────► [Mean Well DC-DC Buck (12V / 5A)]
            │                │
            │                └────────────────────────► [Jetson Orin Nano Main Rail]
            │
            └────────► [Mean Well DC-DC Buck (5V / 3A)]
                             │
                             ├────────────────────────► [STM32 Nucleo 5V Vin Rail]
                             │
                             └────────────────────────► [11-Ch LED Strobe Constant Current Drivers]
```

---

## 2. STM32 Nucleo-F446RE Pinout & Interface Mapping

| Pin Name | Function / Peripheral | Target Hardware Interface | Signal Description |
| :---: | :--- | :--- | :--- |
| **PA0** | `TIM2_CH1` (Alternate Function) | Encoder Phase A (via 24V $\to$ 3.3V Opto) | Conveyor Quadrature Pulse Line A |
| **PA1** | `TIM2_CH2` (Alternate Function) | Encoder Phase B (via 24V $\to$ 3.3V Opto) | Conveyor Quadrature Pulse Line B |
| **PA2** | `USART2_TX` | Jetson Orin Nano UART RX (Pin 10 / GPIO) | Telemetry & Status Stream to Jetson |
| **PA3** | `USART2_RX` | Jetson Orin Nano UART TX (Pin 8 / GPIO) | Classification & Firing Trigger Commands |
| **PB0 - PB1** | `GPIO_Output` (Fast Slew) | Strobe Driver Board Ch 0 - 1 | 2x UV-A 365 nm Pulse Fire Pins |
| **PB2 - PB10**| `GPIO_Output` (Fast Slew) | Strobe Driver Board Ch 2 - 10 | 9x Visible & NIR LEDs Pulse Fire Pins |
| **PC0 - PC7** | `GPIO_Output` | 8-Channel MOSFET Gate Inputs | Air Jet Solenoids 1 to 8 Firing Triggers |
| **PB12** | `GPIO_Output` (Line Sync) | Line-Scan Camera Trigger In | External Exposure Synchronization Pulse |

---

## 3. Grounding & Noise Mitigation Strategy

1. **Galvanic Isolation for Actuators:** The inductive 24V solenoid valve returns are strictly isolated from the sensitive CMOS sensor and Jetson analog ground planes via high-speed optocouplers (`PC817` / `6N137`).
2. **Reverse EMF Flyback Suppression:** Each inductive solenoid coil is clamped with ultra-fast recovery Schottky diodes (`1N5819` / `SS34`) placed directly across the valve terminals.
3. **Differential Optical Encoder Lines:** The encoder signals travel through a shielded twisted pair with the shield grounded solely at the enclosure chassis star-point.
