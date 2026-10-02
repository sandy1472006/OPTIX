##############################################################################
# OPTIX Sensing Head Firmware Makefile (STM32F446RE)
# Team AEROS | Smart India Hackathon 2026 | Problem Statement 26233
##############################################################################

TARGET = optix_sensing_head

DEBUG = 1
OPT = -Og

BUILD_DIR = build

C_SOURCES = \
Src/main.c \
Src/encoder_tracking.c \
Src/strobe_driver.c \
Src/solenoid_valve_control.c

PREFIX = arm-none-eabi-
CC = $(PREFIX)gcc
AS = $(PREFIX)gcc -x assembler-with-cpp
CP = $(PREFIX)objcopy
SZ = $(PREFIX)size

HEX = $(CP) -O ihex
BIN = $(CP) -O binary -S

CPU = -mcpu=cortex-m4
FPU = -mfpu=fpv4-sp-d16
FLOAT-ABI = -mfloat-abi=hard
MCU = $(CPU) -mthumb $(FPU) $(FLOAT-ABI)

C_INCLUDES = \
-IInc

CFLAGS = $(MCU) $(C_INCLUDES) $(OPT) -Wall -fdata-sections -ffunction-sections

ifeq ($(DEBUG), 1)
CFLAGS += -g -gdwarf-2
endif

.PHONY: all clean

all: $(BUILD_DIR)/$(TARGET).elf $(BUILD_DIR)/$(TARGET).hex $(BUILD_DIR)/$(TARGET).bin

clean:
	rm -rf $(BUILD_DIR)
