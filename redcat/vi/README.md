# Vi/Vim Editor - RHCSA Simulator

Full-featured modal text editor simulation for RHCSA practice.

## Features Implemented

### Modes
- **Normal Mode** - Navigation and commands (default)
- **Insert Mode** - Text insertion
- **Visual Mode** - Text selection (basic)
- **Command Mode** - Ex commands (`:`, `/`)

### Navigation (Normal Mode)
- `h`, `j`, `k`, `l` - Left, down, up, right
- `w`, `b` - Word forward/backward
- `0`, `$` - Start/end of line
- `gg`, `G` - First/last line
- Arrow keys, Home, End, PgUp, PgDn

### Editing (Normal Mode)
- `i` - Insert before cursor
- `I` - Insert at line start
- `a` - Append after cursor
- `A` - Append at line end
- `o` - Open line below
- `O` - Open line above
- `x` - Delete character
- `X` - Delete character before
- `dd` - Delete line (cut)
- `yy` - Yank line (copy)
- `p` - Paste after cursor
- `P` - Paste before cursor
- `J` - Join lines

### Commands
- `:w` - Write (save) file
- `:q` - Quit
- `:wq`, `:x` - Write and quit
- `:q!` - Quit without saving
- `:w filename` - Save as filename
- `:123` - Go to line 123
- `:s/pattern/replace/` - Substitute on current line
- `:s/pattern/replace/g` - Global substitute on line
- `/pattern` - Search forward
- `:help` - Show help

### Insert Mode
- All printable characters insert text
- Enter, Backspace, Delete work as expected
- Escape returns to normal mode
- Arrow keys for navigation

## Usage

```bash
vi filename.txt
vim filename.txt
```

The editor opens in normal mode. Press `i` to start inserting text, `Esc` to return to normal mode, `:wq` to save and exit.

## RHCSA Exam Relevance

Essential for:
- Editing configuration files
- Creating/modifying scripts
- System administration tasks
- Quick file edits without leaving terminal

## Implementation Notes

- Modular design - separate JS file loaded dynamically
- Integrates with virtual filesystem
- Respects file permissions
- Realistic vim behavior for exam practice
- Cursor visible in all modes with appropriate styling
