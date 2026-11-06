// Process Management Commands
// Part of Red Cat RHCSA Terminal Simulator

class ProcessCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.processes = sharedState.processes;
    }

    ps(args) {
        const flags = this.parseFlags(args, ['a', 'u', 'x', 'e', 'f', 'Z']);
        
        // Header
        let header = 'PID   USER     CPU  MEM  COMMAND';
        if (flags.Z) {
            header = 'LABEL                                                     PID   USER     CPU  MEM  COMMAND';
        }
        
        let output = [header];
        
        for (const proc of this.processes) {
            let line = `${String(proc.pid).padEnd(5)} ${proc.user.padEnd(8)} ${proc.cpu.toFixed(1)}  ${proc.mem.toFixed(1)}  ${proc.command}`;
            
            if (flags.Z) {
                const ctx = proc.selinux || { user: 'unconfined_u', role: 'unconfined_r', type: 'unconfined_t', level: 's0-s0:c0.c1023' };
                const selinuxLabel = `${ctx.user}:${ctx.role}:${ctx.type}:${ctx.level}`;
                line = `${selinuxLabel.padEnd(57)} ${String(proc.pid).padEnd(5)} ${proc.user.padEnd(8)} ${proc.cpu.toFixed(1)}  ${proc.mem.toFixed(1)}  ${proc.command}`;
            }
            
            output.push(line);
        }
        
        return { output: output.join('\n') };
    }
    
    top(args) {
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const upDays = Math.floor(Math.random() * 30) + 1;
        const upHours = Math.floor(Math.random() * 24);
        const upMins = Math.floor(Math.random() * 60);
        return { output: `top - ${time} up ${upDays} days, ${upHours}:${upMins.toString().padStart(2, '0')},  1 user,  load average: 0.15, 0.08, 0.03
Tasks: 127 total,   1 running, 126 sleeping,   0 stopped,   0 zombie
%Cpu(s):  1.3 us,  0.7 sy,  0.0 ni, 97.8 id,  0.2 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   3789.7 total,   1245.2 free,    987.4 used,   1557.1 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   2556.8 avail Mem 

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 root      20   0  173844  13928   8932 S   0.0   0.4   0:03.45 systemd
    234 root      20   0   15296   5124   3456 S   0.0   0.1   0:00.23 sshd
    567 root      20   0  621304  24576  16384 S   0.0   0.6   0:01.12 firewalld
    890 chrony    20   0   89764   3456   2816 S   0.0   0.1   0:00.34 chronyd
   1234 root      20   0  243652  12288   8192 S   0.0   0.3   0:00.67 rsyslogd
   1456 root      20   0  224568   8192   6144 S   0.0   0.2   0:00.45 NetworkManager

[Press q to quit (simulated)]` };
    }
    
    htop(args) {
        return { output: `htop - Interactive process viewer
[Use 'top' command for process monitoring in this simulator]

  CPU[|||                                                  5.2%]   Tasks: 127, 453 thr; 1 running
  Mem[||||||||||||||||                                 987M/3.7G]   Load average: 0.15 0.08 0.03 
  Swp[                                                   0K/2.0G]   Uptime: 12 days, 08:34:21

    PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
      1 root       20   0  173M 13.6M  8.7M S  0.0  0.4  0:03.45 /usr/lib/systemd/systemd --switched-root --system
    234 root       20   0  220M 12.3M  9.8M S  0.0  0.3  0:01.23 /usr/sbin/sshd -D
    456 apache     20   0  185M 45.6M  7.8M S  2.0  1.2  1:23.45 /usr/sbin/httpd -DFOREGROUND
    789 mysql      20   0 1234M  234M 23.4M S  5.0  6.2  5:12.34 /usr/sbin/mysqld

F1Help F2Setup F3Search F4Filter F5Tree F6SortBy F7Nice F8Nice+ F9Kill F10Quit` };
    }
    
    kill(args) {
        if (args.length === 0) {
            return { error: 'kill: missing operand' };
        }
        
        const pid = parseInt(args[0]);
        const proc = this.processes.find(p => p.pid === pid);
        
        if (!proc) {
            return { error: `kill: (${pid}) - No such process` };
        }
        
        if (proc.user !== this.fs.currentUser && this.fs.currentUid !== 0) {
            return { error: `kill: (${pid}) - Operation not permitted` };
        }
        
        this.processes = this.processes.filter(p => p.pid !== pid);
        return { output: '' };
    }
    
    nice(args) {
        if (args.length === 0) {
            return { error: 'nice: missing operand' };
        }
        
        const flags = this.parseFlags(args, ['n']);
        const niceness = flags.n ? (args[1] || '10') : '10';
        const command = flags.args.join(' ');
        
        return { output: `[Running '${command}' with niceness ${niceness}]` };
    }
    
    renice(args) {
        if (args.length < 2) {
            return { error: 'renice: missing operand' };
        }
        
        const priority = args[0];
        const pid = args[1];
        
        return { output: `${pid} (process ID) old priority 0, new priority ${priority}` };
    }
    
    free(args) {
        const flags = this.parseFlags(args, ['h', 'm', 'g', 'k']);
        
        // Human readable
        if (flags.h) {
            return { output: `               total        used        free      shared  buff/cache   available
Mem:           3.7Gi       963Mi       1.2Gi        24Mi       1.5Gi       2.5Gi
Swap:          2.0Gi         0Bi       2.0Gi` };
        }
        
        // Megabytes
        if (flags.m) {
            return { output: `               total        used        free      shared  buff/cache   available
Mem:            3790         963        1245          24        1557        2557
Swap:           2048           0        2048` };
        }
        
        // Default: kilobytes
        return { output: `               total        used        free      shared  buff/cache   available
Mem:         3881472      986624     1275136       24576     1595392     2618368
Swap:        2097152           0     2097152` };
    }
    
    uptime(args) {
        const now = new Date();
        const time = now.toTimeString().split(' ')[0];
        const upDays = Math.floor(Math.random() * 30) + 1;
        const upHours = Math.floor(Math.random() * 24);
        const upMins = Math.floor(Math.random() * 60);
        const load1 = (Math.random() * 0.5).toFixed(2);
        const load5 = (Math.random() * 0.3).toFixed(2);
        const load15 = (Math.random() * 0.2).toFixed(2);
        return { output: ` ${time} up ${upDays} days, ${upHours}:${upMins.toString().padStart(2, '0')},  1 user,  load average: ${load1}, ${load5}, ${load15}` };
    }
    
    vmstat(args) {
        const interval = args[0] || '';
        
        return { output: `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 1048576 102400 421888    0    0     5    10   50  100  1  1 98  0  0` };
    }
    
    iostat(args) {
        const flags = this.parseFlags(args, ['x', 'c', 'd', 'h']);
        
        return { output: `Linux 5.14.0-284.el9.x86_64 (rhcsa-lab)     ${new Date().toLocaleDateString()}     _x86_64_    (2 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.25    0.00    0.15    0.05    0.00   99.55

Device             tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd
sda               1.23        12.34        23.45         0.00     123456     234567          0
sdb               0.45         4.56         5.67         0.00      45678      56789          0` };
    }
    
    sar(args) {
        return { output: `Linux 5.14.0-284.el9.x86_64 (rhcsa-lab)     ${new Date().toLocaleDateString()}     _x86_64_    (2 CPU)

${new Date().toTimeString().split(' ')[0]}     CPU     %user     %nice   %system   %iowait    %steal     %idle
${new Date().toTimeString().split(' ')[0]}     all      0.25      0.00      0.15      0.05      0.00     99.55
Average:        all      0.25      0.00      0.15      0.05      0.00     99.55` };
    }

    parseFlags(args, validFlags) {
        const flags = {};
        const remainingArgs = [];
        
        for (const arg of args) {
            if (arg.startsWith('-') && arg.length > 1) {
                const flagChars = arg.slice(1).split('');
                for (const char of flagChars) {
                    if (validFlags.includes(char)) {
                        flags[char] = true;
                    }
                }
            } else {
                remainingArgs.push(arg);
            }
        }
        
        flags.args = remainingArgs;
        return flags;
    }
}

if (typeof window !== 'undefined') {
    window.ProcessCommands = ProcessCommands;
}
