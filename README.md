# 🐱 Red Cat

**A lightweight RHCSA command-decision warmup trainer**

> 🔄 **NEW - Refactored Version Available!**  
> **Modular architecture** with improved maintainability and extensibility.  
> 📖 See [ARCHITECTURE.md](ARCHITECTURE.md) for complete documentation.  
> 🧪 See [TESTING.md](TESTING.md) for testing guide.

Red Cat is a fully client-side web application designed to help RHCSA exam candidates master command recognition, flag usage, and problem-to-solution mapping before diving into practice VMs.

## 🚀 Getting Started

### Option 1: Refactored Version (Recommended)
Open `index-refactored.html` in your browser - modular architecture, easier to extend.

### Option 2: Original Version
Open `index.html` in your browser - original monolithic version (still functional).

**No installation required** - just open the HTML file!

## 🎯 What Red Cat Does

- ✅ Trains you to identify the **right Linux command** for specific scenarios
- ✅ Reinforces **correct flag usage** and argument patterns
- ✅ Provides **structured, section-based progression**
- ✅ Validates command intent (not execution)
- ✅ Tracks your progress locally

## 🚫 What Red Cat Is NOT

- ❌ NOT a Linux emulator
- ❌ NOT a shell interpreter
- ❌ NOT a VM replacement
- ❌ NOT a backend-based system

## 🚀 Getting Started

1. Open `index.html` in any modern web browser
2. Start with Section 1, Task 1
3. Type commands in the terminal
4. Get instant feedback on your command structure
5. Progress unlocks as you complete tasks

## 📚 Comprehensive RHCSA Coverage - 15 Sections

**~700+ practice tasks** across all major RHCSA exam objectives, each with 6 unique question sets for variety:

### Core System Administration
1. **Users and Groups** - User/group management, sudo, privileged access
2. **Permissions and ACLs** - File permissions, ACLs, umask, links
3. **Storage and Partitioning** - Partitions, LVM (PV, VG, LV), mount management
4. **Essential Tools** - grep, find, tar, text editors, system documentation
5. **Running Systems** - Process management, systemd services, tuned profiles
6. **File Systems** - XFS/ext4, mounting, swap, autofs, quotas

### Package & Network Management
7. **Systems Maintenance** - DNF/YUM, repositories, RPM, system updates
8. **Networking** - NetworkManager, firewall, SSH, secure file transfer
9. **Containers** - Podman basics, volumes, systemd integration
10. **Remote Resources** - NFS, autofs for network shares, fstab options

### Security & Advanced Topics
11. **SELinux Security** - Modes, contexts, booleans, troubleshooting, port management
12. **Shell Scripting** - Bash fundamentals, conditionals, loops, functions, I/O
13. **Task Scheduling** - cron, anacron, at/batch, systemd timers
14. **Boot Process & GRUB** - systemd targets, GRUB2, kernel management, recovery
15. **Time & Date Services** - timedatectl, chronyd/NTP, time zones, synchronization

**📊 Coverage Estimate**: ~95% of RHCSA EX200 exam objectives

## 🛠️ Customizing Tasks

Edit `data.js` to add your own sections and tasks. Each task follows this structure:

```javascript
{
    id: 1,
    description: "Your task description",
    expected: {
        command: "commandname",
        requiredFlags: ["-f", "-g"],
        requiredValues: ["value1", "value2"]
    },
    explanation: "Why this is correct",
    points: 5
}
```

## 🎨 Technology

### Original Architecture
- Pure HTML5, CSS3, and JavaScript
- No frameworks or dependencies
- LocalStorage for progress persistence
- Fully responsive design

### Refactored Architecture (New)
- **Modular design**: 4 core modules (state, validation, output, UI)
- **66% smaller** main orchestrator (1,367 → 457 lines)
- **Easier to extend**: Add new sections without touching existing code
- **Better maintainability**: Single-responsibility modules
- **Ready for expansion**: 7 more RHCSA sections planned

**Documentation**:
- [ARCHITECTURE.md](ARCHITECTURE.md) - Complete architecture guide
- [MIGRATION.md](MIGRATION.md) - Refactoring details and migration guide
- [TESTING.md](TESTING.md) - Testing checklist and troubleshooting

## 📁 File Structure

### Refactored Version
```
├── index-refactored.html    # Entry point (refactored)
├── modules/
│   ├── state.js            # State management (150 lines)
│   ├── validation.js       # Command validation (183 lines)
│   ├── output.js           # Simulated output (468 lines)
│   └── ui.js               # UI rendering (322 lines)
├── app-refactored.js        # Main orchestrator (457 lines)
├── data.js                  # Task definitions (645 lines)
├── help.js                  # Help documentation (228 lines)
└── styles.css               # Styles
```

### Original Version (Preserved)
```
├── index.html               # Entry point (original)
├── app.js                   # Monolithic (1,367 lines)
├── validator.js             # Validation (247 lines)
├── data.js                  # Task definitions
├── help.js                  # Help documentation
└── styles.css               # Styles
```

## 📖 Philosophy

Red Cat focuses on **cognitive reinforcement** - helping you map problems to commands mentally before executing them in real systems. Use this daily as a warmup before VM practice sessions.

---

**Made for RHCSA candidates who want to build command confidence before diving into hands-on labs.**