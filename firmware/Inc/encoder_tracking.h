/**
 * @file encoder_tracking.h
 * @brief Quadrature Optical Conveyor Encoder Position Tracking & Line-Trigger Generator
 * @author Team AEROS (SIH 2026 - Team ID: 186870)
 */

#ifndef __ENCODER_TRACKING_H
#define __ENCODER_TRACKING_H

#include "main.h"

void Encoder_Init(void);
uint32_t Encoder_GetRawCount(void);
float Encoder_GetPositionMM(void);
float Encoder_GetConveyorSpeedMPS(void);
void Encoder_UpdatePeriodic(uint32_t delta_time_us);

#endif /* __ENCODER_TRACKING_H */
