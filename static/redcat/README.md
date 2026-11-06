# 🐱 Red Cat

**An RHCSA practice site: a command-decision trainer plus a simulated RHEL 9 terminal**

Red Cat is a fully client-side web application (no build step, no backend) that helps RHCSA exam candidates master command recognition, flag usage and problem-to-solution mapping, and then lets them try the commands in a free terminal that behaves like a small RHEL machine.

## 🚀 Getting Started

Open `index.html` in a browser, or serve the folder with any static web server. No installation is required.

1. Choose your practice mode (Default, Select Chapter, or Free Terminal)
2. Type commands in the terminal
3. Get instant feedback on your command structure
4. Progress unlocks as you complete tasks

## 🎯 What Red Cat Does

- ✅ Trains you to identify the **right Linux command** for specific scenarios
- ✅ Reinforces **correct flag usage** and argument patterns
- ✅ Provides **structured, section-based progression** with notes for every section
- ✅ Walks through **recovery procedures interactively** (root password reset with `rd.break` or `init=/bin/bash`: shutdown, GRUB editor, emergency shell)
- ✅ Offers a **free terminal** with shared simulated state (storage, services, SELinux, networking, packages, containers, reboots...)
- ✅ Tracks your progress locally

## 🚫 What Red Cat Is NOT

- ❌ NOT a real Linux system or a VM replacement
- ❌ NOT a backend-based system: everything runs in your browser and nothing is sent anywhere

## 📚 Practice Mode: 20 Sections

**~880 practice tasks** across the RHCSA exam objectives, in 3-6 question sets per section (one is picked per session):

| # | Section | # | Section |
|---|---------|---|---------|
| 1 | Essential Tools | 11 | Network Security |
| 2 | Users and Groups | 12 | SELinux Security |
| 3 | Permissions and ACLs | 13 | Software Management |
| 4 | Shell Scripting (edit scripts in a `vi` modal) | 14 | Task Scheduling |
| 5 | Storage: Partitions & LVM | 15 | Boot Process & Maintenance |
| 6 | Storage: File Systems | 16 | Rootless Containers |
| 7 | Remote Resources | 17 | Time Services |
| 8 | Systemd & Processes | 18 | Flatpak |
| 9 | System Tuning & Analysis | 19 | Root Password Reset (`rd.break`) |
| 10 | Networking | 20 | Root Password Reset (`init=/bin/bash`) |

Tasks that ask you to "write the line" (cron entries, systemd timer directives, shell constructs) are checked against the text you type. Combined short flags (`-czf`), quoted arguments, escaped semicolons and pipes into `grep` are understood.

## 🛠️ Customizing Tasks

Each section lives in `sections/`. A task follows this structure (`expected` may be a list of accepted variants):

