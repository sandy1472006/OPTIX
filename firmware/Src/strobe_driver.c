/**
 * @file strobe_driver.c
 * @brief 11-Channel LED Strobe Driver Timing & Microsecond Pulse Generator
 * @author Team AEROS (SIH 2026 - Team ID: 186870)
 */

#include "strobe_driver.h"

static StrobeConfig_t s_strobe_cfg;

void Strobe_Init(void) {
    for (int i = 0; i < NUM_LED_CHANNELS; i++) {
        s_strobe_cfg.channel_enabled[i] = true;
        s_strobe_cfg.pulse_width_us[i] = LED_STROBE_PULSE_WIDTH_US;
        s_strobe_cfg.current_ma[i] = (i < 2) ? 750 : 500; /* UV-A channels run at 750mA peak pulse */
    }
}

void Strobe_ConfigureChannel(uint8_t channel, uint16_t current_ma, uint16_t pulse_width_us) {
    if (channel < NUM_LED_CHANNELS) {
        s_strobe_cfg.current_ma[channel] = current_ma;
        s_strobe_cfg.pulse_width_us[channel] = pulse_width_us;
    }
}

void Strobe_FireSequence(void) {
    /* Sequence all 11 channels synchronously with Line-Scan Camera exposure trigger */
    for (uint8_t ch = 0; ch < NUM_LED_CHANNELS; ch++) {
        if (s_strobe_cfg.channel_enabled[ch]) {
            /* Hardware GPIO / Timer Channel Pulse */
            // Set GPIO pin HIGH for s_strobe_cfg.pulse_width_us[ch]
            // Delay / DWT cycle counter
            // Set GPIO pin LOW
        }
    }
}

void Strobe_FireUVOnly(uint16_t duration_us) {
    /* Fire only UV-A 365nm Channel 0 and 1 for steady-state fluorescence integration */
    // GPIO UV_CH1_PIN | UV_CH2_PIN = HIGH
    // Microsecond delay
    // GPIO UV_CH1_PIN | UV_CH2_PIN = LOW
}

void Strobe_FireVNIRMultiBand(uint16_t mask) {
    /* Selective multi-wavelength reflectance strobe */
    for (uint8_t ch = LED_VNIR_START_CH; ch < NUM_LED_CHANNELS; ch++) {
        if (mask & (1 << (ch - LED_VNIR_START_CH))) {
            // Pulse selected VNIR LED channel
        }
    }
}
