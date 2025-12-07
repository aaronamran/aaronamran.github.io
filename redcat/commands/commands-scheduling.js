// Job Scheduling Commands - cron, at, etc.
// Part of Red Cat RHCSA Terminal Simulator

class SchedulingCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
    }

    // Placeholder - commands will be moved here
    // crontab, at, atq, atrm, anacron, cron

    crontab(args) {
        const flags = this.parseFlags(args, ['l', 'e', 'r', 'u']);
        
        if (!this.cronJobs) {
            this.cronJobs = {};
        }
        
        if (!this.cronJobs[this.fs.currentUser]) {
            this.cronJobs[this.fs.currentUser] = [];
        }
        
        // -l: List cron jobs
        if (flags.l) {
            const jobs = this.cronJobs[this.fs.currentUser];
            if (jobs.length === 0) {
                return { output: 'no crontab for ' + this.fs.currentUser };
            }
            return { output: jobs.join('\n') };
        }
        
        // -e: Edit crontab (simulated)
        if (flags.e) {
            return { output: `[Crontab editor for ${this.fs.currentUser}]\n# Add cron jobs in format:\n# * * * * * command\n# minute hour day month weekday command\n\n[Simulated - use "crontab -l" to list existing jobs]` };
        }
        
        // -r: Remove all cron jobs
        if (flags.r) {
            this.cronJobs[this.fs.currentUser] = [];
            return { output: '' };
        }
        
        // -u: Specify user (root only)
        if (flags.u) {
            if (this.fs.currentUid !== 0) {
                return { error: 'crontab: must be privileged to use -u' };
            }
            const user = flags.args[0];
            if (!this.fs.users[user]) {
                return { error: `crontab: user '${user}' unknown` };
            }
            if (!this.cronJobs[user]) {
                this.cronJobs[user] = [];
            }
            return { output: this.cronJobs[user].join('\n') || 'no crontab for ' + user };
        }
        
        return { output: 'usage: crontab [-l | -e | -r] [-u user]' };
    }

    at(args) {
        if (args.length === 0) {
            return { error: 'at: usage: at [-V] [-q queue] [-f file] [-mldbv] TIME' };
        }
        
        const time = args[0];
        
        if (!this.atJobs) {
            this.atJobs = [];
        }
        
        const jobId = this.atJobs.length + 1;
        this.atJobs.push({
            id: jobId,
            time: time,
            user: this.fs.currentUser,
            command: '[simulated command]'
        });
        
        return { output: `job ${jobId} at ${time}` };
    }

    atq(args) {
        if (!this.atJobs || this.atJobs.length === 0) {
            return { output: '' };
        }
        
        let output = '';
        for (const job of this.atJobs) {
            output += `${job.id}\t${job.time}\ta\t${job.user}\n`;
        }
        return { output };
    }

    atrm(args) {
        if (args.length === 0) {
            return { error: 'atrm: usage: atrm job [job...]' };
        }
        
        if (!this.atJobs) {
            this.atJobs = [];
        }
        
        const jobId = parseInt(args[0]);
        this.atJobs = this.atJobs.filter(job => job.id !== jobId);
        
        return { output: '' };
    }

    anacron(args) {
        if (this.fs.currentUid !== 0) {
            return { error: 'anacron: Permission denied' };
        }
        
        const flags = this.parseFlags(args, ['n', 's', 'f', 'u', 't']);
        
        if (flags.t) {
            return { output: `Anacron 2.3 started on ${new Date().toDateString()}
Normal exit (0 jobs run)` };
        }
        
        if (flags.n) {
            return { output: `Anacron 2.3 started on ${new Date().toDateString()}
Will run missed jobs now
Job \`cron.daily' started
Job \`cron.daily' terminated
Job \`cron.weekly' started
Job \`cron.weekly' terminated
Normal exit (2 jobs run)` };
        }
        
        if (flags.u) {
            return { output: `Updated timestamps for all jobs` };
        }
        
        return { output: `Anacron 2.3
Usage: anacron [-s] [-f] [-n] [-d] [-q] [-t anacrontab] [-S spooldir] [job]
       anacron [-S spooldir] -u [job]
       anacron [-V|-h]

  -s         Serialize execution of jobs
  -f         Force execution, ignore timestamps
  -n         Run jobs now, ignore delays
  -d         Don't fork to background
  -q         Suppress stderr messages
  -u         Update timestamps without running jobs
  -t <file>  Use alternative anacrontab
  -S <dir>   Select alternative spool directory
  -V         Print version and exit
  -h         Print this message and exit` };
    }

    cron(args) {
        return { output: `cron daemon information:
The cron daemon is managed by systemd.
Use: systemctl status crond
     systemctl start crond
     systemctl stop crond

Edit user cron jobs with: crontab -e
List user cron jobs with: crontab -l

System-wide cron jobs are in:
  /etc/crontab          - System crontab
  /etc/cron.d/          - System cron jobs
  /etc/cron.daily/      - Daily jobs
  /etc/cron.weekly/     - Weekly jobs
  /etc/cron.monthly/    - Monthly jobs` };
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
    window.SchedulingCommands = SchedulingCommands;
}
