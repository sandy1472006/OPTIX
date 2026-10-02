/**
 * @file encoder_tracking.c
 * @brief Optical Encoder Interface Implementation (STM32 TIM2 / TIM3 Quadrature Mode)
 * @author Team AEROS (SIH 2026 - Team ID: 186870)
 */

#include "encoder_tracking.h"

static volatile uint32_t s_raw_pulse_count = 0;
static volatile uint32_t s_prev_pulse_count = 0;
static volatile float s_conveyor_speed_mps = 0.0f;
static volatile float s_conveyor_position_mm = 0.0f;

void Encoder_Init(void) {
    /* Initialize Hardware Timer (e.g. TIM2) in 4x Quadrature Encoder Mode */
    s_raw_pulse_count = 0;
    s_prev_pulse_count = 0;
    s_conveyor_speed_mps = 0.0f;
    s_conveyor_position_mm = 0.0f;
}

uint32_t Encoder_GetRawCount(void) {
    return s_raw_pulse_count;
}

float Encoder_GetPositionMM(void) {
    return s_conveyor_position_mm;
}

float Encoder_GetConveyorSpeedMPS(void) {
    return s_conveyor_speed_mps;
}

void Encoder_UpdatePeriodic(uint32_t delta_time_us) {
    /* Simulated read from TIM2->CNT register */
    uint32_t delta_pulses = s_raw_pulse_count - s_prev_pulse_count;
    s_prev_pulse_count = s_raw_pulse_count;

    float delta_distance_mm = (float)delta_pulses * MM_PER_PULSE;
    s_conveyor_position_mm += delta_distance_mm;

    if (delta_time_us > 0) {
        /* Speed = Distance (m) / Time (s) */
        float dt_sec = (float)delta_time_us / 1000000.0f;
        s_conveyor_speed_mps = (delta_distance_mm / 1000.0f) / dt_sec;
    }
}
