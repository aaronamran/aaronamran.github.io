/** Red Cat - Section 17: Time Services */

function generateSection17Output(command, input, tokens) {
    const now = new Date();
    const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dayName   = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const day     = String(now.getDate()).padStart(2, '0');
    const year    = now.getFullYear();
    const month2  = String(now.getMonth() + 1).padStart(2, '0');
    const hh      = String(now.getHours()).padStart(2, '0');
    const mm      = String(now.getMinutes()).padStart(2, '0');
    const ss      = String(now.getSeconds()).padStart(2, '0');
    const utcHH   = String((now.getHours() + 4) % 24).padStart(2, '0');

    // ── date ──────────────────────────────────────────────────────────────────
    if (command === 'date') {
        if (input.match(/-s\b/) || tokens.some(t => t === '-s')) return '';
        if (input.includes('+%Z')) return 'EDT';
        return `${dayName} ${monthName} ${day} ${hh}:${mm}:${ss} EDT ${year}`;
    }

    // TZ=... date  (env-var prefix, handled as "command")
    if (command.startsWith('TZ=') && input.includes('date')) {
        const pHH = String((now.getHours() - 3 + 24) % 24).padStart(2, '0');
        return `${dayName} ${monthName} ${day} ${pHH}:${mm}:${ss} PDT ${year}`;
    }

    // ── timedatectl ───────────────────────────────────────────────────────────
    if (command === 'timedatectl') {
        const sub = tokens[1];

        // Silent modifier commands
        if (['set-time','set-timezone','set-ntp','set-local-rtc'].includes(sub)) return '';

        // list-timezones (plain or piped to grep)
        if (sub === 'list-timezones') {
            // If piped grep is present, filter output
            if (input.includes('grep')) {
                const grepMatch = input.match(/grep\s+['"]?([^\s'"]+)['"]?/);
                const pattern = grepMatch ? grepMatch[1] : '';
                const all = [
                    'America/Adak','America/Anchorage','America/Boise','America/Chicago',
                    'America/Denver','America/Detroit','America/Los_Angeles','America/New_York',
                    'America/Phoenix','America/Toronto','America/Vancouver','America/Winnipeg',
                    'Asia/Kolkata','Asia/Seoul','Asia/Shanghai','Asia/Tokyo',
                    'Atlantic/Reykjavik',
                    'Australia/Melbourne','Australia/Sydney',
                    'Europe/Amsterdam','Europe/Berlin','Europe/London','Europe/Madrid','Europe/Paris',
                    'Pacific/Auckland','Pacific/Honolulu',
                    'UTC'
                ];
                const filtered = pattern ? all.filter(tz => tz.toLowerCase().includes(pattern.toLowerCase())) : all;
                return filtered.join('\n') || `(no timezones matching '${pattern}')`;
            }
            return 'Africa/Abidjan\nAfrica/Accra\nAfrica/Addis_Ababa\nAmerica/Adak\nAmerica/Anchorage\nAmerica/Chicago\nAmerica/Denver\nAmerica/Los_Angeles\nAmerica/New_York\nAmerica/Phoenix\nAsia/Kolkata\nAsia/Seoul\nAsia/Shanghai\nAsia/Tokyo\nAustralia/Sydney\nEurope/Berlin\nEurope/London\nEurope/Paris\nPacific/Auckland\nPacific/Honolulu\nUTC';
        }

        // timesync-status
        if (sub === 'timesync-status') {
            return `       Server: 216.239.35.4 (time1.google.com)\nPoll interval: 1min 4s (min: 32s; max 34min 8s)\n         Leap: normal\n      Version: 4\n      Stratum: 2\n    Reference: D8EFB332\n    Precision: 1us (-22)\n Root distance: 14.856ms (max: 5s)\n       Offset: -0.001253s\n        Delay: 14.856ms\n       Jitter: 4.126ms\n Packet count: 16`;
        }

        // default: status
        return `               Local time: ${dayName} ${year}-${month2}-${day} ${hh}:${mm}:${ss} EDT\n           Universal time: ${dayName} ${year}-${month2}-${day} ${utcHH}:${mm}:${ss} UTC\n                 RTC time: ${dayName} ${year}-${month2}-${day} ${utcHH}:${mm}:${ss}\n                Time zone: America/New_York (EDT, -0400)\nSystem clock synchronized: yes\n              NTP service: active\n          RTC in local TZ: no`;
    }

    // ── hwclock ───────────────────────────────────────────────────────────────
    if (command === 'hwclock') {
        if (input.includes('--systohc') || hasFlags(input, 'w')) return '';
        if (input.includes('--hctosys') || (input.includes('-s') && !input.includes('sources'))) return '';
        // hwclock / hwclock -r — show hardware clock
        return `${year}-${month2}-${day} ${utcHH}:${mm}:${ss}.234152+00:00`;
    }

    // ── chronyc ───────────────────────────────────────────────────────────────
    if (command === 'chronyc') {
        const sub = tokens[1];

        if (sub === 'sources') {
            if (input.includes('-v')) {
                return `\n  .-- Source mode  '^' clock, '*' current best, '+' combined , '-' not combined,\n / '?'  unreachable, 'x' falseticker, '~' too variable.\n210 Number of sources = 4\n\nMS Name/IP address         Stratum Poll Reach LastRx Last sample               \n===============================================================================\n^* time1.google.com              1   6   377    18   +0.283ms[  +0.511ms] +/-   14ms\n^+ time2.google.com              1   6   377    18   -0.412ms[ -0.184ms] +/-   13ms\n^+ ntp.ubuntu.com                2   6   377    18   +1.124ms[ +1.352ms] +/-   28ms\n^- 0.rhel.pool.ntp.org           2   6   377    18   -3.221ms[ -2.993ms] +/-   42ms`;
            }
            return `210 Number of sources = 4\nMS Name/IP address         Stratum Poll Reach LastRx Last sample               \n===============================================================================\n^* time1.google.com              1   6   377    18   +0.283ms[  +0.511ms] +/-   14ms\n^+ time2.google.com              1   6   377    18   -0.412ms[ -0.184ms] +/-   13ms\n^+ ntp.ubuntu.com                2   6   377    18   +1.124ms[ +1.352ms] +/-   28ms\n^- 0.rhel.pool.ntp.org           2   6   377    18   -3.221ms[ -2.993ms] +/-   42ms`;
        }

        if (sub === 'tracking') {
            return `Reference ID    : D8EFB332 (time1.google.com)\nStratum         : 2\nRef time (UTC)  : ${dayName} ${monthName} ${day} ${utcHH}:${mm}:${ss} ${year}\nSystem time     : 0.000001253 seconds slow of NTP time\nLast offset     : -0.000001253 seconds\nRMS offset      : 0.000002841 seconds\nFrequency       : 2.271 ppm fast\nResidual freq   : -0.003 ppm\nSkew            : 0.274 ppm\nRoot delay      : 0.014856000 seconds\nRoot dispersion : 0.001283469 seconds\nUpdate interval : 64.2 seconds\nLeap status     : Normal`;
        }

        if (sub === 'makestep') return '200 OK';

        if (sub === 'sourcestats') {
            return `210 Number of sources = 4\nName/IP Address            NP  NR  Span  Frequency  Freq Skew  Offset  Std Dev\n==============================================================================\ntime1.google.com            8   4   526   +0.014 ppm  0.274 ppm  +0.283ms   0.512ms\ntime2.google.com            8   5   528   -0.034 ppm  0.312 ppm  -0.412ms   0.498ms\nntp.ubuntu.com              8   3   525   +0.102 ppm  0.512 ppm  +1.124ms   0.721ms\n0.rhel.pool.ntp.org         8   4   530   -0.220 ppm  0.801 ppm  -3.221ms   1.234ms`;
        }

        if (sub === 'activity') {
            return '200 OK\n4 sources online\n0 sources offline\n0 sources doing burst (return to online)\n0 sources doing burst (return to offline)\n0 sources with unknown address';
        }

        if (sub === 'clients') {
            return `            Hostname                      NTP   Drop Int IntL Last     Cmd   Drop Int  Last\n===============================================================================\n192.168.1.101                          5      0   6    -    42       0      0   -     -\n192.168.1.102                          3      0   6    -    87       0      0   -     -`;
        }

        if (sub === 'waitsync') {
            return `try: 1, correction: 0.000001253, skew: 0.000274, max offset: 0.010000\nLast log message: Frequency 2.271 ppm fast\nSynchronised!`;
        }

        if (sub === 'authdata') {
            return `Name/IP address             Mode KeyID Type KLen Last Atmp NAK Cook CLen\n=========================================================================\ntime1.google.com             NTS     0  N/A    0  16m    0   0    8  100\ntime2.google.com             NTS     0  N/A    0  16m    0   0    8  100`;
        }

        if (sub === '-v' || sub === '--version') {
            return 'chronyc (chrony) version 4.3 (+READLINE +SECHASH +IPV6 +DEBUG)';
        }

        if (sub === 'add' && tokens[2] === 'server') return '200 OK';

        return null;
    }

    // ── systemctl chronyd ─────────────────────────────────────────────────────
    if (command === 'systemctl' && input.includes('chronyd')) {
        if (input.includes('status')) {
            return `● chronyd.service - NTP client/server\n     Loaded: loaded (/usr/lib/systemd/system/chronyd.service; enabled; vendor preset: enabled)\n     Active: active (running) since ${dayName} ${year}-${month2}-${day} 09:00:01 EDT; 1h 22min ago\n       Docs: man:chronyd(8)\n             man:chrony.conf(5)\n    Process: 912 ExecStartPost=/usr/libexec/chrony-helper update-daemon (code=exited, status=0/SUCCESS)\n   Main PID: 923 (chronyd)\n      Tasks: 1 (limit: 23152)\n     Memory: 2.1M\n        CPU: 78ms\n     CGroup: /system.slice/chronyd.service\n             └─923 /usr/sbin/chronyd -F 2\n\n${monthName} ${day} 09:00:01 rhel9 chronyd[923]: chronyd version 4.3 starting\n${monthName} ${day} 09:00:01 rhel9 chronyd[923]: Frequency -2.271 +/- 0.274 ppm read from /var/lib/chrony/drift\n${monthName} ${day} 09:00:05 rhel9 chronyd[923]: Selected source 216.239.35.4 (time1.google.com)\n${monthName} ${day} 09:00:05 rhel9 chronyd[923]: System clock synchronized`;
        }
        if (input.includes('is-enabled')) return 'enabled';
        if (input.includes('is-active'))  return 'active';
        // restart / stop / start — silent
        return '';
    }

    // ── cat ───────────────────────────────────────────────────────────────────
    if (command === 'cat') {
        if (input.includes('/etc/chrony.conf')) {
            return `# Use public servers from the pool.ntp.org project.\npool 2.rhel.pool.ntp.org iburst\n\n# Record the rate at which the system clock gains/losses time.\ndriftfile /var/lib/chrony/drift\n\n# Allow the system clock to be stepped in the first three updates\n# if its offset is larger than 1 second.\nmakestep 1.0 3\n\n# Enable kernel synchronization of the real-time clock (RTC).\nrtcsync\n\n# Specify directory for log files.\nlogdir /var/log/chrony\n\n# Select which information is logged.\n#log measurements statistics tracking\n\n# Uncomment to allow NTP client access from local network.\n#allow 192.168.0.0/16`;
        }
        if (input.includes('/etc/adjtime')) {
            return '0.000000 1743984000 0.000000\n1743984000\nUTC';
        }
        if (input.includes('/var/lib/chrony/drift')) {
            return '      2.271   0.274';
        }
    }

    // ── grep on chrony config and other files ─────────────────────────────────
    if (command === 'grep') {
        if (input.includes('/etc/chrony.conf')) {
            if (input.includes('allow'))       return '#allow 192.168.0.0/16';
            if (input.includes('makestep'))    return 'makestep 1.0 3';
            if (input.includes('bindaddress')) return '#bindaddress 0.0.0.0';
            if (input.includes('driftfile'))   return 'driftfile /var/lib/chrony/drift';
            if (input.includes('logdir'))      return 'logdir /var/log/chrony';
            if (input.includes('rtcsync'))     return 'rtcsync';
            if (input.includes('prefer'))      return '#server ntp.example.com iburst prefer';
            if (input.includes('minsources'))  return '#minsources 2';
            if (input.includes('ratelimit'))   return '#ratelimit interval 3 burst 8';
            if (input.includes('server'))      return 'pool 2.rhel.pool.ntp.org iburst\n#server ntp.example.com iburst';
        }
        if (input.includes('TZ') && input.includes('.bashrc')) return '';
        if (input.includes('DST') && input.includes('timedatectl')) {
            return '          RTC in local TZ: no';
        }
    }

    // ── ls ────────────────────────────────────────────────────────────────────
    if (command === 'ls') {
        if (input.includes('/var/log/chrony')) {
            return 'measurements.log  statistics.log  tracking.log';
        }
        if (input.includes('/usr/share/zoneinfo/America')) {
            return 'Adak         Anchorage    Boise        Chicago      Denver\nDetroit      Indiana      Juneau       Kentucky     Los_Angeles\nMenominee    New_York     Nome         North_Dakota Phoenix      Sitka\nThule        Vancouver    Whitehorse   Winnipeg     Yakutat';
        }
        if (input.includes('/usr/share/zoneinfo')) {
            return 'Africa  America  Antarctica  Arctic  Asia  Atlantic  Australia\nEtc     Europe   Indian     Pacific  US    UTC';
        }
        if (hasFlags(input, 'l') && input.includes('/etc/localtime')) {
            return `lrwxrwxrwx. 1 root root 38 ${monthName} ${day} ${hh}:${mm} /etc/localtime -> ../usr/share/zoneinfo/America/New_York`;
        }
    }

    // ── rpm ───────────────────────────────────────────────────────────────────
    if (command === 'rpm') {
        if (hasFlags(input, 'q') && input.includes('chrony'))  return 'chrony-4.3-1.el9.x86_64';
        if (hasFlags(input, 'q') && input.includes('tzdata'))  return 'tzdata-2024a-1.el9.noarch';
    }

    // ── dnf info tzdata ───────────────────────────────────────────────────────
    if (command === 'dnf' && input.includes('info') && input.includes('tzdata')) {
        return `Installed Packages\nName         : tzdata\nVersion      : 2024a\nRelease      : 1.el9\nArchitecture : noarch\nSize         : 1.6 M\nSource       : tzdata-2024a-1.el9.src.rpm\nRepository   : @System\nFrom repo    : baseos\nSummary      : Timezone data\nURL          : https://www.iana.org/time-zones\nLicense      : Public Domain\nDescription  : This package contains data files with rules for various\n             : time zones around the world.`;
    }

    // ── zdump ─────────────────────────────────────────────────────────────────
    if (command === 'zdump') {
        if (input.includes('-v')) {
            return `America/New_York  Sun Mar 08 06:59:59 2026 UTC = Sun Mar 08 01:59:59 2026 EST isdst=0 gmtoff=-18000\nAmerica/New_York  Sun Mar 08 07:00:00 2026 UTC = Sun Mar 08 03:00:00 2026 EDT isdst=1 gmtoff=-14400\nAmerica/New_York  Sun Nov 01 05:59:59 2026 UTC = Sun Nov 01 01:59:59 2026 EDT isdst=1 gmtoff=-14400\nAmerica/New_York  Sun Nov 01 06:00:00 2026 UTC = Sun Nov 01 01:00:00 2026 EST isdst=0 gmtoff=-18000`;
        }
        // Multi-zone (zdump zone1 zone2 zone3)
        const parts = [];
        if (input.includes('America/New_York'))  parts.push(`America/New_York  ${dayName} ${monthName} ${day} ${hh}:${mm}:${ss} ${year} EDT`);
        if (input.includes('Europe/London'))     parts.push(`Europe/London     ${dayName} ${monthName} ${day} ${utcHH}:${mm}:${ss} ${year} BST`);
        if (input.includes('Asia/Tokyo')) {
            const tokyoHH = String((now.getHours() + 13) % 24).padStart(2, '0');
            parts.push(`Asia/Tokyo        ${dayName} ${monthName} ${day} ${tokyoHH}:${mm}:${ss} ${year} JST`);
        }
        if (parts.length > 0) return parts.join('\n');
    }

    // ── ln -s (timezone symlink) ───────────────────────────────────────────────
    if (command === 'ln' && hasFlags(input, 's') && input.includes('localtime')) return '';

    // ── echo >> .bashrc ───────────────────────────────────────────────────────
    if (command === 'echo' && input.includes('.bashrc') && input.includes('TZ')) return '';

    // ── firewall-cmd --list-services ──────────────────────────────────────────
    if (command === 'firewall-cmd' && input.includes('--list-services')) {
        return 'cockpit dhcpv6-client ntp ssh';
    }

    // ── ss -ulnp | grep :123 ──────────────────────────────────────────────────
    if (command === 'ss' && input.includes(':123')) {
        return 'udp   UNCONN 0      0       0.0.0.0:123         0.0.0.0:*    users:(("chronyd",pid=923,fd=5))';
    }

    // ── lsof -i :123 ──────────────────────────────────────────────────────────
    if (command === 'lsof' && input.includes(':123')) {
        return 'COMMAND  PID       USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nchronyd  923 _chrony    5u  IPv4  26789      0t0  UDP *:ntp';
    }

    // ── ping ntp server ───────────────────────────────────────────────────────
    if (command === 'ping' && input.includes('ntp')) {
        const host = tokens.find(t => t.includes('ntp')) || 'ntp.example.com';
        return `PING ${host} (203.0.113.10) 56(84) bytes of data.\n64 bytes from 203.0.113.10: icmp_seq=1 ttl=55 time=14.3 ms\n64 bytes from 203.0.113.10: icmp_seq=2 ttl=55 time=13.8 ms\n\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss, time 1002ms\nrtt min/avg/max/mdev = 13.800/14.050/14.300/0.250 ms`;
    }

    // ── nc -u ntp.example.com 123 ─────────────────────────────────────────────
    if (command === 'nc' && input.includes('123')) return '';

    // ── journalctl -u chronyd ─────────────────────────────────────────────────
    if (command === 'journalctl' && input.includes('chronyd')) {
        return `-- Journal begins at ${dayName} ${year}-${month2}-${day} 09:00:00 EDT. --\n${monthName} ${day} 09:00:01 rhel9 chronyd[923]: chronyd version 4.3 starting\n${monthName} ${day} 09:00:01 rhel9 chronyd[923]: Loaded 0 symmetric keys\n${monthName} ${day} 09:00:01 rhel9 chronyd[923]: Frequency -2.271 +/- 0.274 ppm read from /var/lib/chrony/drift\n${monthName} ${day} 09:00:05 rhel9 chronyd[923]: Selected source 216.239.35.4 (time1.google.com)\n${monthName} ${day} 09:00:06 rhel9 chronyd[923]: System clock synchronized`;
    }

    // ── chronyd -n (foreground / config test) ─────────────────────────────────
    if (command === 'chronyd' && hasFlags(input, 'n')) {
        return `chronyd version 4.3 starting\nLoaded 0 symmetric keys\nFrequency -2.271 +/- 0.274 ppm read from /var/lib/chrony/drift\nListening on command socket /run/chrony/chronyd.sock`;
    }

    // ── rm -f /var/lib/chrony/drift ───────────────────────────────────────────
    if (command === 'rm' && input.includes('/var/lib/chrony/drift')) return '';

    return null;
}
