---
title: "Sending Data Through Lasers"
description: "Building a 638 nm optical link between two Raspberry Pis with six custom PCBs, from USB interfaces and laser drivers to mixed-signal, FPGA-based receivers."
date: "September 2026–present"
order: 1
status: "Work in progress"
tags: "optics, FPGA, analog circuits, PCBs"
visual: "laser-architecture"
---

## Overall architecture

The link is designed around two matching nodes. Each has a Raspberry Pi, a physical USB interface (PHY-A), a transmitter (TX-A), and an receiver (RX-A). Two separate beams carry data in opposite directions, allowing each node to transmit and receive simultaneously.

The Raspberry Pis run the host CLI software; the custom boards handle the optical link. An STM32F723-based USB interface buffers data between the Pi and the transmitter and receiver boards via USB 2.0 to the Pis. TX-A drives an HL63603TG laser diode from a serial input from the STM32. At the other end, RX-A converts the incoming light into a differential signal, with an iCE40UP5K FPGA intended to recover timing and decode the data before passing it back to the Pi through the STM32.

## PCBs

Each node uses three boards: a USB interface, a transmitter, and a receiver. These models were exported from KiCad on September 8, 2026, including copper tracks, pads, vias, and silkscreen.

<!-- pcb:usb-interface -->
### USB interface

This board connects the Raspberry Pi to the optical hardware. It buffers outgoing data for TX-A and accepts recovered data from RX-A.

**STM32F723**
Handles USB communication and data between the host and the two TX/RX boards.

**Board connections**
A serial data line feeds TX-A. A separate connection (the large 14 pin) brings decoded bytes and control signals back from RX-A.

**Power and debug**
Local power handling, a programming header, and status indicators support bring up independently of the host software
<!-- /pcb -->

<!-- pcb:tx-a -->
### TX-A / transmitter

TX-A converts the incoming bit stream into changes in laser current. The laser is mounted separately from this board via screw terminal.

**Current driver**
The analog driver sets the diode current, while the modulation path switches the optical output with the data.

**Power and enable**
A TPS61085 boost converter supplies the driver, taking 5V (sourced upstream from Pi 5V peripheral line via USB) to 8V. Arming this rail requires both the physical jumper and the digital arm signal from the PHY board (PHY-A).

**HL63603TG · 638 nm**
The external laser diode which creates the 638 nm light for carrying data between hosts.
<!-- /pcb -->

<!-- pcb:rx-a -->
### RX-A / receiver

RX-A contains the optical front end and the FPGA. It turns incoming light into a differential signal that can be decoded and passed to the USB interface.

**S5972**
The photodiode produces a current in response to received light, chosen specifically for its response to 638 nm wavelength and balance of capacitance to surface area.

**AD8015 → SY88803V**
The transimpedance amplifier converts that current to a voltage. The limiting amplifier conditions the signal for the digital stage.

**iCE40UP5K**
The FPGA is intended to recover timing, decode the stream, and deliver recovered bytes to the USB interface. Programming done via SPI to external flash.
<!-- /pcb -->

## Mechanical layout

The mechanical assembly brings the Raspberry Pi, USB interface, transmitter, and receiver onto a shared sled. A common baseplate carries the board mounts, laser holder, and receiver optics above the 2040 rail.

These images were captured directly from the Fusion assembly on October 14, 2026. The close-ups show the receiver shroud and the laser mounting hardware. This is the current CAD layout; physical fit and optical alignment still need to be checked during assembly.

<figure>
  <a href="/images/laser/mechanical/sled-assembly-2400.webp" aria-label="View the laser sled CAD image at full size">
    <img src="/images/laser/mechanical/sled-assembly-1200.webp" srcset="/images/laser/mechanical/sled-assembly-1200.webp 1200w, /images/laser/mechanical/sled-assembly-2400.webp 2400w" sizes="(max-width: 1072px) calc(100vw - 32px), 1040px" width="2400" height="1800" loading="lazy" decoding="async" alt="Three-quarter Fusion CAD view of the laser sled, showing the Raspberry Pi, custom boards, laser holder, and black receiver shroud on a shared baseplate above an aluminum rail.">
  </a>
  <figcaption>Laser sled — the electronics and optical hardware on a common rail-mounted baseplate.</figcaption>
</figure>

