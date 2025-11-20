"""
Z-Machine file parser module

Handles parsing of Z-machine story files according to the
Z-Machine Standards Document v1.1
"""

import struct
from typing import Dict, Any, Tuple, List, Optional
from dataclasses import dataclass


@dataclass
class ZHeader:
    """Z-Machine header structure"""
    version: int
    flags1: int
    release: int
    high_memory: int
    initial_pc: int
    dictionary: int
    object_table: int
    globals: int
    static_memory: int
    flags2: int
    serial: str
    abbreviations: int
    file_length: int
    checksum: int
    interpreter_number: int = 0
    interpreter_version: int = 0
    screen_lines: int = 24
    screen_columns: int = 80
    screen_width: int = 0
    screen_height: int = 0
    font_width: int = 1
    font_height: int = 1
    routines_offset: int = 0
    strings_offset: int = 0
    default_background: int = 2  # Black
    default_foreground: int = 9  # White
    terminating_chars: int = 0
    output_stream3_width: int = 0
    standard_revision: int = 0
    alphabet_table: int = 0
    header_extension: int = 0


@dataclass
class ZObject:
    """Z-Machine object structure"""
    number: int
    attributes: int
    parent: int
    sibling: int
    child: int
    properties: int


class ZParser:
    """Parser for Z-Machine story files"""

    # Z-String alphabet tables
    A0 = " \n0123456789.,!?_#\\'\"/-:()"
    A1 = "abcdefghijklmnopqrstuvwxyz"
    A2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    def __init__(self, data: bytes):
        self.data = data
        self.memory = bytearray(data)
        self.header = self._parse_header()

    def _parse_header(self) -> ZHeader:
        """Parse the 64-byte header"""
        header = ZHeader(
            version=self.data[0],
            flags1=self.data[1],
            release=struct.unpack('>H', self.data[2:4])[0],
            high_memory=struct.unpack('>H', self.data[4:6])[0],
            initial_pc=struct.unpack('>H', self.data[6:8])[0],
            dictionary=struct.unpack('>H', self.data[8:10])[0],
            object_table=struct.unpack('>H', self.data[10:12])[0],
            globals=struct.unpack('>H', self.data[12:14])[0],
            static_memory=struct.unpack('>H', self.data[14:16])[0],
            flags2=struct.unpack('>H', self.data[16:18])[0],
            serial=self.data[18:24].decode('ascii', errors='ignore'),
            abbreviations=0,
            file_length=struct.unpack('>H', self.data[26:28])[0],
            checksum=struct.unpack('>H', self.data[28:30])[0]
        )

        # Version-specific fields
        if header.version >= 2:
            header.abbreviations = struct.unpack('>H', self.data[24:26])[0]

        if header.version >= 3:
            # File length calculation
            if header.version <= 3:
                header.file_length *= 2
            elif header.version <= 5:
                header.file_length *= 4
            else:
                header.file_length *= 8

        if header.version >= 4:
            header.interpreter_number = self.data[0x1E]
            header.interpreter_version = self.data[0x1F]
            header.screen_lines = self.data[0x20] or 24
            header.screen_columns = self.data[0x21] or 80

        if header.version >= 5:
            header.screen_width = struct.unpack('>H', self.data[0x22:0x24])[0]
            header.screen_height = struct.unpack('>H', self.data[0x24:0x26])[0]
            header.font_width = self.data[0x26] or 1
            header.font_height = self.data[0x27] or 1
            header.default_background = self.data[0x2C]
            header.default_foreground = self.data[0x2D]
            header.terminating_chars = struct.unpack('>H', self.data[0x2E:0x30])[0]
            header.standard_revision = struct.unpack('>H', self.data[0x32:0x34])[0]

        if header.version >= 6:
            header.routines_offset = struct.unpack('>H', self.data[0x28:0x2A])[0] * 8
            header.strings_offset = struct.unpack('>H', self.data[0x2A:0x2C])[0] * 8
            header.output_stream3_width = struct.unpack('>H', self.data[0x30:0x32])[0]

        return header

    def unpack_address(self, packed_addr: int) -> int:
        """Convert packed address to byte address"""
        if self.header.version <= 3:
            return packed_addr * 2
        elif self.header.version <= 5:
            return packed_addr * 4
        elif self.header.version == 6 or self.header.version == 7:
            # TODO: Handle routine/string offsets for V6/7
            return packed_addr * 4 + self.header.routines_offset
        else:  # V8
            return packed_addr * 8

    def read_byte(self, addr: int) -> int:
        """Read a byte from memory"""
        return self.memory[addr]

    def read_word(self, addr: int) -> int:
        """Read a 16-bit word (big-endian)"""
        return (self.memory[addr] << 8) | self.memory[addr + 1]

    def write_byte(self, addr: int, value: int) -> None:
        """Write a byte to dynamic memory"""
        if addr < self.header.static_memory:
            self.memory[addr] = value & 0xFF

    def write_word(self, addr: int, value: int) -> None:
        """Write a 16-bit word to dynamic memory"""
        if addr < self.header.static_memory:
            self.memory[addr] = (value >> 8) & 0xFF
            self.memory[addr + 1] = value & 0xFF

    def decode_zstring(self, addr: int) -> Tuple[str, int]:
        """Decode a Z-string at given address, return (string, next_address)"""
        result = []
        alphabet = 0
        abbreviation_mode = False
        current_addr = addr

        while True:
            word = self.read_word(current_addr)
            current_addr += 2

            # Extract three 5-bit characters
            chars = [
                (word >> 10) & 0x1F,
                (word >> 5) & 0x1F,
                word & 0x1F
            ]

            for char_code in chars:
                if abbreviation_mode:
                    # Handle abbreviation
                    if self.header.version >= 2 and self.header.abbreviations:
                        abbr_addr = self.header.abbreviations + 2 * (32 * (alphabet - 1) + char_code)
                        abbr_word_addr = self.read_word(abbr_addr)
                        abbr_str, _ = self.decode_zstring(abbr_word_addr * 2)
                        result.append(abbr_str)
                    abbreviation_mode = False
                    alphabet = 0
                elif char_code == 0:
                    result.append(' ')
                elif char_code == 1:
                    # Abbreviation in V2+
                    if self.header.version >= 2:
                        abbreviation_mode = True
                        alphabet = 1
                elif char_code == 2:
                    # Abbreviation in V2+
                    if self.header.version >= 2:
                        abbreviation_mode = True
                        alphabet = 2
                    elif self.header.version == 1:
                        # Shift up
                        alphabet = (alphabet + 1) % 3
                elif char_code == 3:
                    # Abbreviation in V2+
                    if self.header.version >= 2:
                        abbreviation_mode = True
                        alphabet = 3
                    elif self.header.version == 1:
                        # Shift down
                        alphabet = (alphabet + 2) % 3
                elif char_code == 4:
                    # Shift up (V1) or temporary shift (V2+)
                    if self.header.version == 1:
                        alphabet = (alphabet + 1) % 3
                    else:
                        alphabet = 1
                elif char_code == 5:
                    # Shift down (V1) or temporary shift (V2+)
                    if self.header.version == 1:
                        alphabet = (alphabet + 2) % 3
                    else:
                        alphabet = 2
                elif char_code == 6 and alphabet == 2:
                    # Literal character follows
                    # Read next two characters as 10-bit ASCII
                    # This is complex, simplified for now
                    pass
                else:
                    # Regular character
                    if alphabet == 0:
                        if 6 <= char_code <= 31:
                            result.append(self.A1[char_code - 6])
                    elif alphabet == 1:
                        if 6 <= char_code <= 31:
                            result.append(self.A2[char_code - 6])
                    elif alphabet == 2:
                        if 7 <= char_code <= 31:
                            idx = char_code - 7
                            if idx < len(self.A0):
                                result.append(self.A0[idx])

                # Reset alphabet after each character in V2+
                if self.header.version >= 2 and not abbreviation_mode:
                    alphabet = 0

            # Check if this is the last word (bit 15 set)
            if word & 0x8000:
                break

        return ''.join(result), current_addr

    def get_object(self, obj_num: int) -> Optional[ZObject]:
        """Get an object by number"""
        if obj_num == 0:
            return None

        obj_addr = self._get_object_address(obj_num)
        if not obj_addr:
            return None

        if self.header.version <= 3:
            # 9-byte object in V1-3
            attributes = struct.unpack('>I', self.data[obj_addr:obj_addr+4])[0]
            parent = self.data[obj_addr + 4]
            sibling = self.data[obj_addr + 5]
            child = self.data[obj_addr + 6]
            properties = struct.unpack('>H', self.data[obj_addr+7:obj_addr+9])[0]
        else:
            # 14-byte object in V4+
            attributes = (struct.unpack('>H', self.data[obj_addr:obj_addr+2])[0] << 32) | \
                        struct.unpack('>I', self.data[obj_addr+2:obj_addr+6])[0]
            parent = struct.unpack('>H', self.data[obj_addr+6:obj_addr+8])[0]
            sibling = struct.unpack('>H', self.data[obj_addr+8:obj_addr+10])[0]
            child = struct.unpack('>H', self.data[obj_addr+10:obj_addr+12])[0]
            properties = struct.unpack('>H', self.data[obj_addr+12:obj_addr+14])[0]

        return ZObject(
            number=obj_num,
            attributes=attributes,
            parent=parent,
            sibling=sibling,
            child=child,
            properties=properties
        )

    def _get_object_address(self, obj_num: int) -> Optional[int]:
        """Get the memory address of an object"""
        if obj_num == 0:
            return None

        # Calculate object tree base
        if self.header.version <= 3:
            # 31 property defaults (62 bytes) then object tree
            tree_base = self.header.object_table + 62
            obj_size = 9
            max_objects = 255
        else:
            # 63 property defaults (126 bytes) then object tree
            tree_base = self.header.object_table + 126
            obj_size = 14
            max_objects = 65535

        if obj_num > max_objects:
            return None

        return tree_base + (obj_num - 1) * obj_size

    def get_object_name(self, obj_num: int) -> str:
        """Get the short name of an object"""
        obj = self.get_object(obj_num)
        if not obj:
            return ""

        # Properties address points to property header
        prop_addr = obj.properties

        # First byte is text-length of short name
        text_length = self.read_byte(prop_addr)
        prop_addr += 1

        if text_length == 0:
            return ""

        # The short name follows as Z-encoded text
        name, _ = self.decode_zstring(prop_addr)
        return name

    def get_dictionary_words(self) -> List[str]:
        """Get all words from the dictionary"""
        words = []
        dict_addr = self.header.dictionary

        # Number of word separator characters
        num_seps = self.read_byte(dict_addr)
        dict_addr += 1 + num_seps  # Skip separator list

        # Entry length and count
        entry_length = self.read_byte(dict_addr)
        dict_addr += 1
        num_entries = struct.unpack('>h', self.data[dict_addr:dict_addr+2])[0]
        dict_addr += 2

        # Read each dictionary entry
        for _ in range(num_entries):
            # Dictionary entries are Z-encoded
            if self.header.version <= 3:
                # 4 bytes of Z-text in V1-3
                word, _ = self.decode_zstring(dict_addr)
            else:
                # 6 bytes of Z-text in V4+
                word, _ = self.decode_zstring(dict_addr)

            words.append(word)
            dict_addr += entry_length

        return words