```javascript
{
    id: 1,
    category: "Implementation",
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

Optional fields: `orderedValues` (values that must appear in this order), `match` (regular expressions for "write the line" tasks), `allowedPreChecks` (read-only commands that do not count as wrong answers).

## 📁 File Structure

```
├── index.html               # Entry point with practice mode selection
├── practice.html            # Practice interface
├── terminal.html            # Free terminal mode
├── app.js, data.js, help.js, landing.js, notes.js
├── modules/                 # state.js, validation.js, ui.js, output/ (core + one file per section)
├── sections/                # Task definitions, section1-... to section20-...
├── terminal/
│   ├── commands/            # Command implementations (one module per area)
│   ├── filesystem/          # Virtual filesystem tree
│   ├── shell/, bashinterpreter/   # Shell language: pipes, redirection, loops, functions, jobs
│   ├── boot/, boot-simulator/     # Reboot console and the root-password-reset simulator
│   ├── pager/, persist/, vi/      # less/more/man/top, saved machine state, editors
│   └── terminal.js, completion.js
└── tools/redcat-tests/      # Regression tests (jsdom): cd tools/redcat-tests && npm install && npm test
```

## 🧪 Tests

`tools/redcat-tests` loads the real pages in jsdom: answer validation, a command smoke battery, tab completion, pagers, saved state, reboot and emergency mode, a sweep that answers every practice task, and the boot simulator.

## 📖 Philosophy

Red Cat focuses on **cognitive reinforcement**: helping you map problems to commands mentally before executing them in real systems. Use it as a warmup before VM practice sessions.

---

**Made for RHCSA candidates who want to build command confidence before diving into hands-on labs.**

## 🖥️ Free Terminal (terminal.html)

A simulated RHEL 9 shell with one shared state behind the commands:

- **Storage**: `parted`/`fdisk` -> `mkfs.*` -> `mount`/`/etc/fstab` -> `df`/`findmnt`/`lsblk`, LVM (`pvcreate`...`lvextend -r`), swap, `free`
- **Services**: `systemctl` start/stop/enable/mask, matching `ps`, `top`, `pstree`, `ss`, `kill`, `journalctl -u`
- **SELinux**: file contexts (`chcon`, `restorecon`, `semanage fcontext`), booleans, port labels, AVC denials in the audit log, `ausearch`, `audit2allow`, `sealert`
- **Time**: `date`, `timedatectl`, `hwclock`, chrony
- **Custom units**: `.service`/`.timer` files in `/etc/systemd/system` run for real (ExecStart, `daemon-reload` warning, timers firing, `systemctl list-timers`, `systemd-analyze calendar`)
- **Networking**: `nmcli` profiles write keyfiles and drive `ip`, `/etc/resolv.conf`, `hostnamectl`, `ping`, `dig`/`nslookup`/`host`, `getent`
- **Packages**: `dnf`/`rpm` against a catalog and the repo files in `/etc/yum.repos.d` (broken baseurl, disabled repo, gpgcheck, mounted DVD at `/dev/sr0`); installs create files, users and units
- **Containers**: `podman` images/containers/volumes/builds, port and SELinux (`:Z`) checks, `generate systemd`, rootless user services
- **Sessions**: `su`/`sudo` with sudoers rules, password prompts and `/var/log/secure`; interactive `passwd`
- **NFS/autofs, tuning**: `/etc/exports` -> `exportfs`/`showmount`/`mount`, autofs maps mount on first access; `sysctl` (`/proc/sys`), `tuned-adm`, `nice`/`renice`
- **Archives/text**: `tar`, `gzip`/`bzip2`/`xz`, `rpm2cpio`, `grep`, `sed`, `awk`, `cut`
- **Job control**: `cmd &` creates a real job and process (`jobs`, `fg`, `bg`, `wait`, `disown`, `nohup`, `kill %1`); a `sleep` typed on its own keeps the prompt busy until it ends, `Ctrl+C` aborts it and `Ctrl+Z` stops it so `bg` and `fg` can be practised. `nc -l` and `python3 -m http.server` in the background show up in `ss`.
- **Containers you can enter**: `podman run -it ubi9 bash`, `podman exec -it CTR bash` and `podman start -ai` switch the whole terminal to the container (own filesystem, users, packages, processes, `/etc/os-release`); `-v` bind mounts are shared with the host and honour SELinux (`:Z`), `dnf` works inside UBI images and `exit` returns to the host. `podman cp` copies between host and container.
- **Programs that run once installed**: `tree`, `nc`/`ncat`, `telnet`, `nmap`, `tcpdump`, `strace`, `fuser`, `ssh-keygen`, `createrepo_c`, `yumdownloader`, `dos2unix`, `sosreport`, `git`, `jq`, `bc`, `openssl` (keys, self-signed certificates, `x509` inspection), `python3` and `perl` one-liners, `make`/`gcc`, `tmux`/`screen`, `httpd -t`/`apachectl configtest`, `nginx -t` and the `mysql` client (`-e`) exist only while their package is installed; `dnf remove` takes them away again.
- **Everyday utilities**: `md5sum`/`sha*sum` (real digests), `base64`, `expr`, `timeout`, `watch`, `realpath`, `mktemp`, `nl`, `tac`, `rev`, `shuf`, `column`, `od`, `xxd`, `hexdump`, `strings`, `ldd`, `cmp`, `comm`, `fold`, `split`, `install`, `rmdir`, `nproc`, `lastlog` and more.
- **Pagers and live `top`**: `less`, `more` and `man` open a full-screen pager when output goes to the terminal (scroll with Space/b/j/k/d/u/g/G, search with `/` `?` `n` `N`, `h` for help, `q` to quit; `less -N`, `-F`, `+/pattern`); piped or redirected output is printed as normal. `top` is live on the terminal: it refreshes, sorts with `P`/`M`/`N`/`T`, kills with `k` and changes the delay with `d`, while `top -b -n 1` stays a plain snapshot.
- **The machine is saved in your browser**: files, users, packages, services, network, storage, SELinux, firewall, containers and so on survive a refresh and a closed tab (saved to `localStorage` after every command); background jobs end with the old shell, `nohup` ones keep running. `Reset` starts a fresh machine.
- **Reboot, poweroff, shutdown**: `reboot`, `systemctl reboot`, `shutdown -r now`, `init 6`, `poweroff`, `halt` replay the shutdown and boot messages and rebuild the machine from what is on disk. Kept: files, installed packages, enabled units, NetworkManager profiles, fstab, `/etc/sysctl.d`, the permanent firewall, the active tuned profile. Lost: everything that only lived in memory (`setenforce`, `sysctl -w`, runtime firewall rules, `ip addr add`, a transient `hostname`, manual mounts, loaded modules, `date -s` without `hwclock --systohc`, running processes and containers). Enabled services start again and fail like the real thing on a port clash, an SELinux port denial or a broken `httpd`/`nginx` config; `@reboot` cron jobs run; `/.autorelabel` triggers a relabel; `grub2-reboot` picks the kernel for one boot (`uname -r`, `/proc/cmdline`); `last reboot` and `uptime` follow the boots. A powered-off machine stays off until you press Enter.
- **Emergency mode**: a local fstab line that cannot be mounted (without `nofail`) stops the boot at "Give root password for maintenance". Root is mounted read-only (`mount -o remount,rw /`, then fix `/etc/fstab`), and `exit`, Ctrl-D or `systemctl default` carries on booting. A `ro` mount of your own is read-only too.
- **Tab completion**: commands, files, `$VARIABLES` and `~users` complete like bash (press Tab twice to list); with `bash-completion` installed (the default) the arguments of `dnf`, `systemctl`, `nmcli`, `podman`, `git`, `firewall-cmd`, `semanage`, `useradd`, `chown`, `ssh`, `man`, `sysctl`, `tuned-adm` and others complete too.

Trainer tasks that ask you to "write the line" (cron entries, systemd timer directives, shell constructs) are checked against the text you type.