<div class="photo-gallery">
  <figure>
    <a href="/images/laser/mechanical/receiver-shroud-1600.webp" aria-label="View the receiver shroud CAD close-up at full size">
      <img src="/images/laser/mechanical/receiver-shroud-960.webp" srcset="/images/laser/mechanical/receiver-shroud-960.webp 960w, /images/laser/mechanical/receiver-shroud-1600.webp 1600w" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1072px) calc((100vw - 56px) / 2), 508px" width="1600" height="1200" loading="lazy" decoding="async" alt="Fusion CAD close-up of the black receiver lens hood and shroud, its support feet, and the upright receiver board behind it.">
    </a>
    <figcaption>Receiver — lens hood, shroud, and support hardware in front of the upright RX-A board.</figcaption>
  </figure>
  <figure>
    <a href="/images/laser/mechanical/transmitter-mount-1600.webp" aria-label="View the laser mounting hardware CAD close-up at full size">
      <img src="/images/laser/mechanical/transmitter-mount-960.webp" srcset="/images/laser/mechanical/transmitter-mount-960.webp 960w, /images/laser/mechanical/transmitter-mount-1600.webp 1600w" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1072px) calc((100vw - 56px) / 2), 508px" width="1600" height="1200" loading="lazy" decoding="async" alt="Fusion CAD close-up of the red laser module in its upright holder, with the leveling platform, mounting hardware, and green TX-A board beside it.">
    </a>
    <figcaption>Transmitter — laser holder and leveling platform beside TX-A.</figcaption>
  </figure>
</div>

<!-- mechanical:laser-sled -->
### Explore the assembly

Rotate the sled to inspect the board carriers, receiver shroud, and laser mount. Select **Full rail** to see the complete assembly, or **Reset** to return to the sled. The STEP download contains the full assembly exported from Fusion.
<!-- /mechanical -->

## Bring-up

Notes on initial power-up, board testing, and the first optical link.

### Boards as received

The USB interface, TX-A, and RX-A boards before manual population of the remaining components. The paired views show each board alongside an unpopulated PCB. Select a photo for a closer look.

<div class="photo-gallery">
  <figure>
    <a href="/images/laser/pcb-arrival/usb-interface-pair.webp" aria-label="View larger photo of the USB interface boards">
      <img src="/images/laser/pcb-arrival/usb-interface-pair-960.webp" srcset="/images/laser/pcb-arrival/usb-interface-pair-960.webp 960w, /images/laser/pcb-arrival/usb-interface-pair.webp 2400w" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1072px) calc((100vw - 56px) / 2), 508px" width="2400" height="1800" loading="lazy" decoding="async" alt="Partially assembled USB interface beside an unpopulated PCB on a blue cutting mat.">
    </a>
    <figcaption>USB interface — assembled and bare boards.</figcaption>
  </figure>
  <figure>
    <a href="/images/laser/pcb-arrival/usb-interface-detail.webp" aria-label="View larger USB interface detail">
      <img src="/images/laser/pcb-arrival/usb-interface-detail-960.webp" srcset="/images/laser/pcb-arrival/usb-interface-detail-960.webp 960w, /images/laser/pcb-arrival/usb-interface-detail.webp 2400w" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1072px) calc((100vw - 56px) / 2), 508px" width="2400" height="1800" loading="lazy" decoding="async" alt="Close view of the USB interface showing the STM32F723, two USB-C sockets, and board connector.">
    </a>
    <figcaption>USB interface — STM32F723 and connectors, with the remaining footprints still empty.</figcaption>
  </figure>
  <figure>
    <a href="/images/laser/pcb-arrival/tx-a-pair.webp" aria-label="View larger photo of the TX-A boards">
      <img src="/images/laser/pcb-arrival/tx-a-pair-960.webp" srcset="/images/laser/pcb-arrival/tx-a-pair-960.webp 960w, /images/laser/pcb-arrival/tx-a-pair.webp 2400w" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1072px) calc((100vw - 56px) / 2), 508px" width="2400" height="1800" loading="lazy" decoding="async" alt="Partially assembled TX-A transmitter beside an unpopulated transmitter PCB.">
    </a>
    <figcaption>TX-A — transmitter boards as received.</figcaption>
  </figure>
  <figure>
    <a href="/images/laser/pcb-arrival/tx-a-detail.webp" aria-label="View larger TX-A detail">
      <img src="/images/laser/pcb-arrival/tx-a-detail-960.webp" srcset="/images/laser/pcb-arrival/tx-a-detail-960.webp 960w, /images/laser/pcb-arrival/tx-a-detail.webp 2400w" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1072px) calc((100vw - 56px) / 2), 508px" width="2400" height="1800" loading="lazy" decoding="async" alt="Top view of TX-A with fitted surface-mount components and empty through-hole footprints.">
    </a>
    <figcaption>TX-A — component side before the remaining parts are hand-soldered.</figcaption>
  </figure>
  <figure>
    <a href="/images/laser/pcb-arrival/rx-a-pair.webp" aria-label="View larger photo of the RX-A boards">
      <img src="/images/laser/pcb-arrival/rx-a-pair-960.webp" srcset="/images/laser/pcb-arrival/rx-a-pair-960.webp 960w, /images/laser/pcb-arrival/rx-a-pair.webp 2400w" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1072px) calc((100vw - 56px) / 2), 508px" width="2400" height="1800" loading="lazy" decoding="async" alt="Partially assembled RX-A receiver beside an unpopulated receiver PCB.">
    </a>
    <figcaption>RX-A — receiver boards as received.</figcaption>
  </figure>
  <figure>
    <a href="/images/laser/pcb-arrival/rx-a-detail.webp" aria-label="View larger RX-A detail">
      <img src="/images/laser/pcb-arrival/rx-a-detail-960.webp" srcset="/images/laser/pcb-arrival/rx-a-detail-960.webp 960w, /images/laser/pcb-arrival/rx-a-detail.webp 2400w" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1072px) calc((100vw - 56px) / 2), 508px" width="2400" height="1800" loading="lazy" decoding="async" alt="Top view of RX-A showing the receiver circuitry, FPGA, and board connector.">
    </a>
    <figcaption>RX-A — analog front end and FPGA, before manual assembly is complete.</figcaption>
  </figure>
