#include "mcard_v1_protocol.h"

#include <cstring>

#include "mcard_v1_profile.h"

namespace mcard_v1 {
namespace {

uint16_t readU16Le(const uint8_t* bytes) {
  return static_cast<uint16_t>(bytes[0]) |
         (static_cast<uint16_t>(bytes[1]) << 8);
}

uint32_t readU32Le(const uint8_t* bytes) {
  return static_cast<uint32_t>(bytes[0]) |
         (static_cast<uint32_t>(bytes[1]) << 8) |
         (static_cast<uint32_t>(bytes[2]) << 16) |
         (static_cast<uint32_t>(bytes[3]) << 24);
}

class Writer {
 public:
  Writer(uint8_t* out, size_t capacity) : out_(out), capacity_(capacity) {}

  bool appendU8(uint8_t value) {
    if (length_ + 1 > capacity_) return false;
    out_[length_++] = value;
    return true;
  }

  bool appendU16(uint16_t value) {
    return appendU8(static_cast<uint8_t>(value & 0xff)) &&
           appendU8(static_cast<uint8_t>((value >> 8) & 0xff));
  }

  bool appendU32(uint32_t value) {
    return appendU8(static_cast<uint8_t>(value & 0xff)) &&
           appendU8(static_cast<uint8_t>((value >> 8) & 0xff)) &&
           appendU8(static_cast<uint8_t>((value >> 16) & 0xff)) &&
           appendU8(static_cast<uint8_t>((value >> 24) & 0xff));
  }

  bool appendBytes(const uint8_t* bytes, size_t length) {
    if (length_ + length > capacity_) return false;
    if (length > 0) {
      memcpy(out_ + length_, bytes, length);
      length_ += length;
    }
    return true;
  }

  size_t length() const {
    return length_;
  }

