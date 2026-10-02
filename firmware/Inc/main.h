/**
 * @file main.h
 * @brief OPTIX Sensing Head Control & Synchronization Firmware
 * @author Team AEROS (SIH 2026 - Team ID: 186870)
 * @target STM32F446RET6 (180 MHz ARM Cortex-M4F)
 */

#ifndef __MAIN_H
#define __MAIN_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <stdbool.h>

/* --- System Clock & Timing Definitions --- */
#define SYSTEM_CLOCK_FREQ_HZ         180000000UL
#define TICK_TIMER_PERIOD_US         10UL

/* --- Optical Encoder Specs --- */
#define ENCODER_PULSES_PER_REV       2048
#define ENCODER_WHEEL_DIAMETER_MM    65.0f
#define MM_PER_PULSE                 ((3.14159265f * ENCODER_WHEEL_DIAMETER_MM) / (ENCODER_PULSES_PER_REV * 4))

/* --- Illumination Subsystem (11 LED Bands) --- */
#define NUM_LED_CHANNELS             11
#define LED_UVA_365NM_CH1            0
#define LED_UVA_365NM_CH2            1
#define LED_VNIR_START_CH            2
#define LED_STROBE_PULSE_WIDTH_US    45

/* --- Actuation & Air-Jet Sorting --- */
#define NUM_AIR_JET_NOZZLES          8
#define AIR_JET_BLAST_DURATION_MS    18
#define SOLENOID_PRESSURE_BAR        4.2f

/* --- UART Comm Protocol with Jetson Orin Nano --- */
#define UART_BAUDRATE                115200
#define UART_RX_BUFFER_SIZE          128

typedef enum {
    TRIAGE_PASS       = 0x01,
    TRIAGE_DIVERT     = 0x02,
    TRIAGE_QUARANTINE = 0x03
} TriageDecision_t;

typedef struct {
    uint32_t item_id;
    uint32_t encoder_trigger_pos;
    uint8_t  lateral_nozzle_mask;
    TriageDecision_t decision;
    bool     active;
} SortingQueueEntry_t;

/* Global Function Prototypes */
void SystemClock_Config(void);
void Error_Handler(void);

#ifdef __cplusplus
}
#endif

#endif /* __MAIN_H */