</div>

### Power and first firmware

All power rails check out, and a simple test program has been flashed to the STM32F723. The clock and GPIO/control signals have also been verified.

<figure class="photo-portrait">
  <a href="/images/laser/bring-up/stm32-first-program-full.webp" aria-label="View the full-resolution STM32 bring-up photo">
    <img src="/images/laser/bring-up/stm32-first-program-1080.webp" srcset="/images/laser/bring-up/stm32-first-program-1080.webp 1080w, /images/laser/bring-up/stm32-first-program-2160.webp 2160w" sizes="(max-width: 592px) calc(100vw - 32px), 560px" width="4284" height="5712" loading="lazy" decoding="async" alt="The custom USB interface board on a sunlit desk beside a laptop, with a USB-C cable and programming leads connected to the STM32F723 board.">
  </a>
  <figcaption>USB interface during initial programming. Select the photo for the full-resolution image.</figcaption>
</figure>

### USB enumeration on macOS

**October 28, 2026.** The STM32F723 on PHY-A now enumerates over USB on the Mac as **STM32 Virtual ComPort**. macOS creates a CDC serial port at `/dev/cu.usbmodem3784356930311`. The board appears as its own USB device alongside the ST-Link programmer.

<figure>
  <a href="/images/laser/bring-up/stm32-usb-macos-full.webp" aria-label="View the full-resolution STM32 USB enumeration screenshot">
    <img src="/images/laser/bring-up/stm32-usb-macos-1200.webp" srcset="/images/laser/bring-up/stm32-usb-macos-1200.webp 1200w, /images/laser/bring-up/stm32-usb-macos-full.webp 2264w" sizes="(max-width: 1072px) calc(100vw - 32px), 1040px" width="2264" height="1010" loading="lazy" decoding="async" alt="macOS terminal showing STM32 Virtual ComPort and STM32 STLink as separate USB devices, followed by three serial-port listings in which the STM32 usbmodem port is present, absent, and present again.">
  </a>
  <figcaption>First USB enumeration on the Mac. The serial-port listings show the STM32 port disappearing and reappearing.</figcaption>
</figure>

A separate live check of the Mac's USB and serial registries confirmed the device was active and configured:

| Check | Observed result |
| --- | --- |
| USB product | STM32 Virtual ComPort |
| Manufacturer | STMicroelectronics |
| Vendor / product ID | `0483:5740` |
| USB configuration | 1 (configured) |
| Serial port | `/dev/cu.usbmodem3784356930311` |
| Reported USB link speed | 480 Mb/s (high speed) |

The [captured USB and serial registry output](/evidence/laser/stm32-usb-macos-2026-10-28.txt) records the independent enumeration check. The 480 Mb/s figure is the reported bus speed, not measured application throughput.

### First USB echo

