/**
 * @file main.c
 * @brief Main Entry Point for OPTIX Sensing Head Real-Time Microcontroller
 * @author Team AEROS (SIH 2026 - Team ID: 186870)
 * @target STM32F446RET6 (180 MHz ARM Cortex-M4F)
 */

#include "main.h"
#include "encoder_tracking.h"
#include "strobe_driver.h"
#include "solenoid_valve_control.h"

int main(void) {
    /* 1. Configure System Clocks: PLL to 180 MHz from 8 MHz HSE crystal */
    SystemClock_Config();

    /* 2. Initialize Subsystems */
    Encoder_Init();
    Strobe_Init();
    Valve_Init();

    uint32_t last_tick = 0;

    /* 3. Main Real-Time Control Loop */
    while (1) {
        uint32_t current_pos = Encoder_GetRawCount();

        /* Process any pending pneumatic air-jet ejection triggers */
        Valve_ProcessQueue(current_pos);

        /* Periodic speed and status telemetry update every 1 ms */
        Encoder_UpdatePeriodic(1000);
    }
}

void SystemClock_Config(void) {
    /* 180 MHz clock tree configuration for STM32F446RE */
}

void Error_Handler(void) {
    while (1) {
        /* Trap */
    }
}
