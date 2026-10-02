/**
 * @file solenoid_valve_control.c
 * @brief Pneumatic Solenoid Valve Actuation Queue & Firing Controller
 * @author Team AEROS (SIH 2026 - Team ID: 186870)
 */

#include "solenoid_valve_control.h"

static SortingQueueEntry_t s_sorting_queue[MAX_SORTING_QUEUE_SIZE];
static uint8_t s_queue_count = 0;

void Valve_Init(void) {
    for (int i = 0; i < MAX_SORTING_QUEUE_SIZE; i++) {
        s_sorting_queue[i].active = false;
    }
    s_queue_count = 0;
}

bool Valve_EnqueueSortingTarget(uint32_t item_id, uint32_t trigger_encoder_pos, uint8_t nozzle_mask, TriageDecision_t decision) {
    if (s_queue_count >= MAX_SORTING_QUEUE_SIZE) {
        return false; /* Queue full */
    }

    for (int i = 0; i < MAX_SORTING_QUEUE_SIZE; i++) {
        if (!s_sorting_queue[i].active) {
            s_sorting_queue[i].item_id = item_id;
            s_sorting_queue[i].encoder_trigger_pos = trigger_encoder_pos;
            s_sorting_queue[i].lateral_nozzle_mask = nozzle_mask;
            s_sorting_queue[i].decision = decision;
            s_sorting_queue[i].active = true;
            s_queue_count++;
            return true;
        }
    }
    return false;
}

void Valve_ProcessQueue(uint32_t current_encoder_pos) {
    for (int i = 0; i < MAX_SORTING_QUEUE_SIZE; i++) {
        if (s_sorting_queue[i].active) {
            /* Check if item has reached air jet station */
            if (current_encoder_pos >= s_sorting_queue[i].encoder_trigger_pos) {
                if (s_sorting_queue[i].decision == TRIAGE_DIVERT || 
                    s_sorting_queue[i].decision == TRIAGE_QUARANTINE) {
                    /* Fire selected lateral MOSFET nozzle drivers */
                    // GPIO_Write(VALVE_PORT, s_sorting_queue[i].lateral_nozzle_mask)
                    // Start 18ms pulse timer to de-energize solenoids
                }
                s_sorting_queue[i].active = false;
                if (s_queue_count > 0) s_queue_count--;
            }
        }
    }
}

void Valve_FireNozzleManual(uint8_t nozzle_index, uint16_t duration_ms) {
    if (nozzle_index < NUM_AIR_JET_NOZZLES) {
        // Energize specified solenoid driver
    }
}