**October 28, 2026.** With a CDC echo handler added to the firmware, the first text exchange works: `Hello PHY-A!` is sent from the Mac and echoed back by the STM32 over USB. The terminal session uses `screen /dev/cu.usbmodem3784356930311 115200`.

<figure>
  <a href="/images/laser/bring-up/stm32-usb-echo-macos.webp" aria-label="View the full-resolution first USB echo screenshot">
    <img src="/images/laser/bring-up/stm32-usb-echo-macos.webp" width="1010" height="778" loading="lazy" decoding="async" alt="Mac terminal running screen on the STM32 USB serial port and displaying Hello PHY-A!, with the CDC receive handler and its echo buffer visible behind the terminal.">
  </a>
  <figcaption>First USB echo — “Hello PHY-A!” returned in the Mac's serial terminal, with the firmware echo handler visible behind it.</figcaption>
</figure>

The receive callback copies incoming bytes into a 512-byte buffer and sends them back with `CDC_Transmit_HS`, then rearms reception. This demonstrates a short host-to-board-to-host text exchange. Sustained throughput and Raspberry Pi host testing are still to come.

<figure>
  <a href="/images/laser/bring-up/stm32-usb-echo-macos.webp" aria-label="View the full-resolution first USB echo screenshot">
    <img src="/images/laser/bring-up/stm32-usb-echo-macos.webp" width="1010" height="778" loading="lazy" decoding="async" alt="Mac terminal running screen on the STM32 USB serial port and displaying Hello PHY-A!, with the CDC receive handler and its echo buffer visible behind the terminal.">
  </a>
  <figcaption>First USB echo — “Hello PHY-A!” returned in the Mac's serial terminal, with the firmware echo handler visible behind it.</figcaption>
</figure>

### 256 byte send-receive test

