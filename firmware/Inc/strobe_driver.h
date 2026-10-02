/**
 * @file strobe_driver.h
 * @brief 11-Channel Multimodal LED Strobe Driver Interface (2 UV-A 365nm + 9 Visible/NIR)
 * @author Team AEROS (SIH 2026 - Team ID: 186870)
 */

#ifndef __STROBE_DRIVER_H
#define __STROBE_DRIVER_H

#include "main.h"

typedef struct {
    uint16_t current_ma[NUM_LED_CHANNELS];
    uint16_t pulse_width_us[NUM_LED_CHANNELS];
    bool     channel_enabled[NUM_LED_CHANNELS];
} StrobeConfig_t;

void Strobe_Init(void);
void Strobe_ConfigureChannel(uint8_t channel, uint16_t current_ma, uint16_t pulse_width_us);
void Strobe_FireSequence(void);
void Strobe_FireUVOnly(uint16_t duration_us);
void Strobe_FireVNIRMultiBand(uint16_t mask);

#endif /* __STROBE_DRIVER_H */
