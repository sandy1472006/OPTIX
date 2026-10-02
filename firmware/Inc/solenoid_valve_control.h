/**
 * @file solenoid_valve_control.h
 * @brief MOSFET Pneumatic Solenoid Valve Driver for Air-Jet Diverter Array
 * @author Team AEROS (SIH 2026 - Team ID: 186870)
 */

#ifndef __SOLENOID_VALVE_CONTROL_H
#define __SOLENOID_VALVE_CONTROL_H

#include "main.h"

#define MAX_SORTING_QUEUE_SIZE 32

void Valve_Init(void);
bool Valve_EnqueueSortingTarget(uint32_t item_id, uint32_t trigger_encoder_pos, uint8_t nozzle_mask, TriageDecision_t decision);
void Valve_ProcessQueue(uint32_t current_encoder_pos);
void Valve_FireNozzleManual(uint8_t nozzle_index, uint16_t duration_ms);

#endif /* __SOLENOID_VALVE_CONTROL_H */