**October 29, 2026.** With [test/usb-speed/main.py](https://github.com/grsszne/Laser-Software/tree/main/test/usb-speed/main.py). `bytes(range(256))` is sent to the MCU over USB, which is then sent back to the host to verify integrity.


### TX-A / 8 V rail

The TPS61085 boosts the incoming 5 V supply to the nominal 8 V laser-driver rail on TX-A. This rail requires two arming conditions: the physical jumper must be fitted, and the PHY board (PHY-A) must assert its digital arm signal.

The first oscilloscope check shows a beautifully flat trace: **7.969 V average, with 32 mV peak-to-peak variation** in this capture—about 0.40% of the measured rail voltage. The photo below records the steady-state rail, with the measurements transcribed underneath.

<figure>
  <a href="/images/laser/bring-up/tx-a-8v-rail-2400.webp" target="_new" aria-label="View the TX-A 8 V rail oscilloscope photo at full size">
    <img src="/images/laser/bring-up/tx-a-8v-rail-1200.webp" srcset="/images/laser/bring-up/tx-a-8v-rail-1200.webp 1200w, /images/laser/bring-up/tx-a-8v-rail-2400.webp 2400w" sizes="(max-width: 1072px) calc(100vw - 32px), 1040px" width="2400" height="1800" loading="lazy" decoding="async" alt="Hantek DSO2D15 oscilloscope measuring the TX-A TPS61085 supply rail, with a flat yellow trace and a displayed average of 796.9 mV and peak-to-peak variation of 3.2 mV.">
  </a>
  <figcaption>TX-A power bring-up — TPS61085 rail on channel 1</figcaption>
</figure>

| Measurement | Scope display | Rail voltage (x10) |
| --- | ---: | ---: |
| Average voltage | 796.9 mV | 7.969 V |
| Minimum voltage | 795.2 mV | 7.952 V |
| Maximum voltage | 798.4 mV | 7.984 V |
| Peak-to-peak variation | 3.2 mV | 32 mV |
| RMS voltage, including DC | 796.9 mV | 7.969 V |
| Mid-level voltage | 796.8 mV | 7.968 V |

**Probe scaling:** the probe was set to 10× while the scope channel was set to 1x, so voltage readouts are multiplied by ten in the rail-voltage column. Channel 1 is DC-coupled at a displayed 20 mV/div (200 mV/div at the rail), with a 1 us/div timebase and 250 MSa/s acquisition over a 4K-point record. The RMS reading includes the DC level; it is not an RMS ripple measurement.

The [TPS61085 documentation from Texas Instruments](https://www.ti.com/product/TPS61085) is the boost convert used (5V to 8V). But arming is not done with the 61085's `en` pin, but rather, an upstream TPS22919DCKR that modulates the clean incoming 5V rail from a digital signal from PHY. (The armed 5V line is also controlled by this same digital signal for many peripherals)

<!-- Edit progress here: [ ] incomplete, [x] complete. The website displays these values read-only. -->
<!-- checklist:bring-up -->
#### 1. PCB arrival

- [x] Photo of boards as received
- [x] Note assembly quality / any visible issues
- [x] Mention what was assembled by JLC vs hand-soldered
- [x] Record any immediate rework or bodges
- [x] Check for inadvertent ground / power shorts

#### 2. Power bring-up

- [x] Verify each major rail
- [x] Record measured voltages
- [x] Note idle current draw
- [x] Capture one clean photo of powered board
- [x] Record any unexpected heating/current issue
- [x] Briefly explain how faults were isolated, if any

#### 3. PHY / controller bring-up

- [x] MCU successfully detected/programmed
- [x] Clock verified
- [x] GPIO/control signals verified
- [x] USB CDC enumeration on Mac verified
- [x] First USB text echo between Mac and STM32
- [ ] USB communication with Pi working
- [x] Screenshot/log of first successful host communication
- [ ] Note any firmware/debugging issue worth discussing

#### 4. Transmitter validation

- [x] Verify arm/enable behavior
- [ ] Verify digital logic path
- [ ] Measure driver/control waveform <!-- explore:tx -->
- [ ] Capture oscilloscope screenshot
- [ ] Verify laser static output
- [ ] Verify modulated optical output
- [ ] Record rise/fall behavior if meaningful
- [ ] Note difference between simulation and measured behavior

#### 5. Receiver validation

- [ ] Record TIA idle output
- [ ] Record post-amplifier output
- [ ] Verify photodiode responds to optical input
- [ ] Capture TIA waveform under modulation <!-- explore:rx -->
- [ ] Capture final digital RX waveform
- [ ] Record signal amplitude/noise at a known distance
- [ ] Document any threshold/baseline tuning

#### 6. Clock/data recovery

- [ ] Verify oscillator frequency
- [ ] Confirm CDR locks <!-- explore:cdr -->
- [ ] Capture recovered clock
- [ ] Capture recovered data
- [ ] Test simple `1010...` pattern
- [ ] Test PRBS / realistic encoded stream
- [ ] Document where lock begins failing, if applicable

#### 7. First full optical link

- [ ] Photo of TX/RX bench setup
- [ ] Record distance
- [ ] Record data rate
- [ ] Record alignment setup
- [ ] Capture first successfully received packet
- [ ] Save terminal/log output
- [ ] Write 2–3 sentences on what had to work simultaneously for this milestone

#### 8. Performance testing

- [ ] Test several data rates
- [ ] Record BER at each rate
- [ ] Record distance for each major test
- [ ] Record received signal quality
- [ ] Create BER vs data-rate chart
- [ ] Create throughput vs distance chart if useful
- [ ] Identify maximum stable rate
- [ ] Define what “stable” means quantitatively

#### 9. Pi-to-Pi demo

- [ ] Successful payload sent from Pi A → Pi B
- [ ] Successful reverse direction
- [ ] Bidirectional operation
- [ ] Large file transfer
- [ ] Hash comparison showing integrity
- [ ] Real measured payload throughput
- [ ] Short video/GIF of the working system

#### 10. Outdoor / long-range test

- [ ] Photo of both endpoints
- [ ] Exact or approximate test distance
- [ ] Alignment procedure
- [ ] Data rate achieved
- [ ] BER / packet-loss result
- [ ] Ambient-light conditions
- [ ] Stability over time
- [ ] Note practical issues: vibration, pointing, weather, mounting, etc.

#### 11. Failure / debugging story

Likely failure section to be added soon.

- [ ] What failed?
- [ ] What measurement first exposed it?
- [ ] What were the plausible causes?
- [ ] How was the problem isolated?
- [ ] What was changed?
- [ ] What did the measurement look like afterward?
- [ ] What would change on Rev B?

#### 12. Final results summary

Important deliverables

- [ ] Maximum demonstrated raw line rate
- [ ] Maximum payload throughput
- [ ] Longest demonstrated distance
- [ ] BER at headline operating point
- [ ] Optical wavelength
- [ ] Number of custom PCBs
- [ ] Key ICs / architecture
- [ ] Power consumption if interesting
- [ ] Link directionality
- [ ] Final system photo
<!-- /checklist -->