 private:
  uint8_t* out_;
  size_t capacity_;
  size_t length_ = 0;
};

size_t makeControlResponse(
    uint16_t command,
    const uint8_t* data,
    size_t dataLength,
    uint8_t* out,
    size_t capacity) {
  Writer writer(out, capacity);
  if (!writer.appendU8(profile::CATEGORY_CONTROL) ||
      !writer.appendU8(profile::FRAGMENT_COMPLETE) ||
      !writer.appendU16(static_cast<uint16_t>(2 + dataLength)) ||
      !writer.appendU16(command) ||
      !writer.appendBytes(data, dataLength)) {
    return 0;
  }
  return writer.length();
}

size_t makeLengthPrefixedResponse(
    uint8_t category,
    uint16_t command,
    const uint8_t* data,
    size_t dataLength,
    uint8_t* out,
    size_t capacity) {
  Writer writer(out, capacity);
  if (!writer.appendU8(category) ||
      !writer.appendU8(profile::FRAGMENT_COMPLETE) ||
      !writer.appendU16(static_cast<uint16_t>(4 + dataLength)) ||
      !writer.appendU16(command) ||
      !writer.appendU16(static_cast<uint16_t>(dataLength)) ||
      !writer.appendBytes(data, dataLength)) {
    return 0;
  }
  return writer.length();
}

uint16_t mapFileResponse(uint16_t command) {
  switch (command) {
    case profile::FILE_START_REQUEST:
      return profile::FILE_START_RESPONSE;
    case profile::FILE_SEND_START_REQUEST:
      return profile::FILE_SEND_START_RESPONSE;
    case profile::FILE_SEND_END_REQUEST:
      return profile::FILE_SEND_END_RESPONSE;
    case profile::FILE_DATA_REQUEST:
      return profile::FILE_DATA_RESPONSE;
    case profile::FILE_LOSE_CHECK_REQUEST:
      return profile::FILE_LOSE_CHECK_RESPONSE;
    case profile::FILE_INFO_REQUEST:
      return profile::FILE_INFO_RESPONSE;
    default:
      return 0xffff;
  }
}

uint16_t mapOtaPlanningResponse(uint16_t command) {
  switch (command) {
    case profile::OTA_START_REQUEST:
      return profile::OTA_START_RESPONSE;
    case profile::OTA_DATA_REQUEST:
      return profile::OTA_DATA_RESPONSE;
    case profile::OTA_END_REQUEST:
      return profile::OTA_END_RESPONSE;
    default:
      return 0xffff;
  }
}

bool responseIncludesPacketIndex(uint8_t category, uint16_t responseCommand) {
  return (
      category == profile::CATEGORY_FILE &&
      responseCommand == profile::FILE_DATA_RESPONSE) || (
      category == profile::CATEGORY_OTA &&
      responseCommand == profile::OTA_DATA_RESPONSE);
}

}  // namespace

ParseStatus parseFrame(
    const uint8_t* bytes,
    size_t length,
    FrameView& frame) {
  if (bytes == nullptr || length < 6) return ParseStatus::TOO_SHORT;
  if (length > profile::MAX_FRAME_BYTES) return ParseStatus::TOO_LARGE;

  frame.category = bytes[0];
  frame.fragmentState = bytes[1];
  if (frame.fragmentState > profile::FRAGMENT_LAST) {
    return ParseStatus::INVALID_FRAGMENT;
  }

  const uint16_t payloadLength = readU16Le(bytes + 2);
  if (payloadLength != length - 4) {
    return ParseStatus::PAYLOAD_LENGTH_MISMATCH;
  }

  frame.command = readU16Le(bytes + 4);
  frame.data = bytes + 6;
  frame.dataLength = payloadLength - 2;

  if (frame.category == profile::CATEGORY_CONTROL) {
    return ParseStatus::OK;
  }

  if (frame.category != profile::CATEGORY_FILE &&
      frame.category != profile::CATEGORY_OTA) {
    return ParseStatus::UNSUPPORTED_CATEGORY;
  }

  if (payloadLength < 4) return ParseStatus::TOO_SHORT;
  const uint16_t dataLength = readU16Le(bytes + 6);
  if (payloadLength != static_cast<uint16_t>(4 + dataLength)) {
    return ParseStatus::DATA_LENGTH_MISMATCH;
  }
  frame.data = bytes + 8;
  frame.dataLength = dataLength;
  return ParseStatus::OK;
}

const char* parseStatusName(ParseStatus status) {
  switch (status) {
    case ParseStatus::OK:
      return "ok";
    case ParseStatus::TOO_SHORT:
      return "frame too short";
    case ParseStatus::TOO_LARGE:
      return "frame too large";
    case ParseStatus::INVALID_FRAGMENT:
      return "invalid fragment state";
    case ParseStatus::PAYLOAD_LENGTH_MISMATCH:
      return "payload length mismatch";
    case ParseStatus::DATA_LENGTH_MISMATCH:
      return "data length mismatch";
    case ParseStatus::UNSUPPORTED_CATEGORY:
      return "unsupported category";
  }
  return "unknown parse status";
}

size_t buildDeterministicResponse(
    const FrameView& request,
    uint8_t* out,
    size_t capacity) {
  if (request.category == profile::CATEGORY_CONTROL) {
    switch (request.command) {
      case profile::CONTROL_PING:
        return makeControlResponse(
            profile::CONTROL_PONG,
            reinterpret_cast<const uint8_t*>(profile::SAMPLE_PONG),
            strlen(profile::SAMPLE_PONG),
            out,
            capacity);
      case profile::CONTROL_GET_SERIAL:
        return makeControlResponse(
            profile::CONTROL_SERIAL_RESPONSE,
            reinterpret_cast<const uint8_t*>(profile::SAMPLE_SERIAL),
            strlen(profile::SAMPLE_SERIAL),
            out,
            capacity);
      case profile::CONTROL_GET_VERSION:
        return makeControlResponse(
            profile::CONTROL_VERSION_RESPONSE,
            reinterpret_cast<const uint8_t*>(profile::SAMPLE_VERSION),
            strlen(profile::SAMPLE_VERSION),
            out,
            capacity);
      case profile::CONTROL_GET_BATTERY: {
        uint8_t data[2] = {
            static_cast<uint8_t>(profile::SAMPLE_BATTERY_PERCENT & 0xff),
            static_cast<uint8_t>(
                (profile::SAMPLE_BATTERY_PERCENT >> 8) & 0xff)};
        return makeControlResponse(
            profile::CONTROL_BATTERY_RESPONSE,
            data,
            sizeof(data),
            out,
            capacity);
      }
      case profile::CONTROL_GET_FS_INFO: {
        uint8_t data[12] = {};
        Writer writer(data, sizeof(data));
        writer.appendU32(profile::SAMPLE_FS_BLOCK_SIZE);
        writer.appendU32(profile::SAMPLE_FS_TOTAL_BLOCKS);
        writer.appendU32(profile::SAMPLE_FS_FREE_BLOCKS);
        return makeControlResponse(
            profile::CONTROL_FS_INFO_RESPONSE,
            data,
            writer.length(),
            out,
            capacity);
      }
      default:
        return 0;
    }
  }

  const uint16_t responseCommand =
      request.category == profile::CATEGORY_FILE
      ? mapFileResponse(request.command)
      : mapOtaPlanningResponse(request.command);
  if (responseCommand == 0xffff) return 0;

  uint8_t data[6] = {};
  Writer writer(data, sizeof(data));
  writer.appendU16(profile::STATUS_OK);
  if (responseIncludesPacketIndex(request.category, responseCommand)) {
    const uint32_t packetIndex = request.dataLength >= 4
        ? readU32Le(request.data)
        : profile::DEFAULT_PACKET_INDEX;
    writer.appendU32(packetIndex);
  }
  return makeLengthPrefixedResponse(
      request.category,
      responseCommand,
      data,
      writer.length(),
      out,
      capacity);
}

}  // namespace mcard_v1
