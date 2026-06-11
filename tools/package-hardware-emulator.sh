#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "usage: $0 <esp32|nrf52> <version> <output-directory>" >&2
  exit 2
fi

board="$1"
version="${2//\//-}"
output_dir="$3"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "${board}" in
  esp32)
    project_dir="${root}/examples/esp32-ble-peripheral"
    environment="esp32dev"
    ;;
  nrf52)
    project_dir="${root}/examples/nrf52-ble-peripheral"
    environment="nrf52840_dk_adafruit"
    ;;
  *)
    echo "unsupported board: ${board}" >&2
    exit 2
    ;;
esac

package_name="mcardkit-emu-${board}-${version}"
package_dir="${output_dir}/${package_name}"
build_dir="${project_dir}/.pio/build/${environment}"

rm -rf "${package_dir}" "${output_dir}/${package_name}.zip"
mkdir -p "${package_dir}/binary" "${package_dir}/source/include"

cp "${project_dir}/README.md" "${package_dir}/README.md"
cp "${project_dir}/platformio.ini" "${package_dir}/source/platformio.ini"
cp "${project_dir}/include/mcard_profile.h" "${package_dir}/source/include/mcard_profile.h"
cp "${project_dir}/src/main.cpp" "${package_dir}/source/main.cpp"

if [[ "${board}" == "esp32" ]]; then
  platformio_core_dir="${PLATFORMIO_CORE_DIR:-${HOME}/.platformio}"
  boot_app0="${platformio_core_dir}/packages/framework-arduinoespressif32/tools/partitions/boot_app0.bin"

  cp "${build_dir}/bootloader.bin" "${package_dir}/binary/"
  cp "${build_dir}/partitions.bin" "${package_dir}/binary/"
  cp "${boot_app0}" "${package_dir}/binary/"
  cp "${build_dir}/firmware.bin" "${package_dir}/binary/"

  cat > "${package_dir}/FLASHING.txt" <<'EOF'
Public-safe MCard-StarterKit ESP32 BLE emulator build.

Preferred upload method:
  platformio run -d examples/esp32-ble-peripheral -t upload

Raw ESP32 image offsets for the included files:
  0x1000  bootloader.bin
  0x8000  partitions.bin
  0xe000  boot_app0.bin
  0x10000 firmware.bin

Verify the connected board and flash layout before writing.
This package is unofficial emulator firmware for the sample board,
not vendor firmware and not an updater for another device.
EOF
else
  cp "${build_dir}/firmware.bin" "${package_dir}/binary/"
  if [[ -f "${build_dir}/firmware_signature.bin" ]]; then
    cp "${build_dir}/firmware_signature.bin" "${package_dir}/binary/"
  fi

  cat > "${package_dir}/FLASHING.txt" <<'EOF'
Public-safe MCard-StarterKit nRF52840 DK BLE emulator build.

Preferred upload method:
  platformio run -d examples/nrf52-ble-peripheral -t upload

The project uses the nrf52840_dk_adafruit PlatformIO board target.
Verify the connected board and debugger before writing.
This package is unofficial emulator firmware for the sample board,
not vendor firmware and not an updater for another device.
EOF
fi

(
  cd "${package_dir}"
  find . -type f ! -name SHA256SUMS -print0 \
    | sort -z \
    | xargs -0 sha256sum > SHA256SUMS
)

mkdir -p "${output_dir}"
(
  cd "${output_dir}"
  zip -q -r "${package_name}.zip" "${package_name}"
)

echo "${output_dir}/${package_name}.zip"
