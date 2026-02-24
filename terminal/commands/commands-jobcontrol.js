// Job Control Commands - jobs, fg, bg, disown, nohup
// Part of Red Cat RHCSA Terminal Simulator

class JobControlCommands {
    constructor(sharedState) {
        this.fs = sharedState.fs;
        this.processes = sharedState.processes;
        this.parent = sharedState.parent;
        
        // Initialize job tracking system
        if (!this.parent.jobs) {
            this.parent.jobs = [];
            this.parent.jobCounter = 1;
            this.parent.currentJob = null;
            this.parent.previousJob = null;
        }
    }

    jobs(args) {
        const flags = this.parseFlags(args, ['l', 'p', 'r', 's']);
        
        if (this.parent.jobs.length === 0) {
            return { output: '' };
        }
        
        let output = [];
        
        for (const job of this.parent.jobs) {
            let line = '';
            
            // Job number with current/previous indicators
            const isCurrent = job.id === this.parent.currentJob;
            const isPrevious = job.id === this.parent.previousJob;
            const indicator = isCurrent ? '+' : (isPrevious ? '-' : ' ');
            
            line += `[${job.id}]${indicator}  `;
            
            // Add status
            line += `${job.state.padEnd(10)}  `;
            
            if (flags.l) {
                // Long format with PID
                line += `${job.pid}  `;
            }
            
            if (flags.p) {
                // Only PID
                output.push(job.pid.toString());
                continue;
            }
            
            // Command
            line += job.command;
            
            // Background indicator
            if (job.state === 'Running' && job.background) {
                line += ' &';
            }
            
            output.push(line);
        }
        
        return { output: output.join('\n') };
    }

    fg(args) {
        if (this.parent.jobs.length === 0) {
            return { error: 'fg: no job control' };
        }
        
        let targetJob;
        
        if (args.length === 0) {
            // Default to current job
            targetJob = this.parent.jobs.find(j => j.id === this.parent.currentJob);
        } else {
            // Parse job spec: %1, %%, %+, %-
            const jobSpec = args[0];
            
            if (jobSpec === '%%' || jobSpec === '%+') {
                targetJob = this.parent.jobs.find(j => j.id === this.parent.currentJob);
            } else if (jobSpec === '%-') {
                targetJob = this.parent.jobs.find(j => j.id === this.parent.previousJob);
            } else if (jobSpec.startsWith('%')) {
                const jobId = parseInt(jobSpec.slice(1));
                targetJob = this.parent.jobs.find(j => j.id === jobId);
            } else {
                const jobId = parseInt(jobSpec);
                targetJob = this.parent.jobs.find(j => j.id === jobId);
            }
        }
        
        if (!targetJob) {
            return { error: 'fg: no such job' };
        }
        
        // Move job to foreground
        targetJob.state = 'Running';
        targetJob.background = false;
        
        // Update current job
        this.parent.previousJob = this.parent.currentJob;
        this.parent.currentJob = targetJob.id;
        
        return { output: targetJob.command };
    }

    bg(args) {
        if (this.parent.jobs.length === 0) {
            return { error: 'bg: no job control' };
        }
        
        let targetJob;
        
        if (args.length === 0) {
            // Default to current job
            targetJob = this.parent.jobs.find(j => j.id === this.parent.currentJob);
        } else {
            // Parse job spec
            const jobSpec = args[0];
            
            if (jobSpec === '%%' || jobSpec === '%+') {
                targetJob = this.parent.jobs.find(j => j.id === this.parent.currentJob);
            } else if (jobSpec === '%-') {
                targetJob = this.parent.jobs.find(j => j.id === this.parent.previousJob);
            } else if (jobSpec.startsWith('%')) {
                const jobId = parseInt(jobSpec.slice(1));
                targetJob = this.parent.jobs.find(j => j.id === jobId);
            } else {
                const jobId = parseInt(jobSpec);
                targetJob = this.parent.jobs.find(j => j.id === jobId);
            }
        }
        
        if (!targetJob) {
            return { error: 'bg: no such job' };
        }
        
        // Move job to background
        targetJob.state = 'Running';
        targetJob.background = true;
        
        return { output: `[${targetJob.id}]+ ${targetJob.command} &` };
    }

    disown(args) {
        const flags = this.parseFlags(args, ['a', 'h', 'r']);
        
        if (flags.a) {
            // Remove all jobs
            const count = this.parent.jobs.length;
            this.parent.jobs = [];
            this.parent.currentJob = null;
            this.parent.previousJob = null;
            return { output: '' };
        }
        
        let targetJob;
        
        if (flags.args.length === 0) {
            // Default to current job
            targetJob = this.parent.jobs.find(j => j.id === this.parent.currentJob);
        } else {
            const jobSpec = flags.args[0];
            
            if (jobSpec.startsWith('%')) {
                const jobId = parseInt(jobSpec.slice(1));
                targetJob = this.parent.jobs.find(j => j.id === jobId);
            } else {
                const jobId = parseInt(jobSpec);
                targetJob = this.parent.jobs.find(j => j.id === jobId);
            }
        }
        
        if (!targetJob) {
            return { error: 'disown: no such job' };
        }
        
        // Remove job from job table
        const jobId = targetJob.id;
        this.parent.jobs = this.parent.jobs.filter(j => j.id !== jobId);
        
        // Update current/previous job pointers
        if (this.parent.currentJob === jobId) {
            this.parent.currentJob = this.parent.jobs.length > 0 ? this.parent.jobs[0].id : null;
        }
        if (this.parent.previousJob === jobId) {
            this.parent.previousJob = this.parent.jobs.length > 1 ? this.parent.jobs[1].id : null;
        }
        
        return { output: '' };
    }

    nohup(args) {
        if (args.length === 0) {
            return { error: 'nohup: missing operand\nTry \'nohup --help\' for more information.' };
        }
        
        const command = args.join(' ');
        
        // Create a background job that ignores HUP signal
        const newJob = {
            id: this.parent.jobCounter++,
            pid: 30000 + this.parent.jobCounter,
            command: `nohup ${command}`,
            state: 'Running',
            background: true,
            nohup: true,
            user: this.fs.currentUser
        };
        
        this.parent.jobs.push(newJob);
        
        // Update current/previous job pointers
        this.parent.previousJob = this.parent.currentJob;
        this.parent.currentJob = newJob.id;
        
        // Add to process list
        this.processes.push({
            pid: newJob.pid,
            user: newJob.user,
            cpu: 0.0,
            mem: 0.1,
            command: newJob.command
        });
        
        return { output: `nohup: ignoring input and appending output to 'nohup.out'` };
    }

    // Helper method to suspend current foreground job (called by Terminal on Ctrl+Z)
    suspendCurrentJob(command) {
        const newJob = {
            id: this.parent.jobCounter++,
            pid: 20000 + this.parent.jobCounter,
            command: command,
            state: 'Stopped',
            background: true,
            user: this.fs.currentUser
        };
        
        this.parent.jobs.push(newJob);
        
        // Update current/previous job pointers
        this.parent.previousJob = this.parent.currentJob;
        this.parent.currentJob = newJob.id;
        
        return { output: `\n[${newJob.id}]+  Stopped                 ${command}` };
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
    window.JobControlCommands = JobControlCommands;
}
