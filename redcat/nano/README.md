# Nano Editor - RHCSA Simulator

GNU nano text editor simulation for RHCSA practice.

## Features Implemented

### Main Commands (Ctrl shortcuts)
- `Ctrl+X` - Exit editor
- `Ctrl+O` - Write Out (save)
- `Ctrl+G` - Get Help
- `Ctrl+W` - Where Is (search)
- `Ctrl+K` - Cut line
- `Ctrl+U` - Uncut (paste)
- `Ctrl+C` - Show cursor position
- `Ctrl+6` - Copy line
- `Ctrl+_` - Go to line

### Navigation
- Arrow keys - Move cursor
- Home/End - Start/end of line
- PgUp/PgDn - Page up/down
- All standard keyboard navigation

### Editing
- Direct character insertion (no modes)
- Enter - New line
- Backspace - Delete before cursor
- Delete - Delete at cursor
- Tab - Insert 4 spaces

### File Operations
- Automatic save with line count confirmation
- Create new files if they don't exist
- Respects filesystem permissions
- Shows [Modified] status in header

## Usage

```bash
nano filename.txt
```

The editor opens ready for editing. Use Ctrl+O to save, Ctrl+X to exit.

## RHCSA Exam Relevance

Easier to use than vi for:
- Quick configuration file edits
- Simple text file creation
- When you don't remember vi commands
- Straightforward editing without modal complexity

Many sysadmins prefer nano for quick edits!

## Interface

```
  GNU nano 5.6.1         filename.txt [Modified]
  
  [file content with cursor shown]
  
  [ Status messages appear here ]
  
^G Get Help  ^O Write Out ^W Where Is  ^K Cut Line   ^J Justify   ^C Cur Pos
^X Exit      ^R Read File ^\\ Replace   ^U Uncut Line ^T To Spell  ^_ Go To Line
```

## Implementation Notes

- Modular design - separate JS file
- Integrates with virtual filesystem
- Bottom menu shows available shortcuts
- Simple and intuitive for beginners
- Realistic GNU nano 5.6.1 behavior
