#pragma once

#include <cstddef>
#include <cstdint>

namespace mcard_v1 {

enum class ParseStatus {
  OK,
  TOO_SHORT,
  TOO_LARGE,
  INVALID_FRAGMENT,
  PAYLOAD_LENGTH_MISMATCH,
  DATA_LENGTH_MISMATCH,
  UNSUPPORTED_CATEGORY
};

struct FrameView {
  uint8_t category = 0;
  uint8_t fragmentState = 0;
  uint16_t command = 0;
  const uint8_t* data = nullptr;
  size_t dataLength = 0;
};

ParseStatus parseFrame(
    const uint8_t* bytes,
    size_t length,
    FrameView& frame);

const char* parseStatusName(ParseStatus status);

size_t buildDeterministicResponse(
    const FrameView& request,
    uint8_t* out,
    size_t capacity);

}  // namespace mcard_v1
