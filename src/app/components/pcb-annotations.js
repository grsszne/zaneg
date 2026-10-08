// References match the KiCad component instances retained in the STEP exports.
export const pcbAnnotations = {
  "usb-interface": [
    { ref: "U1", title: "STM32F723", description: "Buffers data between the Raspberry Pi, transmitter, and receiver." },
    { ref: "J2", title: "USB to host", description: "USB data and power connection to the Raspberry Pi." },
    { ref: "J4", title: "Transmitter interface", description: "Carries serial transmit data, laser enable, and ground to TX-A." },
    { ref: "J8", title: "Receiver interface", description: "Eight data lines, a byte clock, and flow control bring recovered bytes back from RX-A." },
    { ref: "J1", title: "SWD programming", description: "Programming and debugging access to the STM32, including reset." },
    { ref: "U4", title: "Transmitter power switch", description: "The TPS2051C switches the transmitter’s 5 V supply and reports power faults." },
  ],
  "tx-a": [
    { ref: "U4", title: "Laser current control", description: "The OPA356 compares the current-sense signal with the setpoint and drives the current-control stage." },
    { ref: "U3", title: "Boost supply", description: "The TPS61085 raises the supply voltage for the laser driver." },
    { ref: "U2", title: "Modulation logic", description: "Combines the incoming data with the laser-ready signal before the modulation driver." },
    { ref: "J2", title: "Data and enable", description: "Transmit data, laser enable, and ground arrive from the USB interface." },
    { ref: "J3", title: "Laser connection", description: "Anode and cathode connection for the separately mounted HL63603TG laser diode, operating at 638 nm." },
    { ref: "U1", title: "Armed power rail", description: "The TPS22919 load switch supplies the driver when the laser is enabled and physically armed." },
    { ref: "J1", title: "USB-C power input", description: "Supplies power to TX-A. Transmit data arrives separately through the data-and-enable connector. Yes, USB-C is a little overkill, but it is convenient, cheap, and already used in BOM." },
  ],
  "rx-a": [
    { ref: "D1", title: "S5972 photodiode", description: "Converts incoming laser light into a small electrical current." },
    { ref: "U1", title: "Transimpedance amplifier", description: "The AD8015 converts photodiode current into a differential signal." },
    { ref: "U2", title: "Limiting amplifier", description: "The SY88803V conditions the received signal for the FPGA and provides loss-of-signal detection." },
    { ref: "U4", title: "iCE40UP5K FPGA", description: "Intended to recover clock timing, decode the received stream, and produce parallel bytes for large JST GH header." },
    { ref: "J2", title: "Recovered data", description: "Eight data lines, a byte clock, and flow control connect back to the USB interface." },
    { ref: "J1", title: "FPGA programming", description: "SPI configuration, reset, and configuration-done signals provide access for programming and bring-up." },
    { ref: "U7", title: "Configuration flash", description: "The W25Q80 stores the FPGA configuration for startup and is programmed via SPI via headers." },
  ],
};